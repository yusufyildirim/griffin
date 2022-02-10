import { mount, mock } from 'griffin'

describe('Profile Info', () => {
  it('renders text', async () => {
    await mount('PROFILE_INFO')
    // await mock('../../hooks/useUser.js', 'useUser')
    await expect(element(by.text('Authenticated!'))).toBeVisible()
  })
})
