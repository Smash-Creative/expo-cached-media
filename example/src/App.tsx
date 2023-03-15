import * as React from 'react';

import { StyleSheet, View, Text } from 'react-native'
import { CacheManager, CachedImage, CachedVideo } from 'expo-cached-media'

const Placeholder = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Placeholder</Text>
  </View>
)

export default function App() {
  const video = React.useRef(null)
  return (
    <View style={styles.container}>
      <CachedVideo
        ref={video}
        source={{
          uri: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_10mb.mp4',
        }}
        placeholderContent={<Placeholder />}
        shouldPlay
        isLooping
        // useNativeControls
        resizeMode="contain"
      />
      <CachedImage
        source={{
          uri: 'https://sample-videos.com/img/Sample-jpg-image-500kb.jpg',
        }}
        placeholderContent={<Placeholder />}
        resizeMode="cover"
        style={{ alignItems: 'center', justifyContent: 'center' }}
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
  },
})
