import * as React from 'react'
import { View } from 'react-native'
import { io, Socket } from 'socket.io-client'
import { v4 as uuidv4 } from 'uuid'

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
type GriffinRootProps = {
  components: Record<string, React.ComponentType>
}
export default function GriffinRoot({ components }: GriffinRootProps) {
  const [Component, setComponent] = React.useState<JSX.Element | null>(null)
  const socket = useSocket()

  React.useEffect(() => {
    socket.on('connect', () => {
      console.log('Component Socket ID', socket.id)
    })

    socket.on('CLIENT_MOUNT_COMPONENT', (componentId: string, props: Record<string, unknown>) => {
      console.log('Props', props)
      const Comp = components[componentId]
      setComponent(<Comp key={uuidv4()} {...props} />)
    })
    const C = components['TEXT']
    setComponent(<C children="wtfa" />)
  }, [socket])

  return <View style={{ flex: 1 }}>{Component}</View>
}
