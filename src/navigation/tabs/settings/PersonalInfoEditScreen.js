import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  BackHandler,
} from "react-native";
import * as Animatable from "react-native-animatable";
import TextInput from "~components/TextInput";
import Separator from "~components/Separator";
import { CommonActions } from "@react-navigation/native";
import LoadingOverlay from "~components/LoadingOverlay";
import CustomModal from "~components/CustomModal";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import SelectDropdown from "react-native-select-dropdown";
import { useDispatch } from "react-redux";

//import for the Accordion view
import Accordion from "react-native-collapsible/Accordion";
import AssetImages from "~assets";
import { updateObject, onChangePhoneNo } from "~utils/Helpers";
import validator from "validator";
import CountryFlag from "react-native-country-flag";
import CountryPicker, { DARK_THEME } from "react-native-country-picker-modal";
import AuthenticationContainer from "~components/AuthenticationContainer";
import { authUser } from "~redux/reducers/authReducer";
import parsePhoneNumber from "libphonenumber-js";

import SimpleHeader from "~components/SimpleHeader";
import Colors from "~utils/Colors";
import Constant from "~utils/Constant.json";
import Styles from "~utils/Style/Styles";
import PrimaryButton from "~components/PrimaryButton";
import { useSelector } from "react-redux";
import InternetModal from "~components/InternetModal";
import {
  editProfileCall,
  fetchProfileCall,
  stateCall,
  cityCall,
} from "~utils/Network/api";
const { width } = Dimensions.get("window");

export default ({ navigation }) => {
  const scroll = useRef();
  const citiesDropdownRef = useRef();
  const stateDropDownRef = useRef();
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [network, setNetwork] = useState(false);
  const [serverError, setServerError] = useState(false);
  const user = useSelector((state) => state?.authUser?.authUser);
  const [activeSections, setActiveSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [countryFlag, setCountryFlag] = useState("US");
  const [countryCode, setCountryCode] = useState("+1");
  const [userData, setUserData] = useState(null);
  const [disableButton, setDisableButton] = useState(true);

  const [form, setForm] = useState({
    firstName: user?.first_name,
    lastName: user?.last_name,
    phone: user?.phone_no,
    address: user?.mailing_address?.street_address,
    email: user?.email,
    newEmail: "",
    password: "dsdsdfdsfg",
    city: user?.mailing_address?.city,
    state: user?.mailing_address?.state,
    zipCode: user?.mailing_address?.zipcode,
    cityId: null,
  });
  const dispatch = useDispatch();
  const [formErrors, setFormErrors] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    email: "",
    newEmail: "",
    password: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const [visibleCountryModal, setVisibleCountryModal] = useState(false);

  // To Get Country Flag
  const onSelectCountry = (value) => {
    if (value?.callingCode[0]) {
      setCountryFlag(value?.cca2);
      setCountryCode(`+${value?.callingCode[0]}`);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      if (user) {
        setLoading(true);
        await fetchProfileCall(user?.token?.access)
          .then((res) => {
            let user = res?.data?.data;
            setUserData(user)
            const phoneNumber = parsePhoneNumber(user?.phone_no);
            setCountryCode("+" + phoneNumber?.countryCallingCode);
            if (phoneNumber?.country && phoneNumber?.countryCallingCode) {
              setCountryFlag(phoneNumber?.country);
              setCountryCode("+" + phoneNumber?.countryCallingCode);
            }
            setForm({
              ...form,
              phone: phoneNumber?.nationalNumber
                ? phoneNumber?.nationalNumber
                : user?.phone_no,
              firstName: user?.name?.first_name,
              lastName: user?.name?.last_name,
              address: user?.mailing_address?.street_address,
            });
            loadCities(user);
          })
          .catch((error) => { });
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    handleDisableBtn();
  }, [form])

  const loadCities = async (user) => {
    await stateCall()
      .then((res) => {
        setLoading(false);
        if (res?.status == 200) {
          if (res.data?.data) {
            let index = res.data.data.findIndex(
              (obj) => obj.id === user?.mailing_address?.state?.id
            );
            if (user?.mailing_address && mailing_address?.state) {
              setStates(array_move(res.data.data, index, 0));
            }

            setStates(res.data.data);

            getAllCitiesRequest(res.data.data[0].id);
          }
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

  const getAllCitiesRequest = (id, from) => {
    cityCall(createCitiesPayLoad(typeof id === "object" ? id?.id : id))
      .then((res) => {
        setCities(res.data?.data);
        if (typeof id === "object" && from === "stateOnChange") {
          setForm({ ...form, state: id, city: res.data?.data[0] });
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };
  const createCitiesPayLoad = (id) => {
    let payload = {
      id: id,
    };
    return payload;
  };

  const array_move = (arr, old_index, new_index) => {
    if (new_index >= arr?.length) {
      var k = new_index - arr.length + 1;
      while (k--) {
        arr.push(undefined);
      }
    }
    arr.splice(new_index, 0, arr?.splice(old_index, 1)[0]);
    return arr; // for testing
  };

  const [multipleSelect, setMultipleSelect] = useState(false);

  const CONTENT = [
    {
      title: "Phone",
      content:
        'The following terms and conditions, together with any referenced documents (collectively, "Terms of Use") form a legal agreement between you and your employer, employees, agents, contractors and any other entity on whose behalf you accept these terms (collectively, “you” and “your”), and ServiceNow, Inc. (“ServiceNow,” “we,” “us” and “our”).',
    },
    {
      title: "Mailing Address",
      content:
        "A Privacy Policy agreement is the agreement where you specify if you collect personal data from your users, what kind of personal data you collect and what you do with that data.",
    },
 
  ];
  const VENDOR_CONTENT = [
    {
      title: "Phone",
      content:
        'The following terms and conditions, together with any referenced documents (collectively, "Terms of Use") form a legal agreement between you and your employer, employees, agents, contractors and any other entity on whose behalf you accept these terms (collectively, “you” and “your”), and ServiceNow, Inc. (“ServiceNow,” “we,” “us” and “our”).',
    },
  ];

  const setSections = (sections) => {
    //setting up a active section state
    setActiveSections(sections.includes(undefined) ? [] : sections);
  };

  const gotoBack = () => {
    navigation.dispatch(CommonActions.goBack());
    return true
  };

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", gotoBack);
    return () => {
      BackHandler.removeEventListener("hardwareBackPress", gotoBack);
    };
  }, []);

  const handleNext = useCallback(
    async (countryCode) => {
      setLoading(true);
      setFormErrors({
        firstName: "",
        lastName: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        password: "",
        email: "",
      });
      updateObject("", "", setFormErrors);
      let hasErrors = false;
      if (validator.isEmpty(form?.firstName)) {
        updateObject("First name cannot be empty.", "firstName", setFormErrors);
        hasErrors = true;
      }
      if (validator.isEmpty(form?.lastName)) {
        updateObject("Last name cannot be empty.", "lastName", setFormErrors);
        hasErrors = true;
      }
      if (!onChangePhoneNo(countryCode + form?.phone)) {
        updateObject("Invalid phone number", "phone", setFormErrors);
        hasErrors = true;
      }

      if (validator.isEmpty(form?.phone)) {
        updateObject("Phone cannot be empty.", "phone", setFormErrors);
        hasErrors = true;
      }

      if (validator.isEmpty(form?.address)) {
        updateObject("Address cannot be empty.", "address", setFormErrors);
        hasErrors = true;
      } else {
        const trimedAdress = form?.address.trim();
        if (validator.isEmpty(trimedAdress)) {
          updateObject("Address cannot be empty.", "address", setFormErrors);
          hasErrors = true;
        }
      }

      if (!/^\d+(?:-\d+)?$/.test(form?.zipCode)) {
        updateObject("Invalid Zip Code", "zipCode", setFormErrors);
        hasErrors = true;
      }

      if (validator.isEmpty(form?.zipCode)) {
        updateObject("Zip Code cannot be empty.", "zipCode", setFormErrors);
        hasErrors = true;
      }

      if (hasErrors) {
        setLoading(false);
        return;
      } else {
        await editProfileCall(createPayload(countryCode), user?.token?.access)
          .then((res) => {
            setLoading(false);
            if (res?.data?.success) {
              let data = {
                all_user_permissions: user?.all_user_permissions,
                email: user?.email,
                first_name: form?.firstName,
                last_name: form?.lastName,
                mailing_address: {
                  city: form?.city,
                  state: form?.state,
                  street_address: form?.address,
                  zipcode: form?.zipCode,
                },
                phone_no: countryCode + form?.phone,
                token: user?.token,
                is_active: user?.is_active,
                profile_stage: user?.profile_stage,
                stripe_customer_id: user?.stripe_customer_id,
                license_number: user?.license_number,
                first_login: user?.first_login,
                is_profile_completed: user?.is_profile_completed,
                salemate_obj: {
                  is_lease: user?.salemate_obj?.is_lease,
                  lead_id: user?.salemate_obj?.lead_id,
                  lead_id: user?.salemate_obj?.profile_stage,
                  status: user?.salemate_obj?.status,
                  unit_id: user?.salemate_obj?.unit_id,
                },
              };
              dispatch(authUser(data));
              setShowModal(true);
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
            setLoading(false);
            if (
              error?.response?.data?.message?.length > 0
            ) {
              console.log("error", error);
            }
          });
      }
    },
    [form, formErrors]
  );

  const reTry = () => {
    setNetwork(false);
  };

  const onChangeTxtPhoneNo = (value) => {
    setForm({ ...form, phone: value });
    if (!onChangePhoneNo(countryCode + value))
      updateObject("Invalid phone number", "phone", setFormErrors);
    else updateObject("", "phone", setFormErrors);
  };

  const createPayload = (countryCode) => {
    let payload = {
      phone_no: countryCode + form?.phone,
      first_name: form?.firstName,
      last_name: form?.lastName,
      city: form?.city.id,
      postal_code: form?.zipCode,
      street: form?.address,
    };
    return payload;
  };

  const handleDisableBtn = () => {
    if (
      userData?.mailing_address?.city?.name === form?.city?.name &&
      userData?.mailing_address?.street_address === form?.address &&
      userData?.mailing_address?.state?.name === form?.state?.name &&
      userData?.mailing_address?.zipcode === form?.zipCode &&
      userData?.phone_no === countryCode + form?.phone
    ) {
      setDisableButton(true);
    } else {
      if (user?.first_login === null) {
        setDisableButton(false);
      } else {
        setDisableButton(true);
      }
    }
  };

  const renderContent = (section, _, isActive) => {
    return (
      <Animatable.View
        duration={400}
        style={[styles.content, isActive ? styles.active : styles.inactive]}
        transition="backgroundColor"
      >
        {section.title == "Phone" ? (
          <View style={styles.contentContainer}>
            <View style={{ width: "32%" }}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setVisibleCountryModal(true)}
                style={[Styles.textInputStyle, styles.modalButton]}
              >
                <CountryFlag style={styles.contryFlag} isoCode={countryFlag} />
                <Text style={Styles.contryText}>{countryCode}</Text>
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

            <View style={{ width: "67%" }}>
              <TextInput
                errorMessage={formErrors?.phone}
                onChangeText={(value) => onChangeTxtPhoneNo(value)}
                keyboardType="phone-pad"
                autoCapitalize="none"
                value={form?.phone}
                editable={user?.first_login == null ? true : false}
              />

              {formErrors?.phone ? (
                <Text style={styles.error}>
                  {formErrors.phone}
                </Text>
              ) : null}
            </View>
          </View>
        ) : section?.title == "Mailing Address" && user?.first_login == null ? (
          <View style={{width: "100%"}}>
            <TextInput
              errorMessage={formErrors?.address}
              onChangeText={(value) =>
                updateObject(value, "address", setForm)
              }
              label={"Street Address"}
              value={form?.address}
            />
            {formErrors?.address ? (
              <Text style={styles.error}>
                {formErrors.address}
              </Text>
            ) : null}
            <Separator height={24} />
            <Text style={styles.label}>
              {"State"}
            </Text>
            <SelectDropdown
              ref={stateDropDownRef}
              data={states}
              defaultValue={form?.state}
              defaultButtonText={form?.state?.name}
              onSelect={(selectedItem, index) => {
                setForm({ ...form, state: selectedItem });
                citiesDropdownRef.current.reset();
                setCities([]);
                getAllCitiesRequest(selectedItem, "stateOnChange");
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
            <Separator height={24} />
            <Text style={styles.label}>
              {"City"}
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
            <Separator height={24} />

            <TextInput
              errorMessage={formErrors?.zipCode}
              onChangeText={(value) =>
                updateObject(value, "zipCode", setForm)
              }
              autoCapitalize="none"
              label="ZIP Code"
              value={form?.zipCode}
              keyboardType={"numeric"}
            />
            {formErrors?.zipCode ? (
              <Text style={styles.error}>
                {formErrors.zipCode}
              </Text>
            ) : null}
          </View>
        ) : null}
      </Animatable.View>
    );
  };

  const renderHeader = (section, _, isActive) => {
    //Accordion Header view
    return (
      <Animatable.View
        duration={400}
        style={[
          styles.collapsedContainer,
          !isActive
            ? {
              borderBottomWidth: 1,
              borderBottomColor: Colors.borderBottomColor,
            }
            : null,
        ]}
        transition="backgroundColor"
      >
        <Text style={Styles.nameHeader}>{section?.title}</Text>
        <Animatable.View style={styles.animateHeader}>
          <Text style={Styles.description}>
            {section?.title == "Phone" && !isActive
              ? user?.phone_no
              : section?.title == "Mailing Address" && !isActive
                ? user?.mailing_address?.street_address
                : null}
          </Text>
          <Image
            source={isActive ? AssetImages.up : AssetImages.down}
            style={styles.downImage}
          />
        </Animatable.View>
      </Animatable.View>
    );
  };
  const firstName = form?.firstName && form?.firstName?.charAt(0).toUpperCase() + form?.firstName?.slice(1);
  const lastName = form?.lastName && form?.lastName?.charAt(0).toUpperCase() + form?.lastName?.slice(1);

  return (
    <AuthenticationContainer>
      <SimpleHeader
        headerLabel={Constant.personalInfoEditScreen.title}
        backgroundColor={Colors.inputBackgroundColor}
        onPress={gotoBack}
        RightIcon={false}
        navigation={navigation}
        backIcon={true}
      />
      {loading ? <LoadingOverlay /> : (
        <>
      <KeyboardAwareScrollView
        ref={scroll}
        style={styles.awareScroll}
      >
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={Styles.nameHeader}>
              {Constant.personalInfoEditScreen.firstName}
            </Text>
            <Text style={Styles.description}>{firstName}</Text>
          </View>
          <View style={styles.content}>
            <Text style={Styles.nameHeader}>
              {Constant.personalInfoEditScreen.lastName}
            </Text>
            <Text style={Styles.description}>{lastName}</Text>
          </View>

          <Accordion
            activeSections={activeSections}
            sections={user?.first_login == null ? CONTENT : VENDOR_CONTENT}
            touchableComponent={TouchableOpacity}
            expandMultiple={multipleSelect}
            renderHeader={renderHeader}
            renderContent={renderContent}
            duration={400}
            onChange={setSections}
          />

          <View style={styles.content}>
            <Text style={Styles.nameHeader}>
              {Constant.personalInfoEditScreen.email}
            </Text>
            <Text style={Styles.description}>{form?.email}</Text>
          </View>
        </View>
      </KeyboardAwareScrollView>
      <View style={styles.saveBtn}>
        <PrimaryButton
          label={"Save"}
          onPress={() => handleNext(countryCode)}
          disabled={disableButton}
        />
      </View>
      <CustomModal
        isVisible={showModal}
        icon={AssetImages.completed}
        primaryButtonText={"Continue"}
        title={"Completed"}
        des={"Profile updated successfully."}
        onPress={gotoBack}
      />
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
        </>
      )}
    </AuthenticationContainer>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "90%",
  },
  saveBtn: { width: "90%", marginBottom: 10 },
  awareScroll: { width: "100%", marginLeft: 40 },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderBottomColor,
    paddingVertical: 10,
  },
  collapsedContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: 10,
  },
  error: { color: Colors.red, marginTop: 10 },
  label: { color: Colors.white, fontFamily: "Inter-Regular" },
  dropdown: {
    fontSize: 16,
    color: Colors.fontColor,
    borderRadius: 8,
    padding: 12,
    width: "100%",
    marginTop: 10,
    fontFamily: "Inter",
    backgroundColor: Colors.inputBackgroundColor,
  },
  donwIcon: {
    tintColor: Colors.grayFont,
    height: 18,
    width: 18,
  },
  header: {
    flexDirection: "row",
    width,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F6F6F6",
  },
  dropdown2BtnStyle: {
    fontSize: 16,
    color: Colors.fontColor,
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginTop: 10,
    backgroundColor: Colors.inputBackgroundColor,
    width: "100%",
    height: 45,
  },
  dropdown2BtnTxtStyle: {
    color: Colors.white,
    textAlign: "left",
    fontSize: 14,
    marginHorizontal: 0,
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
  contentContainer: { flexDirection: "row", justifyContent: "space-between" },
  modalButton: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: Colors.inputBackgroundColor,
  },
  downImage: {
    height: 14,
    width: 14,
    marginLeft: 10,
    tintColor: Colors.grayFont,
  },
  contryFlag: { borderRadius: 11, height: 22, width: 22 },
  dropdownSearchInputStyle: {
    backgroundColor: Colors.inputBackgroundColor,
    borderBottomColor: Colors.grayFont,
    borderBottomWidth: 1,
    color: Colors.white,
  },
  animateHeader: { flexDirection: "row", alignItems: "center" },
});
