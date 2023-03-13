import * as React from 'react';

import { StyleSheet, View, Text } from 'react-native'
import { CacheManager, CachedImage, CachedVideo } from 'expo-cached-media'

export default function App() {
  const video = React.useRef(null)
  return (
    <View style={styles.container}>
      <CachedVideo
        ref={video}
        source={{
          uri: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4',
        }}
        placeholderContent={<Text>Placeholder</Text>}
        shouldPlay
        isLooping
        // useNativeControls
        resizeMode="contain"
      />
      <CachedImage
        source={{
          uri: 'https://test-videos.co.uk/user/pages/images/big_buck_bunny.jpg',
        }}
        placeholderContent={<Text>Placeholder</Text>}
        resizeMode="cover"
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
  box: {
    // flex: 1,
    // width: '100%',
    // height: 'auto',
    // height: 60,
    // marginVertical: 20,
  },
  text: {
    alignSelf: 'center',
  },
})
