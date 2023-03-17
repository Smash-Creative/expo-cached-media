import * as React from 'react';
import type { DownloadProgressData } from 'expo-file-system'
import { StyleSheet, View, Text } from 'react-native'
import {
  // CacheManager,
  CachedImage,
  CachedVideo,
} from 'expo-cached-media'

const Placeholder = ({
  totalBytesWritten,
  totalBytesExpectedToWrite,
}: DownloadProgressData) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {(totalBytesWritten
          ? ((totalBytesWritten / totalBytesExpectedToWrite) * 100).toFixed(0)
          : 0) + '%'}
      </Text>
    </View>
  )
}

export default function App() {
  const video = React.useRef(null)
  return (
    <View style={styles.container}>
      <CachedVideo
        ref={video}
        source={{
          uri: 'https://sample-videos.com/video123/mp4/240/big_buck_bunny_240p_20mb.mp4',
        }}
        placeholderContent={Placeholder}
        shouldPlay
        isLooping
        // useNativeControls
        resizeMode="contain"
        style={styles.container}
      />
      <CachedImage
        source={{
          uri: 'https://sample-videos.com/img/Sample-jpg-image-500kb.jpg',
        }}
        placeholderContent={Placeholder}
        resizeMode="cover"
        style={styles.container}
      >
        <Text style={styles.text}>ImageBackground</Text>
      </CachedImage>
      {/*  */}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    alignSelf: 'center',
    backgroundColor: '#fff',
    color: '#000',
  },
})
