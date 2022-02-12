import { mount, mock, collectCoverage } from 'griffin'

describe('Profile Info', () => {
  it('renders authenticated', async () => {
    await mount('PROFILE_INFO')
    await expect(element(by.text('Authenticated!'))).toBeVisible()
  })

  it('renders not authenticated', async () => {
    await mount('PROFILE_INFO')
    await mock('./hooks/useUser.js', 'useUser')
    await expect(element(by.text('Not Authenticated!'))).toBeVisible()
  })
})
