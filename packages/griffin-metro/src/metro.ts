import type { WebSocketServer } from 'ws'
import Metro from 'metro'
import hmrJsBundle from 'metro/src/DeltaBundler/Serializers/hmrJsBundle'
import { createDevServerMiddleware as createReactNativeDevServerMiddleware } from '@react-native-community/cli-server-api'

export async function runMetro() {
  const config = await Metro.loadConfig()

  // A quick workaround to make metro respect to babel.config.js
  // @ts-ignore
  config.transformer.babelTransformerPath = require.resolve('metro-react-native-babel-transformer')

  // @ts-ignore
  // config.resetCache = true
  const { middleware, attachToServer } = createReactNativeDevServerMiddleware({
    port: config.server.port,
    watchFolders: config.watchFolders,
  })

  const customEnhanceMiddleware = config.server.enhanceMiddleware
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore can't mutate readonly config
  config.server.enhanceMiddleware = (metroMiddleware: any, server: Metro.Server) => {
    if (customEnhanceMiddleware) {
      metroMiddleware = customEnhanceMiddleware(metroMiddleware, server)
    }

    return middleware.use(metroMiddleware)
  }

  type HMRWebSocket = WebSocketServer & { HMRServer: any }
  const websocketEndpoints: Record<string, HMRWebSocket> = {}
  const httpServer = await Metro.runServer(config, {
    hmrEnabled: true,
    websocketEndpoints,
  })

  const hotWs = websocketEndpoints['/hot']
  const HMRServer = hotWs.HMRServer
  const bundler = HMRServer._bundler
  const clientGroups: Map<string, any> = HMRServer._clientGroups

  const generateHMRPayload = async (filePath: string) => {
    const firstKey: string = clientGroups.keys().next().value
    const group = clientGroups.get(firstKey)

    const revPromise = bundler.getRevision(group.revisionId)
    if (!revPromise) return

    const { revision, delta } = await bundler.updateGraph(await revPromise, false)
    const options = {
      createModuleId: HMRServer._createModuleId,
      projectRoot: HMRServer._config.projectRoot,
      clientUrl: group.clientUrl,
    }

    delta.modified = new Map().set(
      filePath,
      (revision.graph.dependencies as Map<string, any>).get(filePath),
    )

    const code: any = hmrJsBundle(delta, revision.graph, options)

    return {
      revisionId: revision.id,
      isInitialUpdate: false,
      ...code,
    }
  }

  function emit(payload: any) {
    const clientGroups = HMRServer._clientGroups as Map<string, any>
    const socketKey = clientGroups.keys().next()
    const sockets = clientGroups.get(socketKey.value).clients as Set<any>

    for (const socket of sockets) {
      socket.sendFn(JSON.stringify(payload))
    }
  }

  async function splitCode(path: string) {
    const payload = await generateHMRPayload(path)

    const [moduleId, moduleCode]: [moduleId: number, moduleCode: string] =
      payload.modified[0].module
    moduleCode.replaceAll('.griffin.mock', '').trim().split('\n')
    return payload
  }

  // Just to trigger it automatically
  // setTimeout(async () => {
  //   // ORIGINAL PAYLOAD
  //   const originalPayload = await generateHMRPayload(
  //     '/Users/yusufyildirim/development/griffin/apps/griffin-test-app/hooks/useUser.js',
  //   )
  //   const originalModule: [moduleId: number, moduleCode: string] =
  //     originalPayload.modified[0].module
  //   const [_originalModuleId, _originalModuleCode] = originalModule
  //   const splittedOriginalCode = originalModule[1].split(/\r?\n/)

  //   // MOCK PAYLOAD
  //   const mockPayload = await generateHMRPayload(
  //     '/Users/yusufyildirim/development/griffin/apps/griffin-test-app/hooks/useUser.griffin.mock.js',
  //   )

  //   const mockModule: [moduleId: number, moduleCode: string] = mockPayload.modified[0].module

  //   // Assign original module id to mock
  //   mockModule[0] = originalModule[0]

  //   mockModule[1] = mockModule[1].replaceAll('.griffin.mock', '')

  //   const splittedMockCode = mockModule[1].split(/\r?\n/)
  //   splittedMockCode[splittedMockCode.length - 4] =
  //     splittedOriginalCode[splittedOriginalCode.length - 4]

  //   mockModule[1] = splittedMockCode.join('\n').trimEnd()
  //   mockPayload.modified = [{ ...originalPayload.modified[0], module: mockModule }]

  //   emit({ type: 'update', body: mockPayload })
  // }, 10000)

  return httpServer
}
