import React, { useState, useRef, useCallback, useEffect } from "react";
import { StyleSheet, View, Text, BackHandler } from "react-native";
import AuthenticationContainer from "~components/AuthenticationContainer";
import Separator from "~components/Separator";
import { CommonActions } from "@react-navigation/native";
import { updateObject, validatePassword } from "~utils/Helpers";
import validator from "validator";
import SimpleHeader from "~components/SimpleHeader";
import PrimaryButtom from "~components/PrimaryButton";
import Colors from "~utils/Colors";
import TextInput from "~components/TextInput";
import { validateEmailCall } from "~utils/Network/api";
import LoadingOverlay from "~components/LoadingOverlay";
import NetInfo from "@react-native-community/netinfo";
import InternetModal from "~components/InternetModal";
import AssetImages from "~assets";

export default ({ navigation, route }) => {
  const [unitDetail, setUnitDetail] = useState(null);
  const [network, setNetwork] = useState(false);

  const [loading, setLoading] = useState(false);
  const [buyUnit, setBuyUnit] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState({ email: "", password: "" });
  const [isVisibil, setVisibil] = useState(true);

  const passwordRef = useRef();

  const goToLoginScreen = () => {
    navigation.navigate("login");
  };

  const gotoBack = () => {
    navigation.dispatch(CommonActions.goBack());
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", gotoBack);
    return () => {
      BackHandler.removeEventListener("hardwareBackPress", gotoBack);
    };
  }, []);
  
  const passwordVisiabl = () => {
    setVisibil((prevVisibil) => !prevVisibil);
  };

  const handleNext = useCallback(async () => {
    NetInfo.fetch().then((state) => {
      if (state.isConnected) {
        setNetwork(false);
        setLoading(true);
        setFormErrors({ email: "", password: "" });
        updateObject("", "", setFormErrors);
        let hasErrors = false;
        if (validator.isEmpty(form?.email)) {
          updateObject("Email cannot be empty.", "email", setFormErrors);
          hasErrors = true;
        } else if (!validator.isEmail(form?.email)) {
          updateObject("Invalid email.", "email", setFormErrors);
          hasErrors = true;
        }
        if (validator.isEmpty(form?.password)) {
          updateObject("Password cannot be empty.", "password", setFormErrors);
          hasErrors = true;
        } else if (validatePassword(form?.password) != "") {
          updateObject(
            validatePassword(form?.password),
            "password",
            setFormErrors
          );
          hasErrors = true;
        }
        if (hasErrors) {
          setLoading(false);
          return;
        } else {
          validateEmailCall(createPayload())
            .then((res) => {
              setLoading(false);
              if (res?.data?.success)
                navigation.navigate("personalInfo", {
                  email: form?.email,
                  password: form?.password,
                  unit: unitDetail,
                  buyUnit: route?.params?.buyUnit,
                });
            })
            .catch((error) => {
              setLoading(false);
              if (error?.response?.data?.message){
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
  }, [form, formErrors]);

  const onChangePassword = (val) => {
    setForm({ ...form, password: val });
    updateObject(validatePassword(val), "password", setFormErrors);
  };

  const createPayload = () => {
    let payload = {
      email: form.email.toLocaleLowerCase(),
    };
    return payload;
  };
  const reTry = () => {
    setNetwork(false);
    handleNext();
  };
  useEffect(() => {
    if (route?.params?.unit) {
      setUnitDetail(route.params.unit);
      setBuyUnit(route.params.buyUnit);
    }
  }, []);

  return (
    <>
      {loading ? <LoadingOverlay /> : (
        <AuthenticationContainer>
          <SimpleHeader
            headerLabel={"Create New Account"}
            showbackButton={true}
            onPress={gotoBack}
            backIcon={true}
          />

          <Separator height={40} />
          <View style={{ width: "90%" }}>
            <TextInput
              errorMessage={formErrors?.email}
              onChangeText={(value) =>
                updateObject(value.toLowerCase().trim(), "email", setForm)
              }
              value={form.email}
              placeholder="Enter your email address…"
              autoCapitalize="none"
              textContentType="emailAddress"
              autoCompleteType="email"
              keyboardType="email-address"
              label="Email Address"
              onSubmitEditing={() => {
                passwordRef?.current?.focus();
              }}
            />
            {formErrors?.email ? (
              <Text style={styles.passwordError}>
                {formErrors.email}
              </Text>
            ) : null}
            <Separator height={24} />
            <TextInput
              errorMessage={formErrors?.password}
              onChangeText={(value) => onChangePassword(value)}
              placeholder="Enter your password"
              textContentType="password"
              password="password"
              secureTextEntry={isVisibil}
              label="Password"
              value={form?.password}
              passwordIcon={isVisibil ? AssetImages.eye : AssetImages.hide}
              passwordVisiabl={passwordVisiabl}
              inputRef={passwordRef}
            />
            {formErrors?.password ? (
              <Text style={styles.passwordError}>
                {formErrors.password}
              </Text>
            ) : null}
            <Separator height={24} />
            <PrimaryButtom
              onPress={handleNext}
              label={"Next"}
            />
          </View>
          <View
            style={{
              position: "absolute",
              alignItems: "center",
              bottom: 50,
              flexDirection: "row",
            }}
          >
            <Text style={styles.primaryText}>Already have an account?</Text>
            <Text style={styles.scondaryText} onPress={goToLoginScreen}>
              {"Sign In"}
            </Text>
          </View>
          <InternetModal
            isVisible={network}
            icon={AssetImages.internet}
            title={"Internet Connection Issue"}
            des={"Please check your internet connection"}
            secondaryButtonText={"retry"}
            primaryButtonText={"close"}
            secondaryButtonOnPress={reTry}
            onPress={() => setNetwork(false)}
          />
        </AuthenticationContainer>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  scondaryText: {
    color: Colors.primaryButtonBackgroundColor,
    fontFamily: "Inter",
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0,
    marginLeft: 6,
  },
  primaryText: {
    color: Colors.white,
    fontSize: 13,
    fontFamily: "Inter",
    letterSpacing: 0,
  },
  passwordError: { color: Colors.red, marginTop: 10 },
});
