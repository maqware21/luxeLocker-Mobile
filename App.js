/**
 * LuxLocker App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useEffect } from "react";

import {
  Linking,
  PermissionsAndroid,
  Platform,
} from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import InitialNavigator from "./src/navigation/auth";
import { Provider } from "react-redux";
import { Camera } from "react-native-vision-camera";
import "./ignoreWarnings";
import { store } from "./src/redux/store";
import { StripeProvider } from "@stripe/stripe-react-native";
import { addNotificationListener } from "~utils/Helpers";
import PushNotificationIos from "@react-native-community/push-notification-ios";
import messaging from "@react-native-firebase/messaging";
import DeviceInfo from "react-native-device-info"
import { PERMISSIONS } from 'react-native-permissions';
import dynamicLinks from "@react-native-firebase/dynamic-links";

export const navigationRef = React.createRef();

const App = () => {
  const [hasPermission, setHasPermission] = React.useState(false);

  useEffect(() => {
    getPermision();
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log(
        "Notification caused app to open from background state:",
        remoteMessage.notification
      );
    });

    addNotificationListener();
    checkCameraPermission();
    getLink();
    // Used to display notification when app is in foreground
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      if (Platform.OS == "ios") {
        PushNotificationIos.addNotificationRequest({
          id: remoteMessage.messageId,
          body: remoteMessage.notification.body,
          title: remoteMessage.notification.title,
          userInfo: remoteMessage.data,
        });
      }
    });

    return unsubscribe;
  }, []);

 const getPermision = async () => {
    if (Platform.OS == "android" && DeviceInfo.getApiLevelSync() >= 33) {
      await requestPermission();
    }
  };

  const requestPermission = async () => {
    try {
        const granted = await PermissionsAndroid.request(
          PERMISSIONS.ANDROID.POST_NOTIFICATIONS
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Notification permission granted');
        } else {}
    } catch (err) {
      console.log(err)
    }
  };

  // where you need to get permission
  const getLink = async () => {
    if (Platform.OS === "ios") {
      url = await Linking.getInitialURL();
      console.log("url", url);
    } else {
      const res = await dynamicLinks().getInitialLink();
      if (res) {
        url = res.url;
      }
    }
  };

  const checkCameraPermission = async () => {
    const status = await Camera.getCameraPermissionStatus();
    setHasPermission(status === "authorized");
  };

  return (
    <StripeProvider
      publishableKey="pk_test_TYooMQauvdEDq54NiTphI7jx"
      urlScheme="https://google.com" // required for 3D Secure and bank redirects
      merchantIdentifier="merchant.com.{{YOUR_APP_NAME}}" // required for Apple Pay
    >
      <Provider store={store}>
        <NavigationContainer ref={navigationRef} theme={themeColor}>
          <InitialNavigator />
        </NavigationContainer>
      </Provider>
    </StripeProvider>
  );
};

const themeColor = {
colors: {
    background: 'black',
  },
};

export default App;
