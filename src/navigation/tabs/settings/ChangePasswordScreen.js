import React, { useState, useCallback, useRef } from "react";
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
import Constant from "~utils/Constant.json";
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
import { useEffect } from "react";

export default ({ navigation }) => {


    const authUser = useSelector((state) => state?.authUser?.authUser)
    const [showModal,setShowModal] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(true);
  const [showNewPassword, setShowNewPassword] = useState(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState(true);

  const scroll = useRef();

  const [form, setForm] = useState({
    password: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState({
    password: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  // move to account settings tab......///
  const gotoBack = () => {
    setShowModal(false)
    navigation.dispatch(CommonActions.goBack());
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", gotoBack);
    return () => {
      BackHandler.removeEventListener("hardwareBackPress", gotoBack);
    };
  }, []);

  const onChangePassword = (val) => {
    setForm({ ...form, newPassword: val });
    updateObject(validatePassword(val), "newPassword", setFormErrors);
  };

  const handleNext = useCallback(async () => {
    setLoading(true);
    setFormErrors({ password: "", newPassword: "", confirmPassword: "" });
    updateObject("", "",setFormErrors);
    let hasErrors = false;
     if (validatePassword(form?.newPassword)!="") {
      updateObject(validatePassword(form.newPassword), "newPassword", setFormErrors);
       hasErrors = true
    }
    if (form?.newPassword  !=  form?.confirmPassword) {
      updateObject("Passwords don’t match.", "confirmPassword", setFormErrors);
      hasErrors = true
    }

    if (hasErrors) {
      setLoading(false);
      return;
    } else {
      if(authUser?.token?.access){
      await changePasswordCall(createPayload(),authUser.token.access).then(res => {
        setLoading(false)
        if(res?.data?.success)
         setShowModal(true)
    }).catch(error => {
     
      setLoading(false);
      if(error?.response?.data?.message?.length>0)
      updateObject(error.response.data.message[0].current_password, "password", setFormErrors);
    });  
  }  
  }
  }, [form, formErrors]);

  const createPayload = () => {
    let payload = {
      current_password:form?.password,
      new_password:form?.newPassword
    }
    return payload;
  }

  const toggleCurrentPasswordVisibility = () => {
    setShowCurrentPassword(!showCurrentPassword);
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleNextBTN = () => validator.isEmpty(form?.password) || validator.isEmpty(form?.newPassword) || validator.isEmpty(form?.confirmPassword) ? null : handleNext()
  
  return (
    <AuthenticationContainer>
      <SimpleHeader
        headerLabel={Constant.changePasswordScreen.title}
        backgroundColor={Colors.inputBackgroundColor}
        onPress={gotoBack}
        navigation={navigation}
        backIcon={true}
      />
      <KeyboardAwareScrollView
        ref={scroll}
        style={styles.awareScroll}
      >
        <Form>
          <Separator height={20} />
          <TextInput
            errorMessage={formErrors?.password}
            onChangeText={(value) => updateObject(value, "password", setForm)}
            textContentType="password"
            password="password"
            label={Constant.changePasswordScreen.currentPassword}
            secureTextEntry={showCurrentPassword}
            passwordIcon={showCurrentPassword ? AssetImages.hide : AssetImages.eye}
            passwordVisiabl={toggleCurrentPasswordVisibility}
          />
          {formErrors?.password ? (
            <Text style={styles.error}>
              {formErrors.password}
            </Text>
          ) : null}
          <Separator height={20} />
          <TextInput
            errorMessage={formErrors?.newPassword}
            onChangeText={(value) => onChangePassword(value)}
            textContentType="newPassword"
            password="newPassword"
            label={Constant.changePasswordScreen.newPassword}
            secureTextEntry={showNewPassword}
            passwordIcon={showNewPassword ? AssetImages.hide : AssetImages.eye}
            passwordVisiabl={toggleNewPasswordVisibility}
          />
          {formErrors?.newPassword ? (
            <Text style={styles.error}>
              {formErrors.newPassword}
            </Text>
          ) : null}

          <Separator height={20} />
          <TextInput
            errorMessage={formErrors?.confirmPassword}
            onChangeText={(value) =>
              updateObject(value, "confirmPassword", setForm)
            }
            textContentType="confirmPassword"
            password="confirmPassword"
            label={Constant.changePasswordScreen.confirmPassword}
            secureTextEntry={showConfirmPassword}
            passwordIcon={showConfirmPassword ? AssetImages.hide : AssetImages.eye}
            passwordVisiabl={toggleConfirmPasswordVisibility}
          />
          {formErrors?.confirmPassword ? (
            <Text style={styles.error}>
              {formErrors.confirmPassword}
            </Text>
          ) : null}
          <Separator height={20} />
        </Form>
      </KeyboardAwareScrollView>
      <View style={{ width: "90%", bottom: 20 }}>
        <TouchableOpacity
          style={{
            backgroundColor: validator.isEmpty(form?.password) || validator.isEmpty(form?.newPassword) || validator.isEmpty(form?.confirmPassword) 
             ? Colors.inputBackgroundColor:Colors.primaryButtonBackgroundColor,
            padding: 10,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 10,
          }}
          onPress={handleNextBTN}
        >
          <Text style={[Styles.description,{  color: validator.isEmpty(form?.password) 
            || validator.isEmpty(form?.newPassword) || 
            validator.isEmpty(form?.confirmPassword)?Colors.grayFont: Colors.primaryButtonTextColor }]}>
            {Constant.changePasswordScreen.title}
          </Text>
        </TouchableOpacity>
        <CustomModal 
        isVisible = {showModal} 
        icon ={AssetImages.completed} 
        primaryButtonText = {'Continue'}  
        title={"Completed"} 
        des = {"Password changed successfully."} 
        onPress={gotoBack}   
        />
      </View>
      {loading?
      <LoadingOverlay/>
      :null}
    </AuthenticationContainer>
  );
};

const styles = StyleSheet.create({
  error: { color: Colors.red, marginTop: 10 },
  awareScroll: { width: "100%", marginLeft: 40 },
});
