import { registerRootComponent } from 'expo'
import { SafeAreaView } from 'react-native-safe-area-context'
import GriffinRoot from 'griffin/src/GriffinRoot'
import components from './.griffin/components'

registerRootComponent(() => <GriffinRoot components={components} Wrapper={SafeAreaView} />)
