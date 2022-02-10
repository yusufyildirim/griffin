import { mount } from 'griffin'

const text = 'Hello!'

describe('Example', () => {
  it('renders text', async () => {
    await mount('TEXT', { children: text })
    await expect(element(by.text(text))).toBeVisible()
  })

  it('renders blue text', async () => {
    await mount('TEXT', { children: text, style: { color: 'blue' } })
    await expect(element(by.text(text))).toBeVisible()
  })

  it('renders red text', async () => {
    await mount('TEXT', { children: text, style: { color: 'red' } })
    await expect(element(by.text(text))).toBeVisible()
  })

  it('renders text with margin', async () => {
    await mount('TEXT', { children: text, style: { marginTop: 50 } })
    await expect(element(by.text(text))).toBeVisible()
  })
})
