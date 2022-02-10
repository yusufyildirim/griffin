import { io, Socket } from 'socket.io-client'
import { JSONSerializer } from '@griffin/utils'
import path from 'path'

let socket: Socket | undefined

export async function init() {
  return new Promise((resolve, _reject) => {
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

export async function mount(componentId: string, props?: Record<string, unknown>) {
  return new Promise((resolve, reject) => {
    socket?.emit(
      'MOUNT_COMPONENT',
      componentId,
      JSONSerializer.serialize(props || {}),
      (err: unknown) => {
        if (err) reject(err)
      },
    )

    socket?.on('COMPONENT_MOUNTED', id => {
      if (id === componentId) resolve(componentId)
    })
  })
}

export async function mock(targetModulePath: string, mockId: string) {
  const absoluteModulePath = path.resolve(targetModulePath)
  console.log(`Mocking ${absoluteModulePath} with ${mockId}...`)
}
