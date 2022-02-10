function generateIdentifier(length = 8): string {
  const alphabet = '23456789qwertyuipasdfghjkzxcvbnm'
  let result = ''
  for (let i = 0; i < length; i++) {
    const j = Math.floor(Math.random() * alphabet.length)
    const c = alphabet.substr(j, 1)
    result += c
  }
  return result
}

export default {
  generateIdentifier,
}
