import React from 'react'
import { io, Socket } from 'socket.io-client'

export const useSocket = () => {
  const [socket, _setSocket] = React.useState<Socket>(() => io('http://localhost:5678'))

  React.useEffect(() => {
    socket.open()

    return () => {
      socket.close()
    }
  }, [socket])

  return socket
}
