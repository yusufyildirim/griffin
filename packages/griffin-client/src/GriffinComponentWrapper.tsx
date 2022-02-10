import React from 'react'
import { Socket } from 'socket.io-client'

type GriffinComponentWrapperProps = {
  id: string
  socket: Socket
}

const GriffinComponentWrapper: React.FC<GriffinComponentWrapperProps> = ({
  id,
  socket,
  children,
}) => {
  React.useEffect(() => {
    // To make sure component rendered before letting tests continue running
    socket.emit('COMPONENT_MOUNTED', id)
  }, [])

  return <>{children}</>
}

export default GriffinComponentWrapper
