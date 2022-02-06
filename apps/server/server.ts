import express from 'express'
import http from 'http'
import { Server } from 'socket.io'

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

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
})

server.listen(5678, () => {
  console.log('listening on *:5678')
})
