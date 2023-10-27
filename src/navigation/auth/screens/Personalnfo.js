import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  BackHandler,
  TouchableOpacity,
  Image,
  Alert,
  Image as RNImage,
  Platform,
} from "react-native";
const { isValid } = require("usdl-regex");

import Separator from "~components/Separator";
import { CommonActions } from "@react-navigation/native";
import { updateObject, onChangePhoneNo } from "~utils/Helpers";
import validator from "validator";
import SimpleHeader from "~components/SimpleHeader";
import PrimaryButtom from "~components/PrimaryButton";
import Colors from "~utils/Colors";
import TextInput from "~components/TextInput";
import SelectDropdown from "react-native-select-dropdown";
import Styles from "~utils/Style/Styles";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import BackgroundTimer from "react-native-background-timer";
import CustomModal from "~components/CustomModal";
import AssetImages from "~assets";
import LoadingOverlay from "~components/LoadingOverlay";
import { useDispatch } from "react-redux";
import { authUser } from "~redux/reducers/authReducer";
import { requestPermission } from "~utils/Helpers";

import {
  stateCall,
  cityCall,
  registerCall,
  getProfileStageCall,
} from "~utils/Network/api";

// For Country Picket and Flag
import CountryFlag from "react-native-country-flag";
import CountryPicker, { DARK_THEME } from "react-native-country-picker-modal";

export default ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { email, password } = route?.params;
  const [unitDetail, setUnitDetail] = useState(null);
  const [isModal, setModal] = useState(false);

  const [buyUnit, setBuyUnit] = useState(false);
  const scroll = useRef();
  const citiesDropdownRef = useRef();
  const stateDropDownRef = useRef();
  const leaseTermOptionRef = useRef();
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [profileStage, setProfileStage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: email,
    password: password,
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    driverLicense: "",
    leaseTerm: "",
  });
  const [stateCode, setStateCode] = useState("");
  const [fcmToken, setFcmToken] = useState("");
  const [formErrors, setFormErrors] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    driverLicense: "",
    leaseTerm: "",
  });
  ("");

  const lastNameRef = useRef();
  const phoneRef = useRef();
  const addressRef = useRef();
  const zipCodeRef = useRef();
  const driverLicenseRef = useRef();

  //***** Flag States And Methods Start *****//
  const [countryFlag, setCountryFlag] = useState("US");
  const [countryCode, setCountryCode] = useState("+1");
  const [leaseTermOption, setleaseTermOption] = useState("");
  const [leasetermDropdownOpen, setleasetermDropdownOpen] = useState(false);
  const [visibleCountryModal, setVisibleCountryModal] = useState(false);
  const [leaseConfirmationModal, setLeaseConfirmationModal] = useState(false);

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

  const getFcmToken = (callback) => {
    requestPermission(async (response) => {
      callback(response);
    });
  };

  useEffect(() => {
    setLoading(false);
    BackgroundTimer.stopBackgroundTimer();
    setLoading(false);
    loadCities();
    if (route?.params?.unit) {
      setUnitDetail(route.params.unit);
      setBuyUnit(route.params.buyUnit);
    }
    getFcmToken((fcmToken) => {
      setFcmToken(fcmToken);
    });
  }, []);

  useEffect(() => {
    if (route?.params?.profileStage && profileStage !== "insurance") {
      dispatch(authUser(route?.params?.res));
      setModal(true);
      getProfileStageCallHander(route?.params?.res);
    }
  }, []);

  const loadCities = async () => {
    await stateCall()
      .then((res) => {
        setLoading(false);
        if (res?.status == 200) {
          setStates(res.data?.data);
          setStateCode(res.data?.data[0]?.code);
          setForm({ ...form, state: res.data?.data[0] });
          getAllCitiesRequest(res.data?.data[0]?.id);
        }
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
  };

  const getAllCitiesRequest = (id) => {
    cityCall(createPayload(id))
      .then((res) => {
        setCities(res.data?.data);
        setForm({ ...form, city: res.data?.data[0] });
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const createPayload = (id) => {
    let payload = {
      id: id,
    };
    return payload;
  };

  const handleNext = useCallback(async () => {
    setFormErrors({
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      driverLicense: "",
      leaseTerm: "",
    });
    updateObject("", "", setFormErrors);
    let hasErrors = false;
    if (validator.isEmpty(form?.firstName)) {
      updateObject("First name cannot be empty.", "firstName", setFormErrors);
      hasErrors = true;
    }
    if (!buyUnit && leaseTermOption == "") {
      updateObject("Please select lease term", "leaseTerm", setFormErrors);
      hasErrors = true;
    }
    if (!/^(?!\s+$)[A-Za-z\s]+$/.test(form.firstName)) {
      updateObject("Invalid First Name.", "firstName", setFormErrors);
      hasErrors = true;
    }

    if (validator.isEmpty(form?.lastName)) {
      updateObject("Last name cannot be empty.", "lastName", setFormErrors);
      hasErrors = true;
    }

    if (!/^(?!\s+$)[A-Za-z\s]+$/.test(form?.lastName)) {
      updateObject("Invalid Last Name.", "lastName", setFormErrors);
      hasErrors = true;
    }
    if (validator.isEmpty(form?.phone)) {
      updateObject("Phone cannot be empty.", "phone", setFormErrors);
      hasErrors = true;
    }

    if (validator.isEmpty(form?.address)) {
      updateObject("Address cannot be empty.", "address", setFormErrors);
      hasErrors = true;
    }

    if (!/^(?!\s+$)[a-zA-Z0-9 -]*$/.test(form?.address)) {
      updateObject("Invalid Address", "address", setFormErrors);
      hasErrors = true;
    }

    if (!onChangePhoneNo(form?.phone)) {
      updateObject("Invalid Phone Numbers", "phone", setFormErrors);
      hasErrors = true;
    }
    if (!/^(?!\s+$)[a-zA-Z0-9 -]*$/.test(form?.zipCode)){
      updateObject("Invalid Zip Code", "zipCode", setFormErrors);
      hasErrors = true;
    }
    if (validator.isEmpty(form?.zipCode)) {
      updateObject("zip code cannot be empty.", "zipCode", setFormErrors);
      hasErrors = true;
    }
  if (!route?.params?.buyUnit){
    if (validator.isEmpty(form?.driverLicense)) {
      updateObject(
        "Please enter drivers license number",
        "driverLicense",
        setFormErrors
      );
      hasErrors = true;
    }
    if (!isValid(stateCode, form?.driverLicense) && form?.driverLicense !== "") {
      updateObject(
        "Driver’s license number is invalid",
        "driverLicense",
        setFormErrors
      );
      hasErrors = true;
    }
  }
    if (hasErrors) {
      setLoading(false);
      return;
    } else {
      if (buyUnit) {
        handleRegister();
      } else {
        setLeaseConfirmationModal(true);
      }
    }
    return () => {
      BackgroundTimer.stopBackgroundTimer(); //after this call all code on background stop run.
    };
  }, [form, formErrors]);

  // To Get Country Flag
  const onSelectCountry = (value) => {
    if (value.callingCode[0]) {
      setCountryFlag(value.cca2);
      setCountryCode(`+${value.callingCode[0]}`);
    }
  };

  const onChangeTxtPhoneNo = (value) => {
    setForm({ ...form, phone: countryCode + value });
    if (!onChangePhoneNo(countryCode + value))
      updateObject("Phone number is invalid", "phone", setFormErrors);
    else updateObject("", "phone", setFormErrors);
  };

  const onChangeDrivingLicence = (val) => {
    setForm({ ...form, driverLicense: val });
    if (!isValid(stateCode, val)) {
      updateObject(
        "Driver’s license number is invalid",
        "driverLicense",
        setFormErrors
      );
    } else updateObject("", "driverLicense", setFormErrors);
  };
  const getProfileStageCallHander = (user) => {
    BackgroundTimer.runBackgroundTimer(() => {
      getProfileStageCall(user?.token?.access)
        .then((res) => {
          if (res?.data?.data) {
            setProfileStage(res.data.data?.salemate_obj?.profile_stage);
          }
        })
        .catch((error) => {
          console.log("error", error);
        });
    }, 1000);
  };

  const createPayloadForRegister = () => {
    let payload = {
      email: form?.email.toLocaleLowerCase().trim(),
      password: form?.password.trim(),
      first_name: form?.firstName.trim(),
      last_name: form?.lastName.trim(),
      phone_no: form?.phone,
      unit_id: unitDetail?.id,
      is_lessee: buyUnit === false ? true : false,

      location: {
        street: form?.address,
        city: form?.city.id,
        latitude: "324.4454",
        longitude: "454.5644",
        postalcode: "3400",
      },
      is_luxelocker_insurance: false,
      active: true,
      device_id: fcmToken,
      type: Platform.OS,
      lease_term: !buyUnit ? leaseTermOption : "buy",
    };
    if(!route?.params?.buyUnit){
      payload.driver_license_number = form?.driverLicense;
    }
    return payload;
  };

  const handleRegister = useCallback(async () => {
    setLoading(true);
    setLeaseConfirmationModal(false);

    await registerCall(createPayloadForRegister())
      .then((res) => {
        setLoading(false);

        if (res?.data?.data) {
          dispatch(authUser(res.data.data));
          if (
            res?.data?.data?.salemate_obj?.profile_stage === "insurance"
          ) {
            setModal(true);
            getProfileStageCallHander(res.data.data);
          } else if (
            res?.data?.data?.salemate_obj?.profile_stage === "sales_mate"
          ) {
            setModal(true);
            getProfileStageCallHander(res.data.data);
            const obj = {
              res: res,
              unitDetails: unitDetail,
              password: password,
            };
          } else if (
            res?.data?.data?.salemate_obj?.profile_stage === "sign_now"
          ) {
            getProfileStageCallHander(res.data.data);
            signNowScreen(res);
          }
        }
      })
      .catch((error) => {
        setLoading(false);
        {
          error?.response?.data?.message?.[0]?.email
            ? Alert.alert("Email", error?.response?.data?.message?.[0]?.email)
            : null;
        }
      });
  });

  const insuranceScreen = () => {
    setModal(false);
    BackgroundTimer.stopBackgroundTimer();
    navigation.navigate("insuranceScreen", {
      unitId: unitDetail.id,
      buyUnit: buyUnit,
      unit: unitDetail,
      email: route?.params?.email,
      password: route?.params?.password,
    });
  };
  const signNowScreen = (res) => {
    BackgroundTimer.stopBackgroundTimer();
    navigation.navigate("signature", {
      signing_url: res?.data?.data?.signing_url,
      unitId: unitDetail?.id,
      unit: unitDetail,
      email: route?.params?.email,
      password: route?.params?.password,
    });
  };

  const myUnitsScreen = () => {
    BackgroundTimer.stopBackgroundTimer();
    setModal(false);
    navigation.navigate("tabs", { screen: "MyUnits" });
  };

  return (
    <>
          <SimpleHeader
            headerLabel={"Create New Account"}
            showbackButton={true}
            onPress={gotoBack}
            backIcon={true}
          />
          {/* Personal Info ui..... */}
          <View style={{ flex: 1, position: "relative" }}>
          <KeyboardAwareScrollView 
          ref={scroll} 
          style={styles.container}
          showsVerticalScrollIndicator={false}
          >
            <View>
              <Text style={styles.headerText}>Personal Information</Text>
              <Separator height={20} />
              <View>
                <View style={styles.textInputContainerRow}>
                  <View style={{ width: "47%" }}>
                    <TextInput
                    errorMessage={formErrors?.firstName}
                      onChangeText={(value) =>
                        updateObject(value, "firstName", setForm)
                      }
                      autoCapitalize="none"
                      label="First Name*"
                      onSubmitEditing={() => {
                        lastNameRef?.current?.focus();
                      }}
                    />
                  {formErrors?.firstName ? (
                      <Text style={Styles.errorText}>{formErrors.firstName}</Text>
                    ) : null}
                  </View>
                  <View style={{ width: "47%" }}>
                    <TextInput
                    errorMessage={formErrors?.lastName}
                      onChangeText={(value) =>
                        updateObject(value, "lastName", setForm)
                      }
                      label="Last Name*"
                      autoCapitalize="none"
                      inputRef={lastNameRef}
                      onSubmitEditing={() => {
                        phoneRef?.current?.focus();
                      }}
                    />
                  {formErrors?.lastName ? (
                      <Text style={Styles.errorText}>{formErrors.lastName}</Text>
                    ) : null}
                  </View>
                </View>
                <Separator height={10} />
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
                    errorMessage={formErrors?.phone}
                      onChangeText={(value) => onChangeTxtPhoneNo(value)}
                      keyboardType={"numeric"}
                      autoCapitalize="none"
                      label=" "
                      inputRef={phoneRef}
                      onSubmitEditing={() => {
                        addressRef?.current?.focus();
                      }}
                    />
                  {formErrors?.phone ? (
                      <Text style={Styles.errorText}>{formErrors.phone}</Text>
                    ) : null}
                  </View>
                </View>

            {/* Mailing info Ui */}

            <Text style={styles.MailingheaderText}>Mailing Address</Text>
            <Separator height={10} />
            <TextInput
                errorMessage={formErrors?.address}
              onChangeText={(value) => updateObject(value, "address", setForm)}
              label={"Street Address*"}
                value={form?.address}
              inputRef={addressRef}
              maxLength={250}
              onSubmitEditing={() => {
                zipCodeRef?.current?.focus();
              }}
            />
              {formErrors?.address ? (
              <Text style={{ color: Colors.red, marginTop: 10 }}>
                {formErrors.address}
              </Text>
            ) : null}

            <Separator height={10} />
            <Text style={styles.label}>
              {"State*"}
            </Text>
            <SelectDropdown
              ref={stateDropDownRef}
              data={states}
                defaultValue={form?.state}
              onSelect={(selectedItem, index) => {
                setForm({ ...form, stateId: selectedItem?.id });
                setStateCode(selectedItem.code);
                citiesDropdownRef.current.reset();
                setCities([]);
                getAllCitiesRequest(selectedItem.id);
              }}
              buttonTextAfterSelection={(selectedItem, index) => {
                return selectedItem?.name;
              }}
              rowTextForSelection={(item, index) => {
                return item?.name;
              }}
              renderDropdownIcon={(isOpened) => {
                return (
                  <Image
                    style={styles.donwIcon}
                    source={isOpened ? AssetImages.up : AssetImages.down}
                  />
                );
              }}
              buttonStyle={styles.dropdown2BtnStyle}
              buttonTextStyle={styles.dropdown2BtnTxtStyle}
              dropdownIconPosition={"right"}
              dropdownStyle={styles.dropdown2DropdownStyle}
              rowStyle={styles.dropdown2RowStyle}
              rowTextStyle={styles.dropdown2RowTxtStyle}
              search
              searchInputStyle={styles.dropdownSearchInputStyle}
              searchPlaceHolder={"Search here"}
              searchInputTxtColor={"white"}
            />
            <Separator height={10} />
              <Text style={styles.label}>
              {"City*"}
            </Text>
            <SelectDropdown
              ref={citiesDropdownRef}
              data={cities}
                defaultValue={form?.city}
              onSelect={(selectedItem, index) => {
                setForm({ ...form, city: selectedItem });
              }}
                defaultButtonText={form?.city?.name}
              buttonTextAfterSelection={(selectedItem, index) => {
                return selectedItem?.name;
              }}
              rowTextForSelection={(item, index) => {
                return item?.name;
              }}
              buttonStyle={styles.dropdown2BtnStyle}
              buttonTextStyle={styles.dropdown2BtnTxtStyle}
              renderDropdownIcon={(isOpened) => {
                return (
                  <Image
                    style={styles.donwIcon}
                    source={isOpened ? AssetImages.up : AssetImages.down}
                  />
                );
              }}
              dropdownIconPosition={"right"}
              dropdownStyle={styles.dropdown2DropdownStyle}
              rowStyle={styles.dropdown2RowStyle}
              rowTextStyle={styles.dropdown2RowTxtStyle}
              search
              searchInputStyle={styles.dropdownSearchInputStyle}
              searchPlaceHolder={"Search here"}
              searchInputTxtColor={"white"}
            />

            <Separator height={10} />
            <View
              style={[styles.zipCode, route?.params?.buyUnit && styles.zipCodeBuy]} 
            >
              <View style={{ width: "100%" }}>
                <TextInput
                    errorMessage={formErrors?.zipCode}
                  onChangeText={(value) =>
                    updateObject(value, "zipCode", setForm)
                  }
                  autoCapitalize="none"
                  label="ZIP Code*"
                  keyboardType={"numeric"}
                  inputRef={zipCodeRef}
                  onSubmitEditing={() => {
                    if(route?.params?.buyUnit){
                    driverLicenseRef?.current?.focus();
                    }
                  }}
                />
                  {formErrors?.zipCode ? (
                  <Text style={Styles.errorText}>{formErrors.zipCode}</Text>
                ) : null}
              </View>

              <Separator height={10} />
            </View>
          </View>
          {!route?.params?.buyUnit && (
            <>
          <Separator height={10} />

          <Text style={[styles.MailingheaderText, { marginBottom: 5 }]}>{"Driver’s License"}</Text>
                <Text style={[styles.MailingheaderText, { marginTop: 0, fontSize: 13, color: Colors.grayFont }]}>{"This information is to be used for your lease"}</Text>
          <Separator height={10} />
          <View style={{ width: "100%" }}>
            <TextInput
              errorMessage={formErrors?.driverLicense}
              onChangeText={(value) => onChangeDrivingLicence(value)}
              value={form.driverLicense}
              autoCapitalize="none"
              label="Driver’s License Number*"
              inputRef={driverLicenseRef}
            />
            {formErrors?.driverLicense ? (
              <Text style={Styles.errorText}>{formErrors.driverLicense}</Text>
            ) : null}
          </View>
              </>
          )}
        </View>
        {!buyUnit ? (
          <View>
            <Separator height={10} />
            <Text style={styles.MailingheaderText}>
              {"Lease Terms Options"}
            </Text>
            <Separator height={10} />

              <Text style={styles.label}>
              {"Lease Terms*"}
            </Text>
            <SelectDropdown
              ref={leaseTermOptionRef}
              data={["1 month", "6 months", "12 months"]}
              defaultValue={leaseTermOption}
              onSelect={(selectedItem, index) => {
                setleaseTermOption(selectedItem);
                setFormErrors({ leaseTerm: "" });
              }}
              defaultButtonText={"Select"}
              buttonTextAfterSelection={(selectedItem, index) => {
                return selectedItem;
              }}
              rowTextForSelection={(item, index) => {
                return item;
              }}
              renderDropdownIcon={(isOpened) => {
                if (isOpened) {
                  setleasetermDropdownOpen(true);
                } else {
                  setleasetermDropdownOpen(false);
                }
                return (
                  <RNImage
                    style={styles.donwIcon}
                    source={isOpened ? AssetImages.up : AssetImages.down}
                  />
                );
              }}
              buttonStyle={
                leasetermDropdownOpen
                  ? styles.dropdown2BtnWithBorderStyle
                  : styles.dropdown2BtnStyle
              }
              buttonTextStyle={styles.dropdown2BtnTxtStyle}
              dropdownIconPosition={"right"}
              dropdownStyle={styles.dropdown2DropdownStyle}
              rowStyle={styles.dropdown2RowStyle}
              rowTextStyle={styles.dropdown2RowTxtStyle}
            />
            {formErrors?.leaseTerm ? (
              <Text style={Styles.errorText}>{formErrors.leaseTerm}</Text>
            ) : null}
          </View>
        ) : null}
          {!route?.params?.buyUnit && (
            <>
        <Separator height={20} />
        <View style={{ width: "100%", marginBottom: 50 }}>
          <PrimaryButtom
            onPress={handleNext}
            label={"Next"}
          />
        </View>
            </>
          )}
            {/* </ScrollView> */}
          </KeyboardAwareScrollView>
        {route?.params?.buyUnit && (
          <View style={styles.nextOuterContainer}>
          <View
            style={styles.nextInnerContainer}
            >
            <PrimaryButtom
              onPress={handleNext}
              label={"Next"}
              />
          </View>
          </View>
        )}
          </View>
          <CustomModal
            isVisible={isModal}
            icon={AssetImages.completed}
            primaryButtonText={"Continue"}
            secondaryButtonText={"Go to Dashboard"}
            secondaryButtonOnPress={() =>
              profileStage === "sales_mate" ? myUnitsScreen() : null
            }
            PrimaryButtonTextColor={Colors.grayFont}
            pimaryButtonColor={
              profileStage === "insurance" || profileStage === "sign_now"
                ? Colors.primaryButtonBackgroundColor
                : Colors.grayFont
            }
            title={"Thank You"}
            des={"Luxelocker Staff will contact you momentarily"}
            onPress={() =>
              profileStage === "insurance"
                ? insuranceScreen()
                : null
            }
          />
          <CustomModal
            isVisible={leaseConfirmationModal}
            icon={AssetImages.questionMarkIcon}
            title={"Are you sure you would like to lease this unit?"}
            secondaryButtonText={"Yes"}
            primaryButtonText={"No"}
            secondaryButtonOnPress={handleRegister}
            onPress={() => {
              setLoading(false);
              setLeaseConfirmationModal(false);
            }}
          />
        {loading && <LoadingOverlay />}
    </>
  );
};

const styles = StyleSheet.create({
  nextOuterContainer: { 
    position: "absolute", 
    bottom: 0, 
    width: "100%", 
    flexDirection: "row",
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "black" 
  },
  nextInnerContainer: { 
    marginVertical: 20, 
    width: "100%", 
    paddingHorizontal: 10 
  },
  label: { 
    color: Colors.white, 
    fontFamily: "Inter-Regular" 
  },
  container: {
    flex: 1,
    width: "100%",
    paddingBottom: 150,
    marginTop: 20,
    paddingHorizontal: 10,
  },
  zipCode: { 
    flexDirection: "row", 
    justifyContent: "space-between"
  },
  zipCodeBuy: { 
    marginBottom: 100,
  },
  headerText: {
    color: Colors.white,
    fontFamily: "Inter-Medium",
    fontSize: 15,
    alignSelf: "flex-start",
  },
  MailingheaderText: {
    color: Colors.white,
    fontFamily: "Inter-Medium",
    fontSize: 15,
    alignSelf: "flex-start",
    marginVertical: 15,
  },
  textInputContainerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dropdown2BtnStyle: {
    fontSize: 16,
    color: Colors.fontColor,
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    backgroundColor: Colors.inputBackgroundColor,
    width: "100%",
  },
  dropdown2BtnTxtStyle: {
    color: Colors.white,
    textAlign: "left",
    fontSize: 17,
  },
  dropdown2DropdownStyle: {
    borderRadius: 8,
    backgroundColor: Colors.inputBackgroundColor,
  },
  dropdown2RowStyle: {
    backgroundColor: Colors,
    borderBottomColor: Colors.grayFont,
    borderBottomWidth: 0,
  },
  dropdown2RowTxtStyle: {
    color: Colors.white,
    textAlign: "left",
    fontFamily: "Inter",
    fontSize: 15,
  },
  donwIcon: {
    tintColor: Colors.grayFont,
    height: 20,
    width: 20,
    marginRight: 10,
  },
  contryButtonContainer: {
    height: 40,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: Colors.inputBackgroundColor,
  },
  dropdownSearchInputStyle: {
    backgroundColor: Colors.inputBackgroundColor,
    borderBottomColor: Colors.grayFont,
    borderBottomWidth: 1,
    color: Colors.white,
  },
  contryFlag: { borderRadius: 11, height: 22, width: 22 },
  dropdown2BtnWithBorderStyle: {
    fontSize: 16,
    color: Colors.fontColor,
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    backgroundColor: Colors.inputBackgroundColor,
    width: "100%",
    borderColor: Colors.primaryButtonBackgroundColor,
    borderWidth: 1,
  },
});
