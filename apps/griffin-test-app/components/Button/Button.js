import { TouchableOpacity } from 'react-native'
import Text from '../Text/Text'

export default function Button({ text, onPress }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{text}</Text>
    </TouchableOpacity>
  )
}
