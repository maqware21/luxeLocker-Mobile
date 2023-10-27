import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
} from "react-native";
import TextInput from "~components/TextInput";
import Separator from "~components/Separator";
import validator from "validator";
import { updateObject, validatePassword } from "~utils/Helpers";
import Colors from "~utils/Colors";
import Styles from "~utils/Style/Styles";
import AuthenticationContainer from "~components/AuthenticationContainer";
import SimpleHeader from "~components/SimpleHeader";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Form from "~components/Form";
import { useSelector } from "react-redux";
import { changePasswordCall } from "~utils/Network/api";
import CustomModal from "~components/CustomModal";
import AssetImages from "~assets";
import LoadingOverlay from "~components/LoadingOverlay";
import { CommonActions } from "@react-navigation/native";

export default ({ navigation, route }) => {
  const authUser = useSelector((state) => state?.authUser?.authUser);
  const [showModal, setShowModal] = useState(false);

  const scroll = useRef();

  const [form, setForm] = useState({
    password: "",
    newPassword: "",
  });
  const [formErrors, setFormErrors] = useState({
    password: "",
    newPassword: "",
  });

  const [loading, setLoading] = useState(false);
  // move to account settings tab......///
  const gotoBack = () => {
    setShowModal(false);
    navigation.dispatch(CommonActions.goBack());
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", gotoBack);
    return () => {
      BackHandler.removeEventListener("hardwareBackPress", gotoBack);
    };
  }, []);

  //
  const onChangePassword = (val) => {
    setForm({ ...form, password: val });
    updateObject(validatePassword(val), "password", setFormErrors);
  };

  const handleNext = useCallback(async () => {
    setLoading(true);
    setFormErrors({ password: "", newPassword: "" });
    updateObject("", "", setFormErrors);
    let hasErrors = false;

    if (validatePassword(form?.password) !== "") {
      updateObject(validatePassword(form.password), "password", setFormErrors);
      hasErrors = true;
    }
    if (form?.newPassword === "") {
      updateObject("Confirm password is empty.", "newPassword", setFormErrors);
      hasErrors = true;
    }

    if (form?.password != form?.newPassword && form?.newPassword !== "") {
      updateObject("Passwords don’t match.", "newPassword", setFormErrors);
      hasErrors = true;
    }

    if (hasErrors) {
      setLoading(false);
      return;
    } else {
      if (authUser?.token?.access) {
        await changePasswordCall(createPayload(), authUser.token.access)
          .then((res) => {
            setLoading(false);
            if (res?.data?.success) setShowModal(true);
          })
          .catch((error) => {
            setLoading(false);
            if (
              error?.response?.data?.message?.length > 0
            )
              updateObject(
                error.response.data.message[0].current_password,
                "password",
                setFormErrors
              );
          });
      }
    }
  }, [form, formErrors]);

  const createPayload = () => {
    let payload = {
      current_password: route?.params?.confirmPassword
        ? route?.params?.confirmPassword
        : form?.password,
      new_password: form?.newPassword,
    };
    return payload;
  };

  return (
    <>
      {loading ? <LoadingOverlay /> : (
        <AuthenticationContainer>
          <SimpleHeader
            headerLabel={"Save New Password"}
            backgroundColor={Colors.inputBackgroundColor}
            onPress={gotoBack}
            navigation={navigation}
            backIcon={true}
          />
          <Text style={[styles.noteText, { padding: 10, marginTop: 10 }]}>
            {"Your new password must be different from previous user passwords."}
          </Text>
          <KeyboardAwareScrollView
            ref={scroll}
            style={{ width: "100%", marginLeft: 40 }}
          >
            <Form>
              <Separator height={20} />
              <TextInput
                errorMessage={formErrors?.password}
                onChangeText={(value) => onChangePassword(value)}
                textContentType="password"
                password="password"
                secureTextEntry
                label={"New Password"}
              />
              {formErrors?.password ? (
                <Text style={styles.passwordError}>
                  {formErrors.password}
                </Text>
              ) : null}
              <Separator height={20} />
              <TextInput
                errorMessage={formErrors?.newPassword}
                onChangeText={(value) =>
                  updateObject(value, "newPassword", setForm)
                }
                textContentType="newPassword"
                password="newPassword"
                secureTextEntry
                label={"Confirm New Password"}
              />
              {formErrors?.newPassword ? (
                <Text style={styles.passwordError}>
                  {formErrors.newPassword}
                </Text>
              ) : null}
            </Form>
            <Separator height={40} />
            <View style={{ width: "90%" }}>
              <TouchableOpacity
                style={{
                  backgroundColor:
                    validator.isEmpty(form?.password) ||
                      validator.isEmpty(form?.newPassword)
                      ? Colors.primaryButtonBackgroundColor
                      : Colors.primaryButtonBackgroundColor,
                  padding: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 10,
                }}
                onPress={() =>
                  validator.isEmpty(form?.password) ||
                    validator.isEmpty(form?.newPassword)
                    ? handleNext()
                    : handleNext()
                }
              >
                <Text
                  style={[
                    Styles.description,
                    {
                      fontWeight: "400",
                      color:
                        validator.isEmpty(form?.password) ||
                          validator.isEmpty(form?.newPassword)
                          ? Colors.primaryButtonTextColor
                          : Colors.primaryButtonTextColor,
                    },
                  ]}
                >
                  {"Save New Password"}
                </Text>
              </TouchableOpacity>
              <CustomModal
                isVisible={showModal}
                icon={AssetImages.completed}
                primaryButtonText={"Continue"}
                title={"Completed"}
                des={"Password changed successfully."}
                onPress={gotoBack}
              />
            </View>
          </KeyboardAwareScrollView>
        </AuthenticationContainer>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  passwordError: { 
    color: Colors.red, 
    marginTop: 10 
  },
  noteText: {
    color: Colors.grayFont,
    fontSize: 13,
    fontFamily: "Inter-Regular",
    lineHeight: 20,
    alignItems: "center",
  },
});
