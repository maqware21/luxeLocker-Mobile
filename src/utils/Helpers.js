import { phone } from "phone";
import libphonenumber from "libphonenumber-js";
import { Image } from "react-native-compressor";
import messaging from "@react-native-firebase/messaging";
import notifee from "@notifee/react-native";
import NetInfo from "@react-native-community/netinfo";
import { Platform } from "react-native";
import handleNotificationPress from "./NotificationHandler";

export const removeDuplicates = (array, keyExtractor) => {
  return [...new Map(array.map((item) => [keyExtractor(item), item])).values()];
};

export const updateObject = (
  value,
  identifier,
  setState,
  formErrors,
  setFormErrors
) => {
  setState((prevState) => {
    let newState = deepCopy(prevState);
    const keys = identifier.split(".");
    keys.reduce((accumulator, currentValue, index) => {
      if (keys?.length == index + 1) {
        accumulator[currentValue] = value;
      }
      return accumulator[currentValue];
    }, newState);
    return newState;
  });
  if (formErrors) {
    setFormErrors({ ...formErrors, [identifier]: null });
  }
};

export const deepCopy = (object) =>
  // It transforms the date object back instead of string
  JSON.parse(JSON.stringify(object), (key, value) => {
    const regexIsDateObject = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/;
    if (typeof value == "string" && regexIsDateObject.exec(value)) {
      return new Date(value);
    }
    return value;
  });

export const sleep = async (seconds) =>
  new Promise((resolve) => setTimeout(resolve, seconds * 1000));

export const parseErrorMessage = (errorMessage = {}) => {
  if (typeof errorMessage === "string") {
    return "Something went wrong";
  }
  const errors = Object.values(errorMessage).flat();
  if (errors.length > 1) {
    return errors.map((errorMessage) => `• ${errorMessage}`).join("\n");
  } else {
    return errors.join("\n");
  }
};

export const formatToCurrency = (num) => {
  return "$" + num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
};

export const onChangePhoneNo = (text) => {
  let countryCode = phone(text);
  if (countryCode.isValid) return true;
  else return false;
};

export const usubscribe = () => {
  NetInfo.fetch().then((state) => {
    return state.isConnected;
  });
};

export const getHeaderWithAuthToken = (token) => {
  let headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  const newHeaders = Object.assign({}, headers, {
    Authorization: `Bearer ${token}`,
  });
  return newHeaders;
};

export const getHeaderWithAuthTokenImage = (token) => {
  let headers = {
    "Content-type": "multipart/form-data",
  };

  const newHeaders = Object.assign({}, headers, {
    Authorization: `Bearer ${token}`,
    "Content-type": "multipart/form-data",
  });
  return newHeaders;
};

export function validatePassword(pass) {
  const uppercaseRegExp = /(?=.*?[A-Z])/;
  const lowercaseRegExp = /(?=.*?[a-z])/;
  const digitsRegExp = /(?=.*?[0-9])/;
  const specialCharRegExp = /(?=.*?[#?!@$%^&*-])/;
  const minLengthRegExp = /.{8,}/;
  const passwordLength = pass.length;
  const uppercasePassword = uppercaseRegExp.test(pass);
  const lowercasePassword = lowercaseRegExp.test(pass);
  const digitsPassword = digitsRegExp.test(pass);
  const specialCharPassword = specialCharRegExp.test(pass);
  const minLengthPassword = minLengthRegExp.test(pass);
  let errMsg = "";
  if (passwordLength === 0) {
    errMsg = "Password is empty";
  } else if (!uppercasePassword) {
    errMsg = "At least one Uppercase";
  } else if (!lowercasePassword) {
    errMsg = "At least one Lowercase";
  } else if (!digitsPassword) {
    errMsg = "At least one digit";
  } else if (!specialCharPassword) {
    errMsg = "At least one Special Characters";
  } else if (!minLengthPassword) {
    errMsg = "At least minumum 8 characters";
  } else {
    return errMsg;
  }
  return errMsg;
}

export function getCountryCode(input) {
  // Set default country code to US if no real country code is specified
  const defaultCountryCode = input.substr(0, 1) !== "+" ? "US" : null;
  let formatted = libphonenumber(defaultCountryCode).input(input);
  let countryCode = "";
  let withoutCountryCode = formatted;

  if (defaultCountryCode === "US") {
    countryCode = "+1";
    formatted = "+1 " + formatted;
  } else {
    const parts = formatted.split(" ");
    countryCode = parts.length > 1 ? parts.shift() : "";
    withoutCountryCode = parts.join(" ");
  }

  return {
    formatted,
    withoutCountryCode,
    countryCode,
  };
}

export async function ImageCompressorHandler(image) {
  let result = null;
  await Image.compress(image, {
    compressionMethod: "auto",
  }).then((res) => {
    result = res;
  });
  return JSON.parse(result);
}

// FCM Token
export function requestPermission(callback) {
  messaging()
    .requestPermission()
    .then((response) => {
      if (response) {
        getFCMToken((res) => {
          callback(res);
        });
      }
    })
    .catch((error) => {
      console.log("🚀 ~ file: Helpers.js:172 ~ error:", error);
    });
}

const getFCMToken = async (callback) => {
  await messaging()
    .hasPermission()
    .then((enabled) => {
      if (enabled) {
        messaging()
          .getToken()
          .then((response) => {
            callback(response);
          });
      }
    })
    .catch((error) => {
      console.log("🚀 ~ file: Helpers.js:190 ~ error:", error);
    });
};

//notifications Listeners
export function addNotificationListener() {
  messageForeGround();
  messageBackGround();
  messaging().onNotificationOpenedApp((remoteMessage) => {
    console.log("🚀 ~ file: Helpers.js:199 ~ onNotificationOpenedApp:");
  });

  messaging()
    .getInitialNotification()
    .then(async (notification) => {
      console.log("getInitialNotification");
    });

  messaging().onNotificationOpenedApp((remoteMessage) => {
    const userData = remoteMessage.data;
    handleNotificationPress(userData);
  });
}

const messageForeGround = (channelId) => {
  return messaging().onMessage(async (remoteMessage) => {
    if (Platform.OS == "ios") {
      await notifee.displayNotification({
        remoteMessage,
      });
    } else {
      onDisplayNotification(remoteMessage);
    }
  });
};

async function onDisplayNotification(notification) {
  // Request permissions (required for iOS)
  await notifee.requestPermission();

  // Create a channel (required for Android)
  const channelId = await notifee.createChannel({
    id: "default",
    name: "Default Channel",
  });

  // Display a notification
  await notifee.displayNotification({
    title: notification?.notification?.title,
    body: notification?.notification?.title,
    data: notification?.data,
    android: {
      channelId,

      // pressAction is needed if you want the notification to open the app when pressed
      pressAction: {
        id: "default",
      },
    },
  });
}

notifee.onBackgroundEvent(async ({ type, detail }) => {
  const notification = detail?.notification;
  const userData = notification?.data;
  handleNotificationPress(userData);
});

const messageBackGround = () => {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log("setBackgroundMessageHandler");
  });
};
