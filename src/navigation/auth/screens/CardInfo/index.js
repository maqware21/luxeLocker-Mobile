import React, { useState, useRef, useEffect } from "react";
import { Text, Alert, View, StyleSheet, BackHandler, Keyboard } from "react-native";
import SimpleHeader from "~components/SimpleHeader";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import axios from "axios";
import Colors from "~utils/Colors";
import TextInput from "~components/TextInput";
import PrimaryButton from "~components/PrimaryButton";
import MaskingInput from "~components/MaskingInput";
import NetInfo from "@react-native-community/netinfo";
import InternetModal from "~components/InternetModal";
import {
  getCardListingCall,
  AddCardCall,
  addPaymentForRegistedUser,
  getDrivingLicenseCall,
} from "~utils/Network/api";
import validator from "validator";
import Separator from "~components/Separator";
import CheckBox from "@react-native-community/checkbox";
import { CommonActions } from "@react-navigation/native";
import { useSelector } from "react-redux";
import CustomModal from "~components/CustomModal";
import Card from "~components/Card";
import LoadingOverlay from "~components/LoadingOverlay";
import * as yup from "yup";
import { useFormik } from "formik";
import AssetImages from "~assets";
import { PUBLISHABLE_KEY, SECRET_KEY } from "@env"
import Styles from "~utils/Style/Styles";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default ({ navigation, route }) => {

  const isLoggedIn = async () => {
    const value = await AsyncStorage.getItem("isLoggedIn");
    setLoggedIn(JSON.parse(value));
  };
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());

  const scroll = useRef();
  const [cardInfo, setCardInfo] = useState(null);
  const user = useSelector((state) => state?.authUser?.authUser);
  const [network, setNetwork] = useState(false);
  const [serverError, setServerError] = useState(false);
  const [getCards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toggleCheckBox, setToggleCheckBox] = useState(true);
  const [showCardErrorModal, setShowCardErrorModal] = useState(false);
  const [isModal, setModal] = useState(false);
  const [cardAddModal, setCardAddModal] = useState(false);
  const [hasDoc, setHasDoc] = useState(false);
  const [disableButton, setDisableButton] = useState(true);

  const state = useFormik({
    initialValues: {
      cardNo: "",
      expireDate: "",
      cvcNo: "",
      accountHolderName: "",
      firstName: "",
      lastName: "",
      address_one: "",
      address_two: "",
      zipCode: "",
      city: "",
    },

    validationSchema: yup.object({
      cardNo: yup
        .string()
        .trim()
        .max(255)
        .required("This field may not be blank.")
        .test("email_async_validation", "Invalid Card Number", (value) =>
          validator.isCreditCard(value || "")
        ),

      expireDate: yup
        .string()
        .trim()
        .max(255)
        .required("This field may not be blank.")
        .matches(
          /^(0[1-9]|1[0-2])\/?([0-9]{4}|[0-9]{2})$/,
          "Invalid Expire Date"
        ),

      cvcNo: yup
        .string()
        .trim()
        .max(255)
        .required("This field may not be blank."),

      accountHolderName: yup
        .string()
        .trim()
        .max(255)
        .required("This field may not be blank.")
        .matches(/^[a-zA-Z_ ]*$/, "Invalid Account Holder Name"),

      address_two: yup.string(),
      ...(!toggleCheckBox && {
        zipCode: yup
          .string()
          .trim()
          .max(255)
          .required("This field may not be blank."),

        address_one: yup
          .string()
          .trim()
          .max(255)
          .required("This field may not be blank."),

        firstName: yup
          .string()
          .trim()
          .max(255)
          .required("This field may not be blank.")
          .matches(/^[a-zA-Z]*$/, "Invalid first name"),

        lastName: yup
          .string()
          .trim()
          .max(255)
          .required("This field may not be blank.")
          .matches(/^[a-zA-Z]*$/, "Invalid last name"),

        city: yup
          .string()
          .trim()
          .max(255)
          .required("This field may not be blank."),
      }),
    }),
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: async (value) => {
      NetInfo.fetch().then(async (state) => {
        if (state.isConnected) {
          fethcCardInfo();
          setNetwork(false);
          setServerError(false);
        } else {
          setServerError(false);
          setNetwork(true);
        }
      });
    },
  });

  const getDrivingLicenseHandler = () => {
    getDrivingLicenseCall(user?.token?.access)
      .then((res) => {
        if (
          res?.data?.data?.front?.url &&
          res?.data?.data?.back?.url
        ) {
          setHasDoc(true);
        }
      })
      .catch((error) => {
        console.log("getDrivingLicenseHandler error", error);
      });
  };

  const getAllCardsHandler = () => {
    setCards([]);
    setLoading(true);
    getCardListingCall(user?.token?.access)
      .then((res) => {
        setLoading(false);
        if (res?.data?.data) {
          setCards(res.data.data);
        }
      })
      .catch((error) => {
        setLoading(false);
      });
  };

  const goToDoneScreen = () => {
    setModal(false);
    navigation.navigate("lockerReady", {user: user });
  };

  const fethcCardInfo = async () => {
    setLoading(true);
    let tempString = state?.values?.expireDate;
    var res = tempString.split("/");
    var details = {
      "card[number]": state?.values?.cardNo,
      "card[exp_month]": res[0],
      "card[exp_year]": res[1],
      "card[cvc]": state?.values?.cvcNo,
      "card[name]": state?.values?.accountHolderName,
      "card[address_line1]": !toggleCheckBox
        ? state?.values?.address_one
        : user?.mailing_address?.street_address,
      "card[address_line2]": !toggleCheckBox
        ? state?.values?.address_two
        : user?.mailing_address?.street_address,
      "card[address_state]": !toggleCheckBox
        ? state?.values?.city
        : user?.mailing_address?.state?.name,
      "card[address_zip]": !toggleCheckBox
        ? state?.values?.zipCode
        : user?.mailing_address?.zipcode,
    };
    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    axios
      .post("https://api.stripe.com/v1/tokens", formBody, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${PUBLISHABLE_KEY}`,
        },
      })
      .then((res) => {
        setLoading(false);
        if (res?.data?.card) {
          setCardInfo(res.data);
          AddCardToStipe(res.data.id);
        }
      })
      .catch((err) => {
        setLoading(false);
        Alert.alert("Error", err?.response?.data?.error?.message);
      });
  };

  useEffect(() => {
    setLoading(false);
    const unsubscribe = navigation.addListener("focus", () => {
      getAllCardsHandler();
      getDrivingLicenseHandler();
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const { cardNo, cvcNo, expireDate, accountHolderName, address_one, firstName, lastName, city, zipCode } = state.values;
    const requiredFields = toggleCheckBox
      ? { cardNo, cvcNo, expireDate, accountHolderName }
      : { cardNo, cvcNo, expireDate, accountHolderName, address_one, firstName, lastName, city, zipCode };
    const disabled = Object.values(requiredFields).some(
        (x) => x === null || x === ""
        )
    setDisableButton(disabled || getCards?.length === 2)
  }, [state, state.values])

  const gotoBack = () => {
    if (route?.params?.from === "payment"){
      navigation.dispatch(CommonActions.goBack());
    } 
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", gotoBack);
    return () => {
      BackHandler.removeEventListener("hardwareBackPress", gotoBack);
    };
  }, []);

  const CallPaymentForRegistedUser = () => {
    setLoading(true);

    addPaymentForRegistedUser(user?.token?.access, route?.params?.unitId)
      .then((res) => {
        if (res?.data?.success) {
          setModal(true);
          setLoading(false);
        }
      })
      .catch((error) => {
        if (
          error?.response?.status == 404 &&
          error?.response?.status == 400
        ) {
          Alert.alert("Error", "Went some thing wrong");
        }
        setLoading(false);
        if (error?.response?.data?.message?.length > 0) {
          {
            error?.response?.data?.message?.[0]?.error &&
              Alert.alert("Error", error?.response?.data?.message?.[0]?.error);
          }
          {
            error?.response?.data?.message?.[0]?.permission &&
              Alert.alert(
                "Error",
                error?.response?.data?.message?.[0]?.permission
              );
          }
          error?.response?.data?.message?.[0]?.Stripe &&
            Alert.alert("Error", error?.response?.data?.message?.[0]?.Stripe);
        }
      });
  };

  const AddCardToStipe = (CardTokne) => {
    setLoading(true);
    var details = {
      source: CardTokne,
    };
    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    axios
      .post(
        `https://api.stripe.com/v1/customers/${user.stripe_customer_id}/sources`,
        formBody,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Bearer ${SECRET_KEY}`,
          },
        }
      )
      .then((res) => {
        AddCardApiMethod(res?.data, user?.token?.access);
      })
      .catch((err) => {
        setLoading(false);
      });
  };

  const AddCardApiMethod = (data, token) => {
    AddCardCall(addCardPayforSetting(data), token)
      .then((res) => {
        setCardAddModal(true);
        getAllCardsHandler();
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        {
          error?.response?.data?.message?.[0]?.permission &&
            Alert.alert(
              "Error",
              error?.response?.data?.message?.[0]?.permission
            );
        }
        {
          error?.response?.data?.message?.[0]?.error &&
            Alert.alert("Error", error?.response?.data?.message?.[0]?.error);
        }
        {
          error?.response?.data?.message?.[0]?.card &&
            Alert.alert("Error", error?.response?.data?.message?.[0]?.card);
        }
        if (error?.response.data?.message?.[0]?.error?.includes("LEASE")) {
          Alert.alert(
            "Error",
            "At this moment you cannot lease selected unit. Kindly contact Support."
          );
        }
      });
  };
  const addCardPayforSetting = (response) => {
    let payload = {
      card_id: response?.id,
      address_city:
        response?.address_city === null ? "" : response?.address_city,
      address_country:
        response?.address_country === null ? "" : response?.address_country,
      address_line1: response?.address_line1,
      address_line2: response?.address_line2,
      address_state: response?.address_state,
      address_zip: response?.address_zip,
      country: response?.country,
      funding: response?.funding,
      card_number: response?.last4,
      exp_month: response?.exp_month,
      exp_year: response?.exp_year,
      name: response?.name,
      customer: user?.stripe_customer_id,
      brand: response?.brand,
      fingerprint: response?.fingerprint,
      is_default: getCards && getCards.length === 0 ? true : false,
    };
    return payload;
  };

  return (
    <>
          <SimpleHeader
            backgroundColor={Colors.inputBackgroundColor}
            headerLabel={
              route?.params?.from || route?.params?.unitId
                ? "Add Card"
                : "Create New Account"
            }
            backIcon={route?.params?.from ? true : false}
            onPress={gotoBack}
          />
      <KeyboardAwareScrollView keyboardShouldPersistTaps={'always'} ref={scroll} style={styles.keyboardAware}>
        <View style={styles.formView}>
              <MaskingInput
                label={"Card Number"}
                placeholder={"0000 0000 0000 0000"}
                type={"credit-card"}
                value={state?.values?.cardNo}
                errorMessage={state?.errors?.cardNo}
                name="cardNo"
                onChangeText={state.handleChange("cardNo")}
                onBlur={() => state.validateField("cardNo")}
              />

              <View style={styles.zipCodeContainer}>
            <View style={styles.expireSecurityCode}>
                  <MaskingInput
                    label={"Expiration Date"}
                    placeholder={"MM / YY"}
                    type="custom"
                    name="expireDate"
                    options={{ mask: "99/99" }}
                    keyboardType={"numeric"}
                    value={state?.values?.expireDate}
                    errorMessage={state?.errors?.expireDate}
                    onChangeText={state.handleChange("expireDate")}
                    onBlur={() => state.validateField("expireDate")}
                  />
                </View>
            <View style={[styles.expireSecurityCode, { marginLeft: 6 }]}>
                  <MaskingInput
                    label={"Security Code"}
                    placeholder={"CVC"}
                    type="custom"
                    options={{ mask: "9999" }}
                    keyboardType={"numeric"}
                    name="cvcNo"
                    value={state?.values?.cvcNo}
                    errorMessage={state?.errors?.cvcNo}
                    onChangeText={state.handleChange("cvcNo")}
                    onBlur={() => state.validateField("cvcNo")}
                  />
                </View>
              </View>

              <View style={{ paddingTop: 20 }}>
                <TextInput
                  label={"Card holder Name"}
                  placeholder="Enter card holder’s full name"
                  name="accountHolderName"
                  value={state?.values?.accountHolderName}
                  errorMessage={state?.errors?.accountHolderName}
                  onChangeText={state.handleChange("accountHolderName")}
                  onBlur={() => state.validateField("accountHolderName")}
                />
                {state?.errors?.accountHolderName ? (
                  <Text style={{ color: Colors.red, marginTop: 10 }}>
                    {state.errors.accountHolderName}
                  </Text>
                ) : null}
                <View style={styles.agreementContainer}>
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
                <Text style={styles.insuranceSubtotal} onPress={() => setToggleCheckBox(!toggleCheckBox)}>
                    {"Billing address is the same as mailing address"}
                  </Text>
                </View>
                {!toggleCheckBox ? (
                  <View>
                    <Separator height={20} />
                    <Text style={styles.headerText}>Billing Information</Text>
                    <Separator height={20} />
                    <View>
                      <View style={styles.textInputContainerRow}>
                        <View style={styles.nameInput}>
                          <TextInput
                            value={state?.values?.firstName}
                            errorMessage={state?.errors?.firstName}
                            onChangeText={state.handleChange("firstName")}
                            autoCapitalize="none"
                            label="First Name*"
                            name={"firstName"}
                            onBlur={() => state.validateField("firstName")}
                          />
                          {state?.errors?.firstName ? (
                            <Text style={Styles.errorText}>
                              {state.errors.firstName}
                            </Text>
                          ) : null}
                        </View>
                    <View style={styles.nameInput}>
                          <TextInput
                            value={state?.values?.lastName}
                            errorMessage={state?.errors?.lastName}
                            onChangeText={state.handleChange("lastName")}
                            autoCapitalize="none"
                            label="Last Name*"
                            name={"lastName"}
                            onBlur={() => state.validateField("lastName")}
                          />
                          {state?.errors?.lastName ? (
                            <Text style={Styles.errorText}>
                              {state.errors.lastName}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                      <Separator height={20} />
                      <TextInput
                        label={"Address 1*"}
                        value={state?.values?.address_one}
                        errorMessage={state?.errors?.address_one}
                        onChangeText={state.handleChange("address_one")}
                        onBlur={() => state.validateField("address_one")}
                        name={"address_one"}
                        maxLength={15}
                      />
                      {state?.errors?.address_one ? (
                        <Text style={Styles.errorText}>
                          {state.errors.address_one}
                        </Text>
                      ) : null}
                      <Separator height={20} />
                      <TextInput
                        label={"Address 2"}
                        value={state?.values?.address_two}
                        errorMessage={state?.errors?.address_two}
                        onChangeText={state.handleChange("address_two")}
                        onBlur={() => state.validateField("address_two")}
                        name={"address_two"}
                        maxLength={15}
                      />
                      <View style={styles.zipCodeContainer}>
                        <View style={{ flex: 0.3 }}>
                          <TextInput
                            label={"Zip Code*"}
                            value={state?.values?.zipCode}
                            errorMessage={state?.errors?.zipCode}
                            onChangeText={state.handleChange("zipCode")}
                            onBlur={() => state.validateField("zipCode")}
                            name={"zipCode"}
                            keyboardType={"numeric"}
                          />
                          {state?.errors?.zipCode ? (
                            <Text style={Styles.errorText}>
                              {state.errors.zipCode}
                            </Text>
                          ) : null}
                        </View>
                        <View style={{ flex: 0.7, marginLeft: 6 }}>
                          <TextInput
                            label={"State*"}
                            value={state?.values?.city}
                            errorMessage={state?.errors?.city}
                            onChangeText={state.handleChange("city")}
                            onBlur={() => state.validateField("city")}
                            name={"city"}
                          />
                          {state?.errors?.city ? (
                          <Text style={Styles.errorText}>{state.errors.city}</Text>
                          ) : null}
                        </View>
                      </View>
                    </View>
                  </View>
                ) : null}
              </View>
            </View>
            <View style={styles.primaryButtonContainer}>
              {getCards && getCards.length > 2 ? null : (
                <PrimaryButton
                  label={"Add Card"}
                  onPress={() => {
                    Keyboard.dismiss()
                    state.submitForm();
                  }}
                  error={
                    !Object.values(state.errors).every(
                      (x) => x === null || x === ""
                    )
                  }
                  disabled = { disableButton }
                />
              )}
              {!route?.params?.from ? (
                <View>
                  {getCards && getCards.length > 0 ? (
                    <Card
                      card={getCards}
                      user={user?.token?.access}
                      getAllCardsHandler={getAllCardsHandler}
                      listHeader={"Your Cards"}
                    />
                  ) : null}
                </View>
              ) : null}
              
              {route?.params?.from ? null : (
                <View style={{ marginTop: 10 }}>
                  <PrimaryButton
                    label={"Next"}
                    onPress={() => {
                      getCards && getCards.length > 0
                        ? CallPaymentForRegistedUser()
                        : setShowCardErrorModal(true);
                    }}
                    disabled={getCards && getCards.length > 0 ? false : true}
                  />
                </View>
              )}
              
            </View>
            <CustomModal
              isVisible={isModal}
              icon={AssetImages.completed}
              primaryButtonText={"Continue"}
              title={route?.params?.from ? "Completed" : "Completed"}
              des={
                "Your locker is being prepared and will be ready in a few moments."
              }
              onPress={goToDoneScreen}
            />

            <CustomModal
              isVisible={cardAddModal}
              icon={AssetImages.completed}
              primaryButtonText={"Continue"}
              title={route?.params?.from ? "Completed" : "Completed"}
              des={"Card Added Successfully"}
              onPress={() => {
                setCardAddModal(false);
                gotoBack();
              }}
            />
            <CustomModal
              isVisible={showCardErrorModal}
              icon={AssetImages.errorCard}
              primaryButtonText={"Close"}
              title={"Error"}
              des={"In order to continue, please add a credit card."}
              onPress={() => setShowCardErrorModal(false)}
            />
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
            primaryButtonText={"Close"}
            onPress={() => setNetwork(false)}
          />
        {loading && <LoadingOverlay /> }
    </>
  );
};
const styles = StyleSheet.create({
  keyboardAware:{
    width: "100%", 
    flex: 1,
  },
  formView: {
    padding: 10, 
    marginTop: 10, 
  },
  expireSecurityCode: { flex: 0.5 },
  checkbox: {
    height: 28,
    width: 28,
    alignItems: "center",
    border: "none",
    outline: "none",
  },
  nameInput: { width: "49%" },
  headerText: {
    color: Colors.white,
    fontFamily: "Inter-Medium",
    fontSize: 15,
    alignSelf: "flex-start",
  },
  textInputContainerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  agreementContainer: {
    flexDirection: "row",
    marginTop: 10,
    alignItems: "center",
  },
  insuranceSubtotal: { color: "white", marginLeft: 15, paddingVertical: 5  },
  errorText: {
    color: "red",
  },
  primaryButtonContainer: {
    width: "95%",
    justifyContent: "center",
    marginLeft: 10,
    marginTop: 20,
  },
  zipCodeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1,
    marginTop: 20,
  },
});
