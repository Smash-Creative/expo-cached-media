import React, { useEffect, useState, useRef } from 'react'
import {
  Image,
  ImageBackground,
  ImageBackgroundComponent,
  ImageBackgroundProps,
  ImageComponent,
  ImageProps,
  ImageURISource,
} from 'react-native'
import * as FileSystem from 'expo-file-system'
import { IMAGE_CACHE_FOLDER } from './constants'
import { getFileNameFromUri } from './utils'

interface CachedImageURISource extends ImageURISource {
  uri: string
  expiresIn?: number
}

export interface CachedImageProps {
  source: CachedImageURISource
  cacheKey: string
  rest: { [key: string]: any }
  placeholderContent: React.ReactElement
}

export const CachedImage = ({
  source,
  cacheKey = getFileNameFromUri(source.uri),
  placeholderContent = <></>,
  rest,
}: CachedImageProps & (ImageProps | ImageBackgroundProps)): React.ReactElement<
  ImageComponent | ImageBackgroundComponent
> => {
  const { uri, headers, expiresIn } = source
  const fileUri = `${IMAGE_CACHE_FOLDER}${cacheKey}`
  const _callback = (downloadProgress?: FileSystem.DownloadProgressData) => {
    if (componentIsMounted.current === false) {
      downloadResumableRef.current.pauseAsync()
      FileSystem.deleteAsync(fileUri, { idempotent: true }) // delete file locally if it was not downloaded properly
    }
    return downloadProgress
  }

  const [imgUri, setImgUri] = useState<string | null>(fileUri)

  const componentIsMounted = useRef(true)
  const requestOption = headers ? { headers } : {}
  const downloadResumableRef = useRef(
    FileSystem.createDownloadResumable(uri, fileUri, requestOption, _callback),
  )

  useEffect(() => {
    loadImage()
    return () => {
      componentIsMounted.current = false
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadImage = async () => {
    try {
      // Use the cached image if it exists
      const metadata: FileSystem.FileInfo = await FileSystem.getInfoAsync(
        fileUri,
      )
      const expired =
        expiresIn &&
        'modificationTime' in metadata &&
        new Date().getTime() / 1000 - metadata.modificationTime > expiresIn
      // console.log({expiresIn, expired})
      // console.log({modificationTime: metadata.modificationTime, currentTime: new Date().getTime() / 1000})
      // console.log({metadata})
      if (!metadata.exists || metadata?.size === 0 || expired) {
        if (componentIsMounted.current) {
          setImgUri(null)

          if (expired) {
            await FileSystem.deleteAsync(fileUri, { idempotent: true })
          }
          // download to cache
          setImgUri(null)

          const response = await downloadResumableRef.current.downloadAsync()
          if (componentIsMounted.current && response?.status === 200) {
            setImgUri(`${fileUri}?`) // deep clone to force re-render
          }
          if (response?.status !== 200) {
            FileSystem.deleteAsync(fileUri, { idempotent: true }) // delete file locally if it was not downloaded properly
          }
        }
      }
    } catch (err) {
      // console.log({ err })
    }
  }

  // console.log({placeholderContent})
  if (!imgUri) return placeholderContent

  if (rest?.children)
    return (
      <ImageBackground
        source={{
          ...(source as CachedImageURISource),
          uri: imgUri,
        }}
        {...rest}
      />
    )
  return (
    <Image
      source={{
        ...(source as CachedImageURISource),
        uri: imgUri,
      }}
      {...rest}
    />
  )
}
