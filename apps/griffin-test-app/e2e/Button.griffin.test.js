import { mount } from 'griffin'

describe('Button', () => {
  it('renders', async () => {
    const onPress = () => console.log(`Test`)
    await mount('BUTTON', { text: 'Wohooo', onPress })

    await expect(element(by.text('Wohooo'))).toBeVisible()
  })
})
