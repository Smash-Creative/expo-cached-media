import React, {
  useEffect,
  useState,
  useRef,
  // Suspense,
  forwardRef,
  // lazy,
} from 'react'
import * as FileSystem from 'expo-file-system'
// import { getFileNameFromUri } from './utils'
import {
  Image,
  ImageBackground,
  ImageBackgroundComponent,
  ImageBackgroundProps,
  ImageComponent,
  ImageProps,
} from 'react-native'
import { Video, VideoProps } from 'expo-av'

interface CachedMediaURISource {
  uri: string
  headers?: { [key: string]: string }
  expiresIn?: number
}

export interface CachedMediaProps {
  source: CachedMediaURISource
  cacheKey?: string
  placeholderContent?: React.ReactElement
  children?: React.ReactNode
  rest?: { [key: string]: any }
}

type VideoComponent = typeof Video

export const MEDIA_CACHE_FOLDER = `${FileSystem.cacheDirectory}`
// export const MEDIA_DOCUMENT_FOLDER = `${FileSystem.documentDirectory}media/`

// const Image = lazy(() => import('./suspense/Image'))
// const ImageBackground = lazy(() => import('./suspense/ImageBackground'))
// const Video = lazy(() => import('./suspense/Video'))

const getFileNameFromUri = (uri: string) => {
  return uri
    .substring(uri.lastIndexOf('/') + 1)
    .split('?')[0]
    .split('#')[0]
}

const CacheManager = {
  addToCacheAsync: async ({
    file,
    key = getFileNameFromUri(file),
  }: {
    file: string
    key: string
  }) => {
    await FileSystem.copyAsync({
      from: file,
      to: `${MEDIA_CACHE_FOLDER}${key}`,
    })
    // const uri = await FileSystem.getContentUriAsync(`${CONST.IMAGE_CACHE_FOLDER}${key}`)
    // return uri
    const uri = await CacheManager.getCachedUriAsync({ key })
    return uri
  },

  getCachedUriAsync: async ({ key }: { key: string }) => {
    const uri = await FileSystem.getContentUriAsync(
      `${MEDIA_CACHE_FOLDER}${key}`,
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
      `${MEDIA_CACHE_FOLDER}${key}`,
      options,
    )
  },
}

function createCachedMediaElement<T>(name: 'CachedImage' | 'CachedVideo') {
  const CachedMediaElement = forwardRef<T, CachedMediaProps>((props, ref) => {
    const {
      source,
      cacheKey = getFileNameFromUri(source.uri),
      placeholderContent = <></>,
      children,
      rest,
    } = props
    const { uri, headers, expiresIn } = source
    const fileUri = `${MEDIA_CACHE_FOLDER}${cacheKey}`
    const _callback = (downloadProgress?: FileSystem.DownloadProgressData) => {
      if (componentIsMounted.current === false) {
        downloadResumableRef.current.pauseAsync()
        FileSystem.deleteAsync(fileUri, { idempotent: true }) // delete file locally if it was not downloaded properly
      }
      return downloadProgress
    }

    const [mediaUri, setMediaUri] = useState<string | null>(fileUri)

    const componentIsMounted = useRef(true)
    const requestOption = headers ? { headers } : {}
    const downloadResumableRef = useRef(
      FileSystem.createDownloadResumable(
        uri,
        fileUri,
        requestOption,
        _callback,
      ),
    )

    useEffect(() => {
      loadMedia()
      return () => {
        componentIsMounted.current = false
      }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const loadMedia = async () => {
      try {
        // Use the cached media if it exists
        const metadata: FileSystem.FileInfo = await FileSystem.getInfoAsync(
          fileUri,
        )
        const expired =
          expiresIn &&
          'modificationTime' in metadata &&
          new Date().getTime() / 1000 - metadata.modificationTime > expiresIn

        if (!metadata.exists || metadata?.size === 0 || expired) {
          if (componentIsMounted.current) {
            setMediaUri(null)

            if (expired) {
              await FileSystem.deleteAsync(fileUri, { idempotent: true })
            }
            // download to cache
            setMediaUri(null)

            const response = await downloadResumableRef.current.downloadAsync()
            if (componentIsMounted.current && response?.status === 200) {
              setMediaUri(`${fileUri}?`) // deep clone to force re-render
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

    const MediaComponent = (
      props: Omit<CachedMediaProps, 'cacheKey'> &
        (ImageProps | ImageBackgroundProps | VideoProps),
    ) => {
      if (name === 'CachedVideo') {
        return (
          <Video
            {...props}
            // @ts-expect-error TS + forwardRef = 💩
            ref={ref as React.ForwardedRef<VideoComponent>}
          />
        )
      }
      if (name === 'CachedImage' && children) {
        return (
          <ImageBackground
            {...props}
            // @ts-expect-error TS + forwardRef = 💩
            ref={ref as React.ForwardedRef<ImageBackgroundComponent>}
          />
        )
      }
      return (
        <Image
          {...props}
          // @ts-expect-error TS + forwardRef = 💩
          ref={ref as React.ForwardedRef<ImageComponent>}
        />
      )
    }

    if (!mediaUri) return placeholderContent

    return (
      <MediaComponent
        source={{
          ...source,
          uri: mediaUri,
        }}
        {...rest}
      >
        {children}
      </MediaComponent>
    )
  })

  CachedMediaElement.displayName = name

  return CachedMediaElement
}

const CachedImage = createCachedMediaElement<
  ImageComponent | ImageBackgroundComponent
>('CachedImage')
const CachedVideo = createCachedMediaElement<VideoComponent>('CachedVideo')

export { CacheManager, CachedImage, CachedVideo }
