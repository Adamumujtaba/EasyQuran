import React from 'react';
import {Text, View, useWindowDimensions, Image, StyleSheet} from 'react-native';

export const OnboardingItem = ({item}: any) => {
  const {width, height} = useWindowDimensions();
  return (
    <View style={[styles.container, {width}]}>
      <View
        style={{
          height: height * 0.7,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Image
          source={item.image}
          style={(styles.image, {width, resizeMode: 'contain'})}
        />
      </View>
      <View style={{height: height * 0.2}}>
        <Text style={styles.title}> {item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    flex: 0.7,
    justifyContent: 'center',
  },
  title: {
    fontWeight: '800',
    fontSize: 28,
    color: '#34170e',
    marginHorizontal: 10,
    textAlign: 'center',
  },
  description: {
    fontWeight: '400',
    paddingHorizontal: 64,
    color: '#62655b',
    textAlign: 'center',
    height: 140,
  },
});
