import { mount } from 'griffin'

describe('Button', () => {
  it('renders', async () => {
    const mahmut = 1
    const onPress = () => console.log(`Hadi lan`)
    await mount('BUTTON', { text: 'Wohooo', onPress })

    await expect(element(by.text(text))).toBeVisible()
  })
})
