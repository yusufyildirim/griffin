import * as griffin from 'griffin'

beforeAll(async () => {
  console.log('Champ?')
  await device.launchApp()
  await griffin.init()
})

afterAll(async () => {
  await griffin.down()
})
