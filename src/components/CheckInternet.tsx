import React, {useEffect, useState, useCallback, useRef} from 'react';
import {Text, View, StyleSheet, AppState, Platform} from 'react-native';
import NetInfo, {NetInfoState} from '@react-native-community/netinfo';

interface CheckInternetProps {
  refetch: () => void;
  fetching?: boolean;
  retryDelay?: number;
  maxRetries?: number;
  debug?: boolean;
}

const CheckInternet: React.FC<CheckInternetProps> = ({
  refetch,
  fetching,
  retryDelay = 3000,
  maxRetries = 3,
  debug = false,
}) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [appState, setAppState] = useState(AppState.currentState);
  const previousConnectionRef = useRef<boolean | null>(true);
  const wasDisconnected = useRef(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const retryCount = useRef(0);

  const debugLog = useCallback(
    (message: string) => {
      if (debug) {
        console.log(`[CheckInternet] ${message}`);
      }
    },
    [debug],
  );

  const performRefetch = useCallback(() => {
    debugLog('Performing refetch operation');
    try {
      refetch();
      debugLog('Refetch completed successfully');
      retryCount.current = 0;
      wasDisconnected.current = false;
    } catch (error) {
      debugLog(`Refetch failed: ${error}`);
      if (retryCount.current < maxRetries) {
        retryCount.current += 1;
        debugLog(`Scheduling retry ${retryCount.current}/${maxRetries}`);
        retryTimeoutRef.current = setTimeout(performRefetch, retryDelay);
      }
    }
  }, [refetch, retryDelay, maxRetries, debugLog]);

  const checkAndUpdateConnection = useCallback(async () => {
    debugLog('Checking current connection status');
    try {
      const state = await NetInfo.fetch();
      debugLog(`Current connection state: ${JSON.stringify(state)}`);
      return state.isConnected;
    } catch (error) {
      debugLog(`Error checking connection: ${error}`);
      return false;
    }
  }, [debugLog]);

  const handleConnectivityChange = useCallback(
    async (state: NetInfoState) => {
      debugLog(`Connection state changed: ${JSON.stringify(state)}`);
      debugLog(`Previous connection state: ${previousConnectionRef.current}`);

      const currentlyConnected = state.isConnected;
      setIsConnected(currentlyConnected);

      // Connection lost
      if (!currentlyConnected && previousConnectionRef.current) {
        debugLog('Connection lost detected');
        wasDisconnected.current = true;
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
          debugLog('Cleared pending retry timeout');
        }
      }
      // Connection restored
      else if (currentlyConnected && !previousConnectionRef.current) {
        debugLog('Connection restored detected');
        if (wasDisconnected.current) {
          debugLog('Was previously disconnected, waiting before refetch');
          // Add platform-specific delay before attempting refetch
          setTimeout(async () => {
            const isStillConnected = await checkAndUpdateConnection();
            if (isStillConnected) {
              debugLog('Connection confirmed stable, initiating refetch');
              performRefetch();
            } else {
              debugLog('Connection not stable, skipping refetch');
            }
          }, Platform.select({ios: 1000, android: 2000}));
        }
      }

      previousConnectionRef.current = currentlyConnected;
    },
    [checkAndUpdateConnection, performRefetch, debugLog],
  );

  const handleAppStateChange = useCallback(
    async (nextAppState: string) => {
      debugLog(`App state changing from ${appState} to ${nextAppState}`);

      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        debugLog('App became active, checking connection');
        // Add delay before checking connection
        setTimeout(async () => {
          const isConnected = await checkAndUpdateConnection();
          debugLog(`Connection check after becoming active: ${isConnected}`);
          if (isConnected && wasDisconnected.current) {
            debugLog(
              'Connection detected after background, triggering refetch',
            );
            performRefetch();
          }
        }, Platform.select({ios: 500, android: 1000}));
      }
      setAppState(nextAppState);
    },
    [appState, checkAndUpdateConnection, performRefetch, debugLog],
  );

  useEffect(() => {
    debugLog('Setting up connectivity monitoring');

    // Initial connection check
    checkAndUpdateConnection().then(connected => {
      debugLog(`Initial connection status: ${connected}`);
      setIsConnected(connected);
      previousConnectionRef.current = connected;
      if (!connected) {
        wasDisconnected.current = true;
      }
    });

    const unsubscribeNetInfo = NetInfo.addEventListener(
      handleConnectivityChange,
    );
    const subscriptionAppState = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      debugLog('Cleaning up subscriptions');
      unsubscribeNetInfo();
      subscriptionAppState.remove();
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [
    handleConnectivityChange,
    handleAppStateChange,
    checkAndUpdateConnection,
    debugLog,
  ]);

  if (isConnected && !fetching) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.text, fetching && styles.fetchingText]}>
        {fetching ? 'Fetching...' : 'No internet connection'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 2,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 8,
    backgroundColor: '#FFF',
  },
  text: {
    color: '#901',
    fontSize: 14,
  },
  fetchingText: {
    color: '#666',
  },
});

export default CheckInternet;
