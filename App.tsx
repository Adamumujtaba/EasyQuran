import * as React from 'react';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import ParentNavigation from './src/navigation/ParentNavigation';
import Toast from 'react-native-toast-message';
import {store, persistor} from './src/quran-redux/store';
// import NetInfo from '@react-native-community/netinfo';
function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <>
          <ParentNavigation />
          <Toast />
        </>
      </PersistGate>
    </Provider>
  );
}

export default App;
