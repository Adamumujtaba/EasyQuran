/* eslint-disable react-native/no-inline-styles */
import {StyleSheet, useColorScheme, View} from 'react-native';
import React from 'react';

const Bookmarked = () => {
  const colorScheme = useColorScheme();

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: colorScheme === 'dark' ? '#000' : '#fff'},
      ]}
    />
  );
};

export default Bookmarked;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    padding: 5,
    width: 50,
    alignItems: 'center',
    borderRadius: 4,
    elevation: 3,
  },
  card: {
    marginVertical: 10,
    borderRadius: 3,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#34170e',
    width: '95%',
    margin: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ayahText: {
    width: '95%',
    marginTop: 20,
  },
  ayahNumber: {
    backgroundColor: '#34170e',
    minWidth: 22,
    minHeight: 22,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: -5,
    left: -10,
    elevation: 4,
  },
});
