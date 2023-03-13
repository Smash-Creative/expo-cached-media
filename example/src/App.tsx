import * as React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import { CacheManager, CachedImage, CachedVideo } from 'expo-cached-media'

export default function App() {
  return (
    <View style={styles.container}>
      <CachedVideo
        source={{
          uri: 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4',
        }}
      />
      <Text>Result</Text>
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
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
