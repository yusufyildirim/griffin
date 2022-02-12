import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import type { HMRService } from '@griffin/metro'

export function runGriffinServer(hmrService: HMRService) {
  const app = express()
  const server = http.createServer(app)

  const io = new Server(server)

  io.on('connection', socket => {
    console.log('a user connected')
    socket.on('MOUNT_COMPONENT', (componentId, props, callback) => {
      socket.broadcast.emit('CLIENT_MOUNT_COMPONENT', componentId, props)
      callback()
    })

    socket.on('COMPONENT_MOUNTED', id => {
      socket.broadcast.emit('COMPONENT_MOUNTED', id)
    })

    socket.on('COLLECT_COVERAGE', () => {
      socket.broadcast.emit('COLLECT_COVERAGE')
    })

    socket.on('COLLECT_COVERAGE_RESPONSE', (coverage: Record<string, any>) => {
      socket.broadcast.emit('COLLECT_COVERAGE_RESPONSE', coverage)
    })

    socket.on(
      'MOCK_MODULE',
      async (originalModulePath: string, mockModulePath: string, callback) => {
        const payload = await hmrService.mockModule(
          '/Users/yusufyildirim/development/griffin/apps/griffin-test-app/hooks/useUser.js',
          '/Users/yusufyildirim/development/griffin/apps/griffin-test-app/hooks/useUser.griffin.mock.js',
        )

        hmrService.emit({ type: 'update', body: payload })
        callback()
      },
    )
  })

  server.listen(5678, () => {
    console.log('Griffin Server has started on *:5678!')
  })
}
