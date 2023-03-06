import React, { useEffect, useState, useRef } from "react"

import { Image, ImageBackground } from "react-native"
import * as FileSystem from "expo-file-system"

export const IMAGE_CACHE_FOLDER = `${FileSystem.cacheDirectory}`
// export const IMAGE_CACHE_FOLDER = `${FileSystem.documentDirectory}images/`

const CachedImage = ({
  source: {
    uri,
    headers,
    expiresIn,
  }, 
  cacheKey,
  placeholderContent,
  children,
}: {
  source: {
    uri: string;
    headers: {[key: string]: any};
    expiresIn: number;
  };
  cacheKey: string;
  placeholderContent: React.ReactNode;
  children: React.ReactNode;
}) => {
  const fileURI = `${IMAGE_CACHE_FOLDER}${cacheKey}`

  const [imgUri, setImgUri] = useState(fileURI)

  const componentIsMounted = useRef(true)
  const requestOption = headers ? { headers } : {}
  const downloadResumableRef = useRef(
    FileSystem.createDownloadResumable(uri, fileURI, requestOption, _callback),
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
      const metadata = await FileSystem.getInfoAsync(fileURI)
      const expired =
        expiresIn &&
        new Date().getTime() / 1000 - metadata?.modificationTime > expiresIn
      // console.log({expiresIn, expired})

      // console.log({modificationTime: metadata.modificationTime, currentTime: new Date().getTime() / 1000})
      // console.log({metadata})
      if (!metadata.exists || metadata?.size === 0 || expired) {
        if (componentIsMounted.current) {
          setImgUri(null)

          if (expired) {
            await FileSystem.deleteAsync(fileURI, { idempotent: true })
          }
          // download to cache
          setImgUri(null)

          const response = await downloadResumableRef.current.downloadAsync()
          if (componentIsMounted.current && response.status === 200) {
            setImgUri(`${fileURI}?`) // deep clone to force re-render
          }
          if (response.status !== 200) {
            FileSystem.deleteAsync(fileURI, { idempotent: true }) // delete file locally if it was not downloaded properly
          }
        }
      }
    } catch (err) {
      // console.log({ err })
    }
  }

  const _callback = (downloadProgress) => {
    if (componentIsMounted.current === false) {
      downloadResumableRef.current.pauseAsync()
      FileSystem.deleteAsync(fileURI, { idempotent: true }) // delete file locally if it was not downloaded properly
    }
  }
  // console.log({placeholderContent})
  if (!imgUri) return placeholderContent || null
  
  if (children) return(
    <ImageBackground
      source={{
        ...source,
        uri: imgUri
      }}
      placeholderContent={placeHolderContent}
      {...rest}
    >
      {children}
    </ImageBackground>
  )
  return (
    <Image
      source={{
        ...source,
        uri: imgUri,
      }}
      placeholderContent={placeHolderContent}
      {...rest}
    />
  )
}

export const CacheManager = {
  addToCache: async ({ file, key }) => {
    await FileSystem.copyAsync({
      from: file,
      to: `${IMAGE_CACHE_FOLDER}${key}`,
    })
    // const uri = await FileSystem.getContentUriAsync(`${CONST.IMAGE_CACHE_FOLDER}${key}`)
    // return uri
    const uri = await CacheManager.getCachedUri({ key })
    return uri
  },

  getCachedUri: async ({ key }) => {
    const uri = await FileSystem.getContentUriAsync(
      `${IMAGE_CACHE_FOLDER}${key}`,
    )
    return uri
  },

  downloadAsync: async ({ uri, key, options }) => {
    return await FileSystem.downloadAsync(
      uri,
      `${IMAGE_CACHE_FOLDER}${key}`,
      options,
    )
  },
}

export default CachedImage
