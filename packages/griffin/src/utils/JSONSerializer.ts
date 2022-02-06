function jsonReplacer(_key: string, value: unknown) {
  if (typeof value === 'function') return '##FUNCTION##' + value.toString()
  return value
}

function jsonReviver(_key: string, value: unknown) {
  if (typeof value === 'string' && value.startsWith('##FUNCTION##')) {
    const fn = value.replace('##FUNCTION##', '')
    return new Function('return ' + fn)()
  }

  return value
}

export function serialize(object: Record<string, unknown>) {
  return JSON.stringify(object, jsonReplacer)
}

export function deserialize(json: string) {
  return JSON.parse(json, jsonReviver)
}
