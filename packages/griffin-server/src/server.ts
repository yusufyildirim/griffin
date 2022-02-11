import express from 'express'
import http from 'http'
import { Server } from 'socket.io'

export function runGriffinServer() {
  const app = express()
  const server = http.createServer(app)

  const io = new Server(server)

  io.on('connection', socket => {
    console.log('a user connected')
    socket.on('MOUNT_COMPONENT', (componentId, props, callback) => {
      console.log(componentId, props, callback)
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
  })

  server.listen(5678, () => {
    console.log('Griffin Server has started on *:5678!')
  })
}
