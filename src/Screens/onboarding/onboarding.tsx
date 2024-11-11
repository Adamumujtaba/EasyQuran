/* eslint-disable react-native/no-inline-styles */
import React, {useRef, useState} from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Animated,
  TouchableOpacity,
} from 'react-native';
import Slides from './slides';
import {OnboardingItem} from './onboardingItem';
import {Paginator} from './Paginator';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import AsyncStorage from '@react-native-async-storage/async-storage';

const Onboarding = ({navigation}: any) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const slidesRef = useRef<any>(null);
  const viewableItemChanged = useRef(({viewableItems}: any) => {
    setCurrentIndex(viewableItems[0].index);
  }).current;

  const viewConfig = useRef({viewAreaCoveragePercentThreshold: 50}).current;

  const scrollTo = async () => {
    if (currentIndex < Slides.length - 1) {
      slidesRef.current.scrollToIndex({index: currentIndex + 1});
    } else {
      navigateToHomeScreen();
    }
  };

  const navigateToHomeScreen = async () => {
    try {
      navigation.replace('Home');
      try {
        await AsyncStorage.setItem('viewOnboarding', 'view');
      } catch (e) {
        //error
      }
    } catch (error) {
      console.log('errror::', error);
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          flex: 3,
        }}>
        <FlatList
          data={Slides}
          renderItem={({item}) => <OnboardingItem item={item} />}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={item => item.id.toString()}
          onScroll={Animated.event(
            [{nativeEvent: {contentOffset: {x: scrollX}}}],
            {useNativeDriver: false},
          )}
          scrollEventThrottle={32}
          onViewableItemsChanged={viewableItemChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
        />
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}>
        <TouchableOpacity style={styles.button} onPress={navigateToHomeScreen}>
          <Text style={styles.buttonTitle}>Skip</Text>
        </TouchableOpacity>
        <Paginator data={Slides} scrollX={scrollX} />
        <TouchableOpacity style={styles.button} onPress={scrollTo}>
          <Text style={styles.buttonTitle}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Onboarding;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  button: {
    width: 70,
    alignItems: 'center',
    padding: 5,
    borderRadius: 4,
  },
  buttonTitle: {
    fontWeight: '900',
    color: '#000',
    padding: 10,
    width: 80,
    textAlign: 'center',
    borderRadius: 5,
  },
});
