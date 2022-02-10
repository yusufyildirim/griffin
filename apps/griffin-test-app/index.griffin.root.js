import { registerRootComponent } from 'expo'
import { SafeAreaView } from 'react-native-safe-area-context'
import GriffinRoot from '@griffin/client'
import components from './.griffin/components'
// We should import it to make sure mock files are in the bundle
import mocks from './.griffin/mocks'

registerRootComponent(() => <GriffinRoot components={components} Wrapper={SafeAreaView} />)
