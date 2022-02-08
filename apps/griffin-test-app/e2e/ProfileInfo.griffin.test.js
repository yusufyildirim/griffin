import { mount } from 'griffin'

describe('Profile Info', () => {
  it('renders text', async () => {
    await mount('PROFILE_INFO', { children: text })
    await expect(element(by.text(text))).toBeVisible()
  })
})
