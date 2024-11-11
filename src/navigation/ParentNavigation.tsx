import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import Screens
import SplashScreen from '../Screens/Splash';
import QuranHomePage from '../Screens/Home/Quran';
import PageSurah from '../Screens/Home/Quran_Page';
import Onboarding from '../Screens/onboarding/onboarding';

const Stack = createNativeStackNavigator();

export default function ParentNavigation() {
  const [isSplashVisible, setSplashVisible] = useState(true);
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);
  const [navState, setNavState] = useState<any>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check onboarding status
        const onboardingStatus = await AsyncStorage.getItem('viewOnboarding');
        setShouldShowOnboarding(!!onboardingStatus);

        // Hide splash screen after 3 seconds
        setTimeout(() => setSplashVisible(false), 3000);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    const loadNavigationState = async () => {
      try {
        const savedState = await AsyncStorage.getItem('NAVIGATION_STATE');
        setNavState(savedState ? JSON.parse(savedState) : null);
      } catch (error) {
        console.error('Failed to load navigation state:', error);
      }
    };

    loadNavigationState();
  }, []);

  if (isSplashVisible) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer
      initialState={navState}
      onStateChange={async state => {
        try {
          await AsyncStorage.setItem('NAVIGATION_STATE', JSON.stringify(state));
        } catch (error) {
          console.error('Failed to save navigation state:', error);
        }
      }}>
      <Stack.Navigator
        initialRouteName={shouldShowOnboarding ? 'Home' : 'Onboarding'}
        screenOptions={{
          headerStyle: {backgroundColor: '#34170e'},
          headerTintColor: '#fff',
          headerTitleStyle: {fontWeight: 'bold'},
          headerTitleAlign: 'left',
        }}>
        <Stack.Screen
          name="Onboarding"
          component={Onboarding}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Home"
          component={QuranHomePage}
          options={{headerTitle: 'List of Chapters'}}
        />
        <Stack.Screen
          name="Surah"
          component={PageSurah}
          options={{headerTitle: ''}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
