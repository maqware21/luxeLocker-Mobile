import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  Alert,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Switch,
  BackHandler,
} from "react-native";
import Separator from "~components/Separator";
import SimpleHeader from "~components/SimpleHeader";
import TextInput from "~components/TextInput";
import CustomModal from "~components/CustomModal";
import Colors from "~utils/Colors";
import Styles from "~utils/Style/Styles";
import CountryFlag from "react-native-country-flag";
import CountryPicker, { DARK_THEME } from "react-native-country-picker-modal";
import AssetImages from "~assets";
import CheckBox from "@react-native-community/checkbox";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import PrimaryButton from "~components/PrimaryButton";
import { CommonActions } from "@react-navigation/native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as yup from "yup";
import { useSelector } from "react-redux";
import { useFormik } from "formik";
import moment from "moment";
import { AddVendorCall } from "~utils/Network/api";
import { updateObject, onChangePhoneNo } from "~utils/Helpers";
import LoadingOverlay from "~components/LoadingOverlay";

export default ({ navigation, route }) => {
  const [countryFlag, setCountryFlag] = useState("US");
  const [countryCode, setCountryCode] = useState("+1");
  const user = useSelector((state) => state?.authUser?.authUser);
  const [isEnabled, setIsEnabled] = useState(true);
  const [toggleCheckBox, setToggleCheckBox] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const scroll = useRef();
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);
  const [visibleCountryModal, setVisibleCountryModal] = useState(false);
  const [isStartPickerVisible, setStartPickerVisibility] = useState(false);
  const [isEndPickerVisible, setEndPickerVisibility] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [formErrors, setFormErrors] = useState({
    phone: "",
  });
  const [form, setForm] = useState({
    phone: "",
  });
  const { unit } = route?.params;
  const state = useFormik({
    initialValues: {
      companyName: "",
      email: "",
      firstName: "",
      lastName: "",
      purpose: "",
      startDate: "",
      endDate: "",
    },
    validationSchema: yup.object({
      firstName: yup
        .string()
        .trim()
        .max(255)
        .required("This field may not be blank.")
        .matches(/^[a-zA-Z]*$/, "Invalid first name"),
      companyName: yup
        .string()
        .trim()
        .max(255)
        .required("This field may not be blank."),
      lastName: yup
        .string()
        .trim()
        .max(255)
        .required("This field may not be blank.")
        .matches(/^[a-zA-Z]*$/, "Invalid last name"),

      email: yup
        .string()
        .trim()
        .max(255)
        .email("Please use a valid email address.")
        .required("This field may not be blank."), // return true false based on validation

      purpose: yup
        .string()
        .trim()
        .max(255)
        .required("This field may not be blank."),

      startDate: yup
        .string()
        .trim()
        .max(255)
        .required("This field may not be blank."),

      endDate: yup
        .string()
        .trim()
        .max(255)
        .required("This field may not be blank."),
    }),
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: async (value) => {
      if (!onChangePhoneNo(form?.phone))
        updateObject("Phone Number is InValid", "phone", setFormErrors);
      else addVendor();
    },
  });

  const addVendor = () => {
    if (user?.token?.access) {
      setLoading(true);
      AddVendorCall(addVendorPayLoader(), user.token.access, unit?.unit_id)
        .then((res) => {
          setLoading(false);
          if (res?.data?.success) setShowModal(true);
        })
        .catch((error) => {
          setLoading(false);
          if (
            error?.response?.data?.message
          ) {
            if (
              error.response.data.message[0]?.email
            )
              Alert.alert("Email", error.response.data.message[0].email);
          }
          {
            error?.response?.data?.message?.[0]?.error
              ? Alert.alert(
                "Already Exist",
                error?.response?.data?.message?.[0]?.error
              )
              : null;
          }
        });
    }
  };

  const addVendorPayLoader = () => {
    let payload = {
      company_name: state?.values?.companyName,
      is_ingress: isEnabled,
      purpose: state?.values?.purpose,
      start_date: state?.values?.startDate,
      end_date: state?.values?.endDate,
      user_info: {
        first_name: state?.values?.firstName,
        last_name: state?.values?.lastName,
        email: state?.values?.email.toLowerCase().trim(),
        phone_no: form?.phone,
      },
    };
    return payload;
  };

  const onSelectCountry = (value) => {
    if (value?.callingCode[0]) {
      setCountryFlag(value?.cca2);
      setCountryCode(`+${value?.callingCode[0]}`);
    }
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

  const showStartDatePicker = (start) => {
    setStartPickerVisibility(true);
  };

  const showEndDatePicker = () => {
    setEndPickerVisibility(true);
  };

  const handleStartDateCancel = () => {
    setStartPickerVisibility(false);
  };

  const handleEndDateCancel = () => {
    setEndPickerVisibility(false);
  };

  const handleStartDateConfirm = (date) => {
    setStartDate(moment(date).format("yyyy-MM-DD"));
    state.setFieldValue("startDate", moment(date).format("yyyy-MM-DD"));
    setStartPickerVisibility(false);
  };

  const handleEndDateConfirm = (date) => {
    setEndDate(moment(date).format("yyyy-MM-DD"));
    state.setFieldValue("endDate", moment(date).format("yyyy-MM-DD"));
    setEndPickerVisibility(false);
  };

  const onChangeTxtPhoneNo = (value) => {
    setForm({ ...form, phone: countryCode + value });
    if (!onChangePhoneNo(countryCode + value))
      updateObject("Phone number is invalid", "phone", setFormErrors);
    else updateObject("", "phone", setFormErrors);
  };

  const displayError = (error) => {
    if(error){
      return(
        <Text style={Styles.errorText}>{error}</Text>
        )
    }
  }

  return (
    <>
      {loading ? <LoadingOverlay /> : (
        <>
          <SimpleHeader
            headerLabel={"Add Vendor"}
            backgroundColor={Colors.inputBackgroundColor}
            backIcon={true}
            onPress={gotoBack}
          />
          <KeyboardAwareScrollView
            ref={scroll} 
            style={styles.container}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={styles.vendor}
            >
              <View style={{ flex: 1 }}>
                <TextInput
                  label={"Company Name*"}
                  onChangeText={state?.handleChange("companyName")}
                  value={state?.values?.companyName}
                  errorMessage={state?.errors?.companyName}
                  name={"companyName"}
                  onBlur={() => state?.validateField("companyName")}
                />
                  {displayError(state?.errors?.companyName)}
                <Separator height={20} />
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-around",
                  }}
                >
                  <View style={{ flex: 0.5 }}>
                    <TextInput
                      label={"First Name*"}
                      onChangeText={state?.handleChange("firstName")}
                      value={state?.values?.firstName}
                      errorMessage={state?.errors?.firstName}
                      name={"firstName"}
                      onBlur={() => state?.validateField("firstName")}
                    />
                    {displayError(state?.errors?.firstName)}
                  </View>
                  <View style={{ flex: 0.5, marginLeft: 20 }}>
                    <TextInput
                      label={"Last Name*"}
                      onChangeText={state?.handleChange("lastName")}
                      value={state?.values?.lastName}
                      errorMessage={state?.errors?.lastName}
                      name={"lastName"}
                      onBlur={() => state?.validateField("lastName")}
                    />
                    {displayError(state?.errors?.lastName)}
                  </View>
                </View>
                <Separator height={20} />
                <TextInput
                  label={"Purpose*"}
                  onChangeText={state?.handleChange("purpose")}
                  value={state?.values?.purpose}
                  errorMessage={state?.errors?.purpose}
                  name={"purpose"}
                  onBlur={() => state?.validateField("purpose")}
                />
                {displayError(state?.errors?.purpose)}
                <Separator height={20} />
                <TextInput
                  label={"Email*"}
                  onChangeText={state?.handleChange("email")}
                  value={state?.values?.email}
                  errorMessage={state?.errors?.email}
                  name={"email"}
                  onBlur={() => state?.validateField("email")}
                />
                {displayError(state?.errors?.email)}
                <Separator height={20} />
                <View style={styles.textInputContainerRow}>
                  <View style={{ width: "32%" }}>
                    <Text style={Styles.inputLabel}>Phone*</Text>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setVisibleCountryModal(true)}
                      style={[Styles.textInputStyle, styles.contryButtonContainer]}
                    >
                      <CountryFlag
                        style={styles.contryFlag}
                        isoCode={countryFlag}
                      />
                      <Text style={[Styles.inputLabel, { marginBottom: 0 }]}>{countryCode}</Text>
                      <Image style={Styles.icon} source={AssetImages.down} />
                    </TouchableOpacity>
                    <CountryPicker
                      theme={DARK_THEME}
                      onSelect={onSelectCountry}
                      visible={visibleCountryModal}
                      containerButtonStyle={{ display: "none" }}
                      onClose={() => setVisibleCountryModal(false)}
                    />
                  </View>
                  <View style={{ width: "63%" }}>
                    <TextInput
                      onChangeText={(value) => onChangeTxtPhoneNo(value)}
                      keyboardType={"phone-pad"}
                      autoCapitalize="none"
                      label=" "
                      errorMessage={formErrors?.phone}
                    />
                    {displayError(formErrors?.phone)}
                  </View>
                </View>
                <Separator height={20} />
                <TextInput
                  label={"Start Date*"}
                  editable={false}
                  rightIcon={AssetImages.calendarIcon}
                  rightIconPress={showStartDatePicker}
                  name={"startDate"}
                  onChangeText={state?.handleChange("startDate")}
                  value={state?.values?.startDate}
                  errorMessage={state?.errors?.startDate}
                  onBlur={() => state?.validateField("startDate")}
                />
                {displayError(state?.errors?.startDate)}
                <Separator height={20} />
                <TextInput
                  label={"End Date*"}
                  editable={false}
                  rightIcon={AssetImages.calendarIcon}
                  rightIconPress={showEndDatePicker}
                  name={"endDate"}
                  onChangeText={state?.handleChange("endDate")}
                  value={state?.values?.endDate}
                  errorMessage={state?.errors?.endDate}
                  onBlur={() => state?.validateField("endDate")}
                />
                {displayError(state?.errors?.endDate)}
                <Separator height={20} />
                <Text style={{ color: "white" }}>
                  Primary user will need to approve the ingress/egress of the unit
                  door opening:
                </Text>
                <Separator height={10} />
                <View style={styles.toggle}>
                  <Switch
                    trackColor={{
                      false: "#767577",
                      true: Colors.primaryButtonBackgroundColor,
                    }}
                    thumbColor={isEnabled ? "white" : "white"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={toggleSwitch}
                    value={isEnabled}
                  />
                  <Text style={{ color: "white", marginLeft: 10 }}>
                    {isEnabled ? "Enabled" : "Disabled"}
                  </Text>
                </View>
                <Separator height={20} />
                <View style={styles.toggle}>
                  <CheckBox
                    disabled={false}
                    value={toggleCheckBox}
                    tintColors={{
                      true: Colors.primaryButtonBackgroundColor,
                      false: Colors.primaryButtonBackgroundColor,
                    }}
                    tintColor={Colors.primaryButtonBackgroundColor}
                    onCheckColor={Colors.inputBackgroundColor}
                    onFillColor={Colors.primaryButtonBackgroundColor}
                    onTintColor={Colors.primaryButtonBackgroundColor}
                    style={styles.checkbox}
                    boxType="square"
                    onValueChange={(newValue) => setToggleCheckBox(newValue)}
                  />
                  <Text style={styles.checkboxText} onPress={() => setToggleCheckBox(!toggleCheckBox)}>
                    {"Accept all responsibility of the vendor."}
                  </Text>
                </View>
              </View>
            </View>
            <Separator height={20} />
            <View
              style={styles.submit}
            >
              <PrimaryButton
                onPress={() => {
                  state?.submitForm();
                }}
                error={
                  !Object.values(state?.errors).every(
                    (x) => x === null || (x === "" && formErrors?.phone === "")
                  )
                }
                disabled={!toggleCheckBox}
                label={"Invite"}
              />
            </View>
            <DateTimePickerModal
              isVisible={isStartPickerVisible}
              mode="date"
              onConfirm={handleStartDateConfirm}
              onCancel={handleStartDateCancel}
              minimumDate={new Date()}
              maximumDate={endDate ? new Date(endDate) : undefined}
            />

            <DateTimePickerModal
              isVisible={isEndPickerVisible}
              mode="date"
              onConfirm={handleEndDateConfirm}
              onCancel={handleEndDateCancel}
              minimumDate={startDate ? new Date(startDate) : undefined}
            />
            <CustomModal
              isVisible={showModal}
              icon={AssetImages.completed}
              primaryButtonText={"Continue"}
              title={"Invitation Sent"}
              des={"Invitation successfully sent on email."}
              onPress={gotoBack}
            />
          </KeyboardAwareScrollView>
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  textInputContainerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  contryButtonContainer: {
    height: 40,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: Colors.inputBackgroundColor,
  },

  container: {
    flex: 1,
    width: "100%",
    backgroundColor: Colors.backgroundColor,
  },

  contryFlag: { borderRadius: 11, height: 22, width: 22 },
  vendor: {
    flex: 1,
    marginHorizontal: 10,
    marginTop: 10,
  },
  toggle: { flexDirection: "row", alignItems: "center" },
  submit: {
    flex: 1,
    padding: 10,
    width: "100%",
    marginBottom: 10,
  },
  checkboxText: { color: "white", marginLeft: 15, fontSize: 13 },
  checkbox: {
    height: 20,
    width: 20,
    alignItems: "center",
    border: "none",
    outline: "none",
  },
});
