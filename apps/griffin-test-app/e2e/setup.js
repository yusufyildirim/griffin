import * as griffin from 'griffin'

beforeAll(async () => {
  await device.launchApp()
  await griffin.init()
})

afterAll(async () => {
  await griffin.down()
})
