import { io, Socket } from 'socket.io-client'

let socket: Socket | undefined

export async function init() {
  return new Promise((resolve, _reject) => {
    // console.log('Initializing Puff..')
    socket = io('ws://localhost:5678')
    socket.on('connect', () => {
      resolve(socket)
      console.log('Test Runner Socket ID', socket?.id)
    })
  })
}

export async function down() {
  socket?.close()
}

export async function mount(componentId: string, props: Record<string, unknown>) {
  console.log('Mounting...', componentId)
  // await device.reloadReactNative()

  return new Promise((resolve, reject) => {
    socket?.emit('MOUNT_COMPONENT', componentId, props || {}, (err: unknown) => {
      // console.log('Respwww')
      if (err) reject(err)

      resolve(componentId)
    })
  })
}
