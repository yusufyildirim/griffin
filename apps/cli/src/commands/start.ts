import { Command, Flags } from '@oclif/core'
import type { WebSocketServer } from 'ws'
import Metro from 'metro'
import hmrJsBundle from 'metro/src/DeltaBundler/Serializers/hmrJsBundle'
import { createDevServerMiddleware as createReactNativeDevServerMiddleware } from '@react-native-community/cli-server-api'

export default class Start extends Command {
  static description = 'describe the command here'

  static examples = ['<%= config.bin %> <%= command.id %>']

  static flags = {
    // flag with a value (-n, --name=VALUE)
    name: Flags.string({ char: 'n', description: 'name to print' }),
    // flag with no value (-f, --force)
    force: Flags.boolean({ char: 'f' }),
  }

  static args = [{ name: 'file' }]

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Start)

    const config = await Metro.loadConfig()

    // A quick workaround to make metro respect to babel.config.js
    // @ts-ignore
    config.transformer.babelTransformerPath = require.resolve(
      'metro-react-native-babel-transformer',
    )
    // @ts-ignore
    config.resetCache = true
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
    const _httpServer = await Metro.runServer(config, {
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
      return code
    }

    // Just to trigger it automatically
    // setTimeout(async () => {
    //   const payload = await generateHMRPayload(
    //     '/Users/yusufyildirim/development/griffin/apps/griffin-test-app/hooks/useUser.js',
    //   )
    //   console.log('HMR Payload', payload)
    // }, 5000)

    // const payloadExample = {
    //   type: 'update',
    //   body: {
    //     revisionId: 'fa16fe01642ee186fa16fe016',
    //     isInitialUpdate: false,
    //     added: [],
    //     modified: [
    //       {
    //         module: [
    //           606,
    //           '__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {\n' +
    //             '  Object.defineProperty(exports, "__esModule", {\n' +
    //             '    value: true\n' +
    //             '  });\n' +
    //             '  exports.default = useUser;\n' +
    //             '\n' +
    //             '  function useUser() {\n' +
    //             '    return {\n' +
    //             '      authenticated: false\n' +
    //             '    };\n' +
    //             '  }\n' +
    //             '},606,[],"hooks/useUser.js",{"3":[],"606":[3]});\n' +
    //             '//# sourceMappingURL=http://localhost:8081/hooks/useUser.map?platform=ios&modulesOnly=true&app=org.name.griffintestapp&dev=true&minify=false&runModule=true&shallow=true\n' +
    //             '//# sourceURL=http://localhost:8081/hooks/useUser.bundle?platform=ios&modulesOnly=true&app=org.name.griffintestapp&dev=true&minify=false&runModule=true&shallow=true\n',
    //         ],
    //         sourceMappingURL:
    //           'http://localhost:8081/hooks/useUser.map?platform=ios&modulesOnly=true&app=org.name.griffintestapp&dev=true&minify=false&runModule=true&shallow=true',
    //         sourceURL:
    //           'http://localhost:8081/hooks/useUser.bundle?platform=ios&modulesOnly=true&app=org.name.griffintestapp&dev=true&minify=false&runModule=true&shallow=true',
    //       },
    //     ],
    //     deleted: [],
    //   },
    // }

    this.log('Griffin Server Started!')
  }
}
