# expo-cached-media
Super fast cached media component for react-native applications built with expo

## Usage
### Add to project
```
yarn add expo-cached-media
```
or
```
expo install expo-cached-media
```
### CachedImage
```JavaScript
import CachedImage from 'expo-cached-media'
```

Then it can be referenced in code like this:
```JavaScript
<CachedImage
  source={{ 
    uri: `${item.getThumbUrl}`, // (required) -- URI of the image to be cached
    headers: `Authorization: Bearer ${token}`, // (optional)            
    expiresIn: 2_628_288, // 1 month in seconds (optional), if not set -- will never expire and will be managed by the OS
  }}
  cacheKey={`${item.id}-thumb`} // (required) -- key to store image locally
  placeholderContent={( // (optional) -- shows while the image is loading
    <ActivityIndicator // can be any react-native tag
      color={
        CONST.MAIN_COLOR
      }
      size="small"
      style={{
        flex: 1,
        justifyContent: "center",
      }}
    />
  )} 
  resizeMode="contain" // pass-through to <Image /> tag 
  style={ // pass-through to <Image /> tag 
    styles.photoContainer
  }
/>
```        

`<CachedImage />` internally uses the `<Image />` and `<ImageBackground />` components from *'react-native'* (`<Image />` if child components are NOT specified, `<ImageBackground />` if children ARE present), so any properties that apply to the `<Image/>`/`<ImageBackground />` can be passed into the `<CachedImage/>`.

*cacheKey* is the only property that's `<CachedImage />` specific. The same *cacheKey* value should always be passed for the same *source* value. This is a little bit of an extra work from application development point of view, but this is how `expo-cached-media` achieves its performance. If not for *cacheKey*, the component would have to use some Crypto hash, which would add computational overhead. If you are rendering lots of images in a list on a screen -- this component will achieve the best performance.

### CacheManager
```JavaScript
import { CacheManager } from 'expo-cached-image'
```

If you have an image on local file system, which you want to add to cache, do this:
```JavaScript
photo.getImgUrl = await CacheManager.addToCache({
  file: `${CONST.PENDING_UPLOADS_FOLDER}${item}`,
  key: `${photo.id}`,
})
```

To get local *uri* of the cached file by key:
```JavaScript
const uri = await CacheManager.getCachedUri({ key: `${item.id}` })
```

To pre-populate the cache ahead of time from remote URI:
```JavaScript
// this is a convinience wrapper for https://docs.expo.dev/versions/latest/sdk/filesystem/#filesystemdownloadasyncuri-fileuri-options
await CacheManager.downloadAsync({uri: `${item.url}`, key: `${item.id}`})
```
