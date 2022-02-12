/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { WebSocketServer } from 'ws'
import Metro, { HmrServer, WebsocketEndpoints } from 'metro'
import { createDevServerMiddleware as createReactNativeDevServerMiddleware } from '@react-native-community/cli-server-api'
import HMRService from './hmr'
import { Server } from 'http'

export async function runMetro(): Promise<[Server, HMRService]> {
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

  const websocketEndpoints: WebsocketEndpoints = {}
  const httpServer = await Metro.runServer(config, {
    hmrEnabled: true,
    websocketEndpoints,
  })

  const { HMRServer } = websocketEndpoints['/hot'] as WebSocketServer & {
    HMRServer: HmrServer<any>
  }

  const hmrService = new HMRService(HMRServer)

  return [httpServer, hmrService]
}
