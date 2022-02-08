import useUser from '../../hooks/useUser'
import Text from '../Text/Text'

export default function ProfileInfo() {
  const user = useUser()

  if (user.authenticated) return <Text>Authenticated!</Text>
  return <Text>Not Authenticated!</Text>
}
