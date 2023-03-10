import * as FileSystem from 'expo-file-system'
import { IMAGE_CACHE_FOLDER } from './constants'
import { getFileNameFromUri } from './utils'

export const CacheManager = {
  addToCacheAsync: async ({
    file,
    key = getFileNameFromUri(file),
  }: {
    file: string
    key: string
  }) => {
    await FileSystem.copyAsync({
      from: file,
      to: `${IMAGE_CACHE_FOLDER}${key}`,
    })
    // const uri = await FileSystem.getContentUriAsync(`${CONST.IMAGE_CACHE_FOLDER}${key}`)
    // return uri
    const uri = await CacheManager.getCachedUriAsync({ key })
    return uri
  },

  getCachedUriAsync: async ({ key }: { key: string }) => {
    const uri = await FileSystem.getContentUriAsync(
      `${IMAGE_CACHE_FOLDER}${key}`,
    )
    return uri
  },

  downloadAsync: async ({
    uri,
    key = getFileNameFromUri(uri),
    options,
  }: {
    uri: string
    key: string
    options: FileSystem.DownloadOptions
  }) => {
    return await FileSystem.downloadAsync(
      uri,
      `${IMAGE_CACHE_FOLDER}${key}`,
      options,
    )
  },
}
