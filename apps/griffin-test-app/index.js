import { registerRootComponent } from 'expo'
import { SafeAreaView } from 'react-native-safe-area-context'
import App from './App'
import GriffinRoot from 'griffin/src/GriffinRoot'
import components from './.griffin/components'

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
// registerRootComponent(App);
registerRootComponent(() => <GriffinRoot components={components} Wrapper={SafeAreaView} />)
