import * as React from 'react'
import { View } from 'react-native'
import GriffinComponentWrapper from './GriffinComponentWrapper'
import { useSocket } from './hooks/useSocket'
import { JSONSerializer, Random } from '@griffin/utils'

type GriffinRootProps = {
  components: Record<string, React.ComponentType>
  Wrapper: React.ComponentType
}
export default function GriffinRoot({ components, Wrapper }: GriffinRootProps) {
  const internalComponentRef = React.useRef<{ id: string; uniqueId: string }>()
  const [Component, setComponent] = React.useState<JSX.Element | null>(null)
  const socket = useSocket()

  React.useEffect(() => {
    socket.on('connect', () => {
      console.log('Component Socket ID', socket.id)
    })

    socket.on('CLIENT_MOUNT_COMPONENT', (componentId: string, serializedProps: string, _cb) => {
      const props = JSONSerializer.deserialize(serializedProps)
      const Comp = components[componentId]

      if (Comp) {
        internalComponentRef.current = { id: componentId, uniqueId: Random.generateIdentifier() }
        setComponent(<Comp {...props} />)
      }
    })
  }, [socket])

  if (!internalComponentRef.current?.id) return null
  if (Wrapper) {
    return (
      <Wrapper>
        <GriffinComponentWrapper
          key={internalComponentRef.current.uniqueId}
          socket={socket}
          id={internalComponentRef.current.id}>
          {Component}
        </GriffinComponentWrapper>
      </Wrapper>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <GriffinComponentWrapper
        key={internalComponentRef.current.uniqueId}
        socket={socket}
        id={internalComponentRef.current.id}>
        {Component}
      </GriffinComponentWrapper>
    </View>
  )
}
