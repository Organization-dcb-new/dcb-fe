export const removeEmpty = (obj: any) => {
  const newObj: any = {}
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== '' && obj[key] !== null && obj[key] !== undefined) {
      newObj[key] = obj[key]
    }
  })
  return newObj
}

export const highlightJSON = (json: string) => {
  return json
    .replace(/"(.*?)":/g, '<span class="text-blue-400">"$1"</span>:')
    .replace(/: "(.*?)"/g, ': <span class="text-green-400">"$1"</span>')
    .replace(/: ([0-9]+)/g, ': <span class="text-yellow-400">$1</span>')
    .replace(/true|false/g, '<span class="text-purple-400">$&</span>')
}

export const formatJSON = (obj: any) => {
  const cleaned = {
    headers: removeEmpty(obj.headers),
    body: removeEmpty(obj.body),
  }

  const jsonText = JSON.stringify(cleaned, null, 2)
  return highlightJSON(jsonText)
}
