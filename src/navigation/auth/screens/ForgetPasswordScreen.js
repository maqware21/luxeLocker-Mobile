import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, Alert, BackHandler } from "react-native";
import AuthenticationContainer from "~components/AuthenticationContainer";
import Separator from "~components/Separator";
import { CommonActions } from "@react-navigation/native";

import SimpleHeader from "~components/SimpleHeader";
import PrimaryButtom from "~components/PrimaryButton";
import Colors from "~utils/Colors";
import TextInput from "~components/TextInput";
import { forGotPassword } from "~utils/Network/api";
import { updateObject } from "~utils/Helpers";

import validator from "validator";

export default ({ navigation }) => {
  const [form, setForm] = useState({ email: "" });
  const [formErrors, setFormErrors] = useState({ email: "" });

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

  ////forgot password api call....////
  const forgotPasswordHandler = () => {
    setFormErrors({ email: "" });
    updateObject("", "", setFormErrors);
    let hasErrors = false;
    if (validator.isEmpty(form.email)) {
      updateObject("Email cannot be empty.", "email", setFormErrors);
      hasErrors = true;
    } else if (!validator.isEmail(form.email)) {
      updateObject("Invalid email.", "email", setFormErrors);
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    } else {
      forGotPassword(forgotPasswordPayLoad())
        .then((res) => {
          if (res?.data?.success){
            emailScreen();
          } else {
            Alert.alert("Error", "Went Something Wrong");
          }
        })
        .catch((err) => {
          if (err?.response?.data?.message?.includes("went")){
              setFormErrors({ email: "This email is not register" });
          }
        });
    }
  };

  ///forgot password payload
  const forgotPasswordPayLoad = () => {
    let payload = {
      email: form?.email,
    };
    return payload;
  };

  const emailScreen = () => {
    navigation.navigate("forgotPasswordCheckEmail");
  };

  return (
    <AuthenticationContainer>
      <SimpleHeader
        headerLabel={"Forgot Password"}
        showbackButton={true}
        onPress={gotoBack}
        backIcon={true}
      />
      <View style={styles.forgetSection}>
        <Text style={styles.noteText}>
          {
            "Enter your email below, you will receive an email with instructions on how to reset your password in a few minutes."
          }
        </Text>
      </View>
      <Separator height={40} />
      <View style={{ width: "90%" }}>
        <TextInput
          errorMessage={formErrors?.email}
          onChangeText={(value) => updateObject(value, "email", setForm)}
          placeholder="Enter your email address"
          autoCapitalize="none"
          textContentType="emailAddress"
          autoCompleteType="email"
          keyboardType="email-address"
          label="Email Address"
          value={form?.email}
        />
        {formErrors?.email ? (
          <Text style={styles.emailError}>
            {formErrors.email}
          </Text>
        ) : null}

        <Separator height={24} />
        <PrimaryButtom
          onPress={forgotPasswordHandler}
          label={"Reset Password"}
        />
      </View>
    </AuthenticationContainer>
  );
};

const styles = StyleSheet.create({
  forgetSection: {
    width: "90%",
  },
  noteText: {
    color: Colors.grayFont,
    fontSize: 13,
    fontFamily: "Inter-Regular",
    lineHeight: 20,
  },
  emailError: { color: Colors.red, marginTop: 10 },
});
