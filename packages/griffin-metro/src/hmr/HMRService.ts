/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { HmrServer } from 'metro'
import hmrJsBundle, { HmrModule } from 'metro/src/DeltaBundler/Serializers/hmrJsBundle'

export type HMRPayload = {
  added: readonly HmrModule[]
  deleted: readonly number[]
  modified: readonly HmrModule[]
  revisionId: string
  isInitialUpdate: boolean
}

export default class HMRService {
  private hmrServer: HmrServer
  constructor(hmrServer: HmrServer) {
    this.hmrServer = hmrServer
  }

  emit(payload: any) {
    // Emits message to the first client
    // TODO: Yusuf: We need multiple client support here
    const clientGroups = this.hmrServer._clientGroups as Map<string, any>
    const socketKey = clientGroups.keys().next()
    const sockets = clientGroups.get(socketKey.value).clients as Set<any>

    for (const socket of sockets) {
      socket.sendFn(JSON.stringify(payload))
    }
  }

  private async generatePayload(filePath: string): Promise<HMRPayload> {
    const bundler = this.hmrServer._bundler
    const clientGroups = this.hmrServer._clientGroups

    const firstKey: string = clientGroups.keys().next().value
    const group = clientGroups.get(firstKey)

    if (!group) throw new Error('ERROR')

    const revPromise = bundler.getRevision(group.revisionId)
    if (!revPromise) throw new Error('ERROR')

    const { revision, delta } = await bundler.updateGraph(await revPromise, false)
    const options = {
      createModuleId: this.hmrServer._createModuleId,
      projectRoot: this.hmrServer._config.projectRoot,
      clientUrl: group.clientUrl,
    }

    // @ts-ignore
    delta.modified = new Map().set(
      filePath,
      (revision.graph.dependencies as Map<string, any>).get(filePath),
    )

    const code = hmrJsBundle(delta, revision.graph, options)

    return {
      revisionId: revision.id,
      isInitialUpdate: false,
      ...code,
    }
  }

  private getModuleCodeByLine(hmrPayload: HMRPayload) {
    const module = hmrPayload.modified[0].module

    // Split the code by line to make it an array and patching process easier
    return module[1].replaceAll('.griffin.mock', '').split(/\r?\n/)
  }

  private getModifiedModule(hmrPayload: HMRPayload) {
    return hmrPayload.modified[0]
  }

  private patchPayload(
    originalModulePayload: HMRPayload,
    mockModulePayload: HMRPayload,
  ): HMRPayload {
    const originalModule = this.getModifiedModule(originalModulePayload)

    const originalModuleCodeLines = this.getModuleCodeByLine(originalModulePayload)
    const mockModuleCodeLines = this.getModuleCodeByLine(mockModulePayload)

    // Apply patches

    // Apply original module inverted dependency map to mock module
    // So HMR can reload dependant modules on runtime
    mockModuleCodeLines[mockModuleCodeLines.length - 4] =
      originalModuleCodeLines[originalModuleCodeLines.length - 4]

    // Convert code to string again
    const mockModuleCode = mockModuleCodeLines.join('\n').trimEnd()

    return {
      ...originalModulePayload,
      modified: [{ ...originalModule, module: [originalModule.module[0], mockModuleCode] }],
    }
  }

  async mockModule(originalModulePath: string, mockModulePath: string): Promise<HMRPayload> {
    const originalModulePayload = await this.generatePayload(originalModulePath)
    const mockModulePayload = await this.generatePayload(mockModulePath)

    return this.patchPayload(originalModulePayload, mockModulePayload)
  }
}
