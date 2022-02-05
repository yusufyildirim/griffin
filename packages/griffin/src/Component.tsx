import * as React from 'react'
import { View } from 'react-native'
import { io, Socket } from 'socket.io-client'
import { v4 as uuidv4 } from 'uuid'
import bundles from './BUNDLES'

const useSocket = () => {
  const [socket, _setSocket] = React.useState<Socket>(() => io('http://localhost:5678'))

  React.useEffect(() => {
    socket.open()

    return () => {
      socket.close()
    }
  }, [socket])

  return socket
}

export default function App() {
  // const [Component, setComponent] = React.useState<React.LazyExoticComponent<() => JSX.Element>>()
  const [Component, setComponent] = React.useState<JSX.Element | null>(null)
  const socket = useSocket()

  React.useEffect(() => {
    socket.on('connect', () => {
      console.log('Component Socket ID', socket.id)
    })

    socket.on(
      'CLIENT_MOUNT_COMPONENT',
      (componentId: keyof typeof bundles, props: Record<string, unknown>) => {
        console.log('Props', props)
        const Comp: React.FC = bundles[componentId]
        setComponent(<Comp key={uuidv4()} {...props} />)
      },
    )
    // const C = bundles['HEADER_BACK_BUTTON']
    // setComponent(<C />)
  }, [socket])

  return <View style={{ flex: 1 }}>{Component}</View>
}
