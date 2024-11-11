import {Image, StyleSheet, View} from 'react-native';
import React from 'react';
import {Logo} from '../../Images/index';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Image source={Logo} style={styles.image} resizeMode="cover" />
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
