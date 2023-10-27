import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  BackHandler,
  Alert,
  Platform,
} from "react-native";
import messaging from "@react-native-firebase/messaging";

//......... Components
import PrimaryButtom from "~components/PrimaryButton";
import Logo from "~components/Logo";
import AuthenticationContainer from "~components/AuthenticationContainer";
import Form from "~components/Form";
import Separator from "~components/Separator";
import TextInput from "~components/TextInput";
import validator from "validator";
import { updateObject } from "@utils/Helpers";
import Colors from "~utils/Colors";
import SimpleHeader from "~components/SimpleHeader";
import { TouchableOpacity } from "react-native-gesture-handler";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import TouchID from "react-native-touch-id";
import { useDispatch } from "react-redux";
import { authUser } from "~redux/reducers/authReducer";
import {
  availableUnitDetailCall,
  loginCall,
  validateEmailCall,
} from "~utils/Network/api";
import LoadingOverlay from "~components/LoadingOverlay";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { requestPermission } from "~utils/Helpers";
import NetInfo from "@react-native-community/netinfo";
import InternetModal from "~components/InternetModal";
import AssetImages from "~assets";
import DeviceInfo from "react-native-device-info";
export default ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const scroll = useRef();
  const [form, setForm] = useState({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState({ email: "", password: "" });
  const [fcmToken, setFcmToken] = useState("");
  const [network, setNetwork] = useState(false);
  const [serverError, setServerError] = useState(false);
  const [isVisibil, setVisibil] = useState(true);

  const passwordRef = useRef();

  const dispatch = useDispatch();

  const getFcmToken = (callback) => {
    requestPermission(async (response) => {
      callback(response);
    });
  };

  const passwordVisiabl = () => {
    if (isVisibil) setVisibil(false);
    else setVisibil(true);
  };

  const reTry = () => {
    setNetwork(false);
    handleLogin();
  };

  useEffect(() => {
    getNotificationNotification();
    loginByAuth();
    getFcmToken(async (fcmToken) => {
      setFcmToken(fcmToken);
    });
  }, [navigation, route]);

  const getNotificationNotification = () => {
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        console.log(remoteMessage);
      });
  };

  const handleNavigation = (user) => {
    if (user) {
      setLoading(false);
      setForm({ email: "", password: "" });
      dispatch(authUser(user));
      AsyncStorage.setItem("isLoggedIn", JSON.stringify(true));
      if (!user?.is_reset_passowrd && !user?.first_login) {
        // Is lessee Nav to SignNow
        if (route?.params?.userAccess !== undefined) {
          navigation.reset({
            index: 0,
            routes: [
              { name: "tabs" },
              {
                name: "ownedUnitDetail",
                params: { unit: route?.params?.userAccess },
              },
            ],
          });
        } else if (
          user?.signing_link !== null &&
          user?.salemate_obj?.profile_stage === "sign_now" &&
          user?.salemate_obj?.is_lease
        ) {
          const signing_link = user?.signing_link;
          availableUnitDetailCall(user?.salemate_obj?.unit_id)
            .then((res) => {
              setLoading(false);
              if (res?.data?.data) {
                navigation.navigate("signature", {
                  signing_url: signing_link,
                  unitId: res.data.data?.id,
                  unit: res.data.data,
                  email: form?.email.toLowerCase().trim(),
                  password: form?.password,
                });
              }
            })
            .catch((error) => {
              if (
                error?.response?.status == 404 ||
                error?.response?.status == 400 ||
                error?.response?.status == 502
              ) {
                setNetwork(true);
                setServerError(true);
              }
            });
        }
        // Is lessee Nav to Insurance
        else if (
          user?.signing_link === null &&
          user?.salemate_obj?.profile_stage === "insurance" &&
          user?.salemate_obj?.is_lease
        ) {
          availableUnitDetailCall(user?.salemate_obj?.unit_id)
            .then((res) => {
              setLoading(false);
              if (res?.data?.data) {
                navigation.navigate("insuranceScreen", {
                  unitId: res.data.data?.id,
                  from: "signNow",
                  unit: res?.data?.data,
                  email: form?.email.toLowerCase().trim(),
                  password: form?.password,
                });
              }
            })
            .catch((error) => {});
        }
        // Is lessee Nav to Payments
        else if (
          user?.signing_link === null &&
          user?.salemate_obj?.profile_stage === "stripe" &&
          user?.salemate_obj?.is_lease
        ) {
          availableUnitDetailCall(user?.salemate_obj?.unit_id)
            .then((res) => {
              setLoading(false);
              if (res?.data?.data) {
                navigation.navigate("cardInfo", {
                  email: form?.email.toLowerCase().trim(),
                  password: form?.password,
                  unitId: res.data.data?.id,
                });
              }
            })
            .catch((error) => {
              if (
                error?.response?.status == 404 ||
                error?.response?.status == 400 ||
                error?.response?.status == 502
              ) {
                setNetwork(true);
                setServerError(true);
              }
            });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: "tabs" }],
          });
        }
      } else {
        navigation.navigate("resetPassword", {
          confirmPassword: form?.password,
        });
      }
    }
  };

  const handleLogin = useCallback(async () => {
    setServerError(false);
    await NetInfo.fetch().then((state) => {
      if (state.isConnected) {
        setLoading(true);
        setNetwork(false);
        setFormErrors({ email: "", password: "" });
        updateObject("", "", setFormErrors);
        let hasErrors = false;
        if (validator.isEmpty(form.email)) {
          updateObject("Email cannot be empty.", "email", setFormErrors);
          hasErrors = true;
        } else if (!validator.isEmail(form.email)) {
          updateObject("Invalid email.", "email", setFormErrors);
          hasErrors = true;
        }
        if (validator.isEmpty(form.password)) {
          updateObject("Password cannot be empty.", "password", setFormErrors);
          hasErrors = true;
        }
        if (hasErrors) {
          setLoading(false);
          return;
        } else {
          loginCall(createPayload())
            .then((res) => {
              if (res?.data?.data) {
                setLoading(false);
                handleNavigation(res.data.data);
              }
            })
            .catch((error) => {
              setLoading(false);
              if (error?.response?.status >= 500) {
                setNetwork(true);
                setServerError(true);
              }
              if (error?.response?.data) {
                if (
                  error.response.data?.message &&
                  error.response.data?.message.includes("password")
                )
                  updateObject(
                    error.response.data.message,
                    "password",
                    setFormErrors
                  );
                else if (
                  error?.response?.data?.message &&
                  error?.response?.data?.message.includes("email")
                )
                  updateObject(
                    error.response.data.message,
                    "email",
                    setFormErrors
                  );
              }
            });
        }
      } else {
        setNetwork(true);
      }
    });
  }, [form, formErrors, NetInfo]);

  const createPayload = () => {
    let payload = {
      email: form?.email.toLowerCase().trim(),
      password: form?.password,
      is_admin: false,
      active: true,
      token: fcmToken,
      device_id: DeviceInfo.getDeviceId(),
      type: Platform.OS,
    };
    return payload;
  };

  const gotoForgetPassword = () => {
    navigation.navigate("forgotPassword");
  };

  const gotoBack = () => {
    navigation.navigate("map");
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", gotoBack);
    return () => {
      BackHandler.removeEventListener("hardwareBackPress", gotoBack);
    };
  }, []);

  const loginByAuth = () => {
    TouchID.isSupported()
      .then((biometryType) => {
        // Success code
        if (biometryType === "FaceID") {
          authenticate();
        } else if (biometryType === "TouchID") {
          authenticate();
        } else if (biometryType === true) {
          authenticate();
        }
      })
      .catch((error) => {
        Alert.alert("Error", "Your faceId/TouchId setting");
      });
  };

  async function authenticate() {
    return TouchID.authenticate()
      .then(async (success) => {
        setLoading(true);
        const user = await AsyncStorage.getItem("user");
        let parsUser = JSON.parse(user);
        let payload = {
          email: parsUser?.email.toLocaleLowerCase(),
        };
        if (success) {
          if (parsUser?.email) {
            await validateEmailCall(payload)
              .then((res) => {
                setLoading(false);
                Alert.alert("Error", "User not found!");
              })
              .catch((error) => {
                if (
                  error?.response?.data?.message ===
                  "This email address is already registered with us."
                ) {
                  handleNavigation(parsUser);
                }
              });
          } else {
            setLoading(false);
            Alert.alert("Error", "User not found!");
          }
        } else {
          setLoading(false);
          Alert.alert("Error", "User not found!");
        }
      })
      .catch((error) => {
        Alert.alert("Error", error.toString());
      });
  }

  return (
    <>
      <AuthenticationContainer>
        <SimpleHeader onPress={gotoBack} backIcon={true} />
        <Logo />
        <Separator height={10} />
        <KeyboardAwareScrollView ref={scroll} style={styles.scrollView}>
          <Form>
            <TextInput
              errorMessage={formErrors?.email}
              onChangeText={(value) => updateObject(value, "email", setForm)}
              placeholder="Enter your email address…"
              autoCapitalize="none"
              textContentType="emailAddress"
              autoCompleteType="email"
              keyboardType="email-address"
              label="Email Address"
              value={form?.email}
              onSubmitEditing={() => {
                passwordRef?.current?.focus();
              }}
            />
            {formErrors?.email ? (
              <Text style={styles.inputError}>{formErrors.email}</Text>
            ) : null}
            <Separator height={20} />
            <TextInput
              errorMessage={formErrors?.password}
              onChangeText={(value) => updateObject(value, "password", setForm)}
              placeholder="Enter your password"
              textContentType="password"
              password="password"
              secureTextEntry={isVisibil}
              label="Password"
              passwordIcon={isVisibil ? AssetImages.eye : AssetImages.hide}
              value={form?.password}
              passwordVisiabl={passwordVisiabl}
              inputRef={passwordRef}
            />
            {formErrors?.password ? (
              <Text style={styles.inputError}>{formErrors.password}</Text>
            ) : null}
            <Separator height={24} />
            <PrimaryButtom onPress={handleLogin} label={"Sign In"} />

            <Separator height={20} />

            <View style={styles.inputContainer}>
              <Text style={styles.primaryText}>Forgot Password?</Text>
              <TouchableOpacity onPress={gotoForgetPassword}>
                <Text style={styles.scondaryText}>{" Reset Password"}</Text>
              </TouchableOpacity>
            </View>
          </Form>
        </KeyboardAwareScrollView>

        <InternetModal
          isVisible={network}
          icon={AssetImages.internet}
          title={serverError ? "Server Error" : "Internet Connection Issue"}
          des={
            serverError
              ? "Went some thing Wrong"
              : "Please check your internet connection"
          }
          secondaryButtonText={"Retry"}
          primaryButtonText={"Close"}
          secondaryButtonOnPress={reTry}
          onPress={() => setNetwork(false)}
        />
        {loading && <LoadingOverlay />}
      </AuthenticationContainer>
    </>
  );
};
const styles = StyleSheet.create({
  scrollView: { width: "100%", marginLeft: 40 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: {
    color: Colors.white,
    fontSize: 13,
    fontFamily: "Inter",
    letterSpacing: 0,
  },
  scondaryText: {
    color: Colors.primaryButtonBackgroundColor,
    fontFamily: "Inter",
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0,
  },
  inputError: { color: Colors.red, marginTop: 10 },
});
