export const getFileNameFromUri = (uri: string) => {
  return uri
    .substring(uri.lastIndexOf('/') + 1)
    .split('?')[0]
    .split('#')[0]
}
