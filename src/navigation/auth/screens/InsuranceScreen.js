import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Text,
  Alert,
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Linking,
  Image as RNImage,
  BackHandler,
} from "react-native";
import SimpleHeader from "~components/SimpleHeader";
import Colors from "~utils/Colors";
import Constant from "~utils/Constant.json";
import Styles from "~utils/Style/Styles";
import CheckBox from "@react-native-community/checkbox";
import RBSheet from "react-native-raw-bottom-sheet";
import {
  uploadInsuranceDousCall,
  addInsurancePolicyForRegisterUser,
  getDrivingLicenseCall,
} from "~utils/Network/api";
import Separator from "~components/Separator";
import LoadingOverlay from "~components/LoadingOverlay";
import ImagePicker from "react-native-image-crop-picker";
import { useSelector } from "react-redux";
import { Image } from "react-native-compressor";
import AssetImages from "~assets";
import { ScrollView } from "react-native-gesture-handler";
import SelectDropdown from "react-native-select-dropdown";
import TextInput from "~components/TextInput";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import validator from "validator";
const { isValid } = require("usdl-regex");

export default ({ navigation, route }) => {
  const isLoggedIn = async () => {
    const value = await AsyncStorage.getItem("isLoggedIn");
    setLoggedIn(JSON.parse(value));
  };
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());

  const isBuyUnit = async () => {
    const value = await AsyncStorage.getItem("isBuy");
    setIsBuy(JSON.parse(value));
  };

  const [isBuy, setIsBuy] = useState(isBuyUnit());

  const licenseCheck = () => {
    if (route?.params?.buyUnit) {
      return licenseNum != "" && licenseError === "";
    }
  };

  const bottomSheetRef = useRef();

  const insuranceDropdownRef = useRef();
  const [insuranceDropdownOpen, setInsuranceDropdownOpen] = useState(false);
  const [insuranceOption, setInsuranceOption] = useState("");
  const [insuranceNum, setInsuranceNum] = useState("");
  const [licenseNum, setLicenseNum] = useState("");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [expDate, setExpDate] = useState("");
  const [licenseError, setLicenseError] = useState("");

  const user = useSelector((state) => state?.authUser?.authUser);
  const [unitDetail, setUnitDetail] = useState(null);
  const [photo, setphote] = useState({
    frontSidePhoto: null,
    backSidePhoto: null,
  });
  const [selectedPhotoType, setSelectedPhotoType] = useState(null);
  const [result, setResult] = useState(null);
  const [buyUnit, setBuyUnit] = useState(false);
  const [SelectInsurance, setInsurance] = useState(false);
  const [toggleCheckBox, setToggleCheckBox] = useState(false);
  const [hasDoc, setHasDoc] = useState(false);
  const [loading, setLoading] = useState(false);

  const gotoBack = () => {
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", gotoBack);
    return () => {
      BackHandler.removeEventListener("hardwareBackPress", gotoBack);
    };
  }, []);

  const openGrallery = () => {
    ImagePicker.openPicker({
      mediaType: "photo",
    })
      .then(async (img) => {
        let imagePAth =
          Platform.OS === "ios" ? img?.path?.replace("file://", "") : img?.path;

        await Image.compress(imagePAth, {
          compressionMethod: "auto",
        }).then((res) => {
          if (selectedPhotoType === "front")
            setphote({
              ...photo,
              frontSidePhoto: res,
            });
          if (selectedPhotoType === "back")
            setphote({
              ...photo,
              backSidePhoto: res,
            });
          if (selectedPhotoType === "policy") setResult(res);
          bottomSheetRef?.current.close();
        });
      })
      .catch((err) => {
        if (err?.message === "User cancelled image selection") {
        } else {
          Alert.alert("Permission", "User did not grant library permission.", [
            {
              text: "Cancel",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel",
            },
            {
              text: "Settings",
              onPress: () => Linking.openURL("app-settings:"),
            },
          ]);
        }
      });
  };

  const openCamera = async (type) => {
    ImagePicker.openCamera({
      mediaType: "photo",
      compressImageQuality: 0.7,
    })
      .then(async (img) => {
        let imagePAth =
          Platform.OS === "ios" ? img?.path?.replace("file://", "") : img?.path;

        await Image.compress(imagePAth, {
          compressionMethod: "auto",
        }).then((res) => {
          if (selectedPhotoType === "front")
            setphote({
              ...photo,
              frontSidePhoto: res,
            });
          if (selectedPhotoType === "back")
            setphote({
              ...photo,
              backSidePhoto: res,
            });
          if (selectedPhotoType === "policy") setResult(res);
          bottomSheetRef?.current.close();
        });
      })
      .catch((err) => {
        if (err?.message === "User cancelled image selection") {
        } else {
          Alert.alert("Permission", "User did not grant library permission.", [
            {
              text: "Cancel",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel",
            },
            {
              text: "Settings",
              onPress: () => Linking.openURL("app-settings:"),
            },
          ]);
        }
      });
  };
  useEffect(() => {
    setLoading(false);
    if (route?.params?.unit && route?.params?.buyUnit) {
      setUnitDetail(route.params.unit);
      setBuyUnit(route.params.buyUnit);
    }
    getDrivingLicenseHandler();
  }, [route?.params]);

  const getDrivingLicenseHandler = () => {
    getDrivingLicenseCall(user?.token?.access)
      .then((res) => {
        if (res?.data?.data?.front?.url && res?.data?.data?.back?.url) {
          setHasDoc(true);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const handleUploadInsurancePolicy = useCallback(() => {
    const formdata = new FormData();
    if (!SelectInsurance) {
      formdata.append("insurance_policy", {
        type: "image/jpeg",
        uri: Platform.OS === "ios" ? result : result,
        name: result.split("/").pop(),
      });
      formdata.append("existing_policy_number", insuranceNum);
      formdata.append("policy_expiry", expDate);
    } else {
      formdata.append("insurance_policy_option", insuranceOption);
    }

    formdata.append("unit", route?.params?.unitId);
    formdata.append("is_luxelocker_insurance", SelectInsurance);
    if (user?.token?.access) {
      setLoading(true);
      addInsurancePolicyForRegisterUser(formdata, user.token.access)
        .then((res) => {
          if (res) setLoading(false);
          if (res?.data?.success) {
            navigation.navigate("cardInfo", { unitId: route?.params?.unitId });
          }
        })
        .catch((error) => {
          setLoading(false);
          if (error?.response?.data?.message?.length > 0) {
            if (error.response.data.message[0]?.unit) {
              Alert.alert("Error", error.response.data.message[0].unit, [
                { text: "OK", onPress: () => myUnitsScreen() },
              ]);
            }
            if (error?.response?.data?.message[0]?.permission) {
              Alert.alert(
                "Error",
                error.response.data?.message?.[0]?.permission,
                [{ text: "OK", onPress: () => myUnitsScreen() }]
              );
            }
          }
        });
    }
  });

  const handleRegister = useCallback(() => {
    const formdata = new FormData();
    formdata.append("license_front", {
      type: "image/jpeg",
      uri: Platform.OS === "ios" ? photo.frontSidePhoto : photo.frontSidePhoto,
      name: photo.frontSidePhoto.split("/").pop(),
    });
    formdata.append("license_back", {
      type: "image/jpeg",
      uri: Platform.OS === "ios" ? photo.backSidePhoto : photo.backSidePhoto,
      name: photo.backSidePhoto.split("/").pop(),
    });

    if (!SelectInsurance) {
      formdata.append("insurance_policy", {
        type: "image/jpeg",
        uri: Platform.OS === "ios" ? result : result,
        name: result.split("/").pop(),
      });
      formdata.append("existing_policy_number", insuranceNum);
      formdata.append("policy_expiry", expDate);
    } else {
      formdata.append("insurance_policy_option", insuranceOption);
    }
    formdata.append("is_luxelocker_insurance", SelectInsurance);
    if (!isBuy) {
      formdata.append("license_number", user?.license_number);
    } else {
      formdata.append("license_number", licenseNum);
    }
    formdata.append("unit", route?.params?.unitId);
    if (user?.token?.access) {
      setLoading(true);
      uploadInsuranceDousCall(formdata, user.token.access)
        .then((res) => {
          setLoading(false);
          if (res?.data?.data) {
            if (res.data.data?.salemate_obj?.profile_stage === "stripe")
              navigation.navigate("cardInfo", {
                email: route?.params?.email,
                password: route?.params?.password,
                hasDoc: hasDoc,
                unitId: route?.params?.unitId,
              });
            else if (
              res?.data?.data?.salemate_obj?.profile_stage === "sign_now"
            )
              navigation.navigate("signature", {
                signing_url: res.data.data?.signing_url,
              });
          }
        })
        .catch((error) => {
          setLoading(false);

          if (error?.response?.data) {
            {
              !error.response.data?.message?.[0]?.error?.includes(
                "have some issue"
              )
                ? null
                : Alert.alert(
                    "Error",
                    error.response.data?.message?.[0]?.error,
                    [{ text: "OK", onPress: () => myUnitsScreen() }]
                  );
            }
            {
              error?.response?.data?.message?.[0]?.permission &&
                Alert.alert(
                  "Error",
                  error?.response?.data?.message?.[0]?.permission
                );
            }
          }
        });
    }
  });

  const myUnitsScreen = () => {
    navigation.navigate("tabs", { screen: "MyUnits" });
  };

  const openBottomSheetHandler = (type) => {
    setSelectedPhotoType(type);
    bottomSheetRef?.current.open();
  };

  const handleToggle = () => {
    setToggleCheckBox(!toggleCheckBox);
  };

  const showDatePicker = (start) => {
    setDatePickerVisibility(true);
  };
  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };
  const handleConfirm = (date) => {
    setExpDate(moment(date).format("yyyy-MM-DD"));
    hideDatePicker();
  };

  const insuranceOptionNum = `${insuranceOption?.split(" ")[0]}`.replace(
    "$",
    ""
  );

  return (
    <>
      <View style={styles.insuranceContainer}>
        <SimpleHeader
          headerLabel={Constant.subtotalScreen.title}
          backgroundColor={Colors.inputBackgroundColor}
        />
        <View style={{ flex: 1, position: "relative" }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ flex: 1, marginBottom: 80 }}
          >
            <View style={styles.container}>
              <Text style={Styles.headingStyle}>
                {Constant.subtotalScreen.insurancePolicyHeading}
              </Text>
              <Text style={styles.descriptionText}>
                {Constant.subtotalScreen.insurancePolicyDecription}
              </Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={SelectInsurance ? styles.primaryButton : styles.button}
                  onPress={() => {
                    setInsurance(true);
                  }}
                >
                  <Text
                    style={[
                      styles.primaryText,
                      { color: !SelectInsurance ? "#85878D" : "#0F0F14" },
                    ]}
                  >
                    {Constant.subtotalScreen.switchPrimary}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={
                    !SelectInsurance ? styles.primaryButton : styles.button
                  }
                  onPress={() => {
                    setInsurance(false);
                  }}
                >
                  <Text
                    style={[
                      styles.primaryText,
                      { color: SelectInsurance ? "#85878D" : "#0F0F14" },
                    ]}
                  >
                    {Constant.subtotalScreen.switchScondry}
                  </Text>
                </TouchableOpacity>
              </View>

              {!SelectInsurance ? (
                <>
                  <Separator height={20} />
                  <TextInput
                    onChangeText={(value) => {
                      const regex = /[^a-zA-Z0-9]/;
                      if (!regex.test(value)) setInsuranceNum(value);
                    }}
                    label={"Existing Policy Number"}
                    value={insuranceNum}
                    labelStyle={styles.inputLabelStyle}
                  />
                  <Separator height={20} />
                  <TextInput
                    label={"EXP Date"}
                    editable={false}
                    rightIcon={AssetImages.calendarIcon}
                    rightIconPress={showDatePicker}
                    name={"expDate"}
                    value={expDate}
                    labelStyle={styles.inputLabelStyle}
                  />
                  <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="date"
                    onConfirm={handleConfirm}
                    onCancel={hideDatePicker}
                    minimumDate={new Date()}
                  />

                  <View style={{ marginTop: 20 }}>
                    <Text style={styles.addDescriptionText}>
                      {Constant.subtotalScreen.addIncurancePolicy}
                    </Text>
                    <TouchableOpacity
                      onPress={() => openBottomSheetHandler("policy")}
                      style={styles.uploadButton}
                    >
                      <View style={styles.downloadFileContainer}>
                        <View style={styles.uploadBTN}>
                          <RNImage
                            source={AssetImages.policyFile}
                            style={styles.image}
                          />
                          <Text style={styles.uploadText}>
                            {Constant.subtotalScreen.uploading}
                          </Text>
                        </View>
                        <RNImage
                          style={styles.bottomSheetForwardIcon}
                          source={AssetImages.forward}
                        />
                      </View>
                    </TouchableOpacity>
                    {result ? (
                      <View style={styles.uploadButton}>
                        <View style={styles.downloadFileContainer}>
                          <View style={styles.fileContainer}>
                            <RNImage
                              source={AssetImages.fileColor}
                              style={styles.file}
                              resizeMode={"contain"}
                            />
                            <Text
                              style={{ color: "white", marginLeft: 10 }}
                              numberOfLines={1}
                            >
                              {result.split("/").pop()}
                            </Text>
                          </View>
                          <TouchableOpacity onPress={() => setResult(null)}>
                            <RNImage
                              style={styles.bottomSheetForwardIcon}
                              source={AssetImages.trash}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : null}
                  </View>
                </>
              ) : (
                <>
                  <Separator height={20} />
                  <Text
                    style={{
                      color: "white",
                      fontSize: 11,
                      fontFamily: "Inter",
                    }}
                  >
                    {"Insurance Policy Options"}
                  </Text>
                  <SelectDropdown
                    ref={insuranceDropdownRef}
                    data={[
                      "$9 per Month - $2000 Coverage",
                      "$14 per Month - $3000 Coverage",
                      "$24 per Month - $5000 Coverage",
                    ]}
                    defaultValue={insuranceOption}
                    onSelect={(selectedItem, index) => {
                      setInsuranceOption(selectedItem);
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
                        setInsuranceDropdownOpen(true);
                      } else {
                        setInsuranceDropdownOpen(false);
                      }
                      return (
                        <RNImage
                          style={styles.donwIcon}
                          source={isOpened ? AssetImages.up : AssetImages.down}
                        />
                      );
                    }}
                    buttonStyle={
                      insuranceDropdownOpen
                        ? styles.dropdown2BtnWithBorderStyle
                        : styles.dropdown2BtnStyle
                    }
                    buttonTextStyle={styles.dropdown2BtnTxtStyle}
                    dropdownIconPosition={"right"}
                    dropdownStyle={styles.dropdown2DropdownStyle}
                    rowStyle={styles.dropdown2RowStyle}
                    rowTextStyle={styles.dropdown2RowTxtStyle}
                  />

                  {/* purshase insurance View */}
                  <View style={styles.agreementContainer}>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
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
                        style={styles.checkBox}
                        boxType="square"
                        onValueChange={handleToggle}
                      />
                      <TouchableOpacity
                        style={{ flexDirection: "row", alignItems: "center" }}
                        onPress={handleToggle}
                      >
                        <Text style={styles.checkBoxHeading}>
                          {Constant.subtotalScreen.checkHeading}
                        </Text>
                        <Text style={{ color: "#CDA950", fontSize: 13 }}>
                          {Constant.subtotalScreen.termAndCondition}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View />
                  </View>
                </>
              )}

              {/* Insurance View */}
              {SelectInsurance ? (
                <View style={[styles.dividerContainer, { marginTop: 40 }]}>
                  <Text style={styles.ammountHeading}>
                    {Constant.subtotalScreen.insuranceCost}
                  </Text>
                  <Text style={styles.ammount}>
                    {insuranceOption ? `${insuranceOption?.split(" ")[0]}` : ""}
                  </Text>
                </View>
              ) : null}

              {/* lease rate heading */}
              {!route?.params?.buyUnit ? (
                <View
                  style={[
                    styles.dividerContainer,
                    { marginTop: !SelectInsurance ? 40 : 0 },
                  ]}
                >
                  <Text style={styles.ammountHeading}>
                    {Constant.subtotalScreen.leaseRate}
                  </Text>
                  <Text style={styles.ammount}>
                    ${route?.params?.unit?.lease_price}
                  </Text>
                </View>
              ) : null}

              {/* Maintenance Fee heading */}
              {route?.params?.buyUnit ? (
                <View
                  style={[
                    styles.dividerContainer,
                    { marginTop: !SelectInsurance ? 40 : 0 },
                  ]}
                >
                  <Text style={{ color: "white" }}>
                    {Constant.subtotalScreen.monthlyCost}
                  </Text>
                  <Text style={styles.ammount}>
                    $
                    {route?.params?.unit?.maintenance_fee
                      ? route?.params?.unit?.maintenance_fee
                      : route?.params?.unit?.unit_maintenance_fee
                      ? route?.params?.unit?.unit_maintenance_fee
                      : ""}
                  </Text>
                </View>
              ) : null}

              {/* Purchase Amount heading */}
              {route?.params?.buyUnit ? (
                <View style={styles.dividerContainer}>
                  <Text style={{ color: "white" }}>Purchase Amount</Text>
                  <Text style={styles.ammount}>
                    $
                    {route?.params?.unit?.buy_price
                      ? route?.params?.unit?.buy_price
                      : route?.params?.unit?.price
                      ? route?.params?.unit?.price
                      : ""}
                  </Text>
                </View>
              ) : null}
              {route?.params?.unit?.unit_maintenance_fee ? (
                <View
                  style={[
                    styles.dividerContainer,
                    { marginTop: !SelectInsurance ? 10 : 0 },
                  ]}
                >
                  <Text style={styles.ammountHeading}>
                    {"Total Monthly Cost"}
                  </Text>

                  <Text style={styles.ammount}>
                    $
                    {route?.params?.buyUnit
                      ? SelectInsurance
                        ? Number(route?.params?.unit?.unit_maintenance_fee) +
                          Number(insuranceOptionNum)
                        : Number(route?.params?.unit?.unit_maintenance_fee)
                      : SelectInsurance
                      ? Number(route?.params?.unit?.lease_price) +
                        Number(insuranceOptionNum)
                      : Number(route?.params?.unit?.lease_price)}
                  </Text>
                </View>
              ) : (
                <View
                  style={[
                    styles.dividerContainer,
                    { marginTop: !SelectInsurance ? 10 : 0 },
                  ]}
                >
                  <Text style={styles.ammountHeading}>
                    {"Total Monthly Cost"}
                  </Text>
                  <Text style={styles.ammount}>
                    $
                    {route?.params?.buyUnit
                      ? SelectInsurance
                        ? Number(route?.params?.unit?.unit_maintenance_fee) +
                          Number(insuranceOptionNum)
                        : Number(route?.params?.unit?.unit_maintenance_fee)
                      : SelectInsurance
                      ? Number(route?.params?.unit?.lease_price) +
                        Number(insuranceOptionNum)
                      : Number(route?.params?.unit?.lease_price)}
                  </Text>
                </View>
              )}

              {!route?.params?.buyUnit ? (
                <View style={[styles.dividerContainer, { marginTop: 10 }]}>
                  <Text style={styles.ammountHeading}>
                    {"Flat Fee Deposit"}
                  </Text>

                  <Text style={styles.ammount}>{"$250"}</Text>
                </View>
              ) : null}
              <View style={{ padding: 5, marginTop: 20 }}>
                {!loggedIn || !hasDoc ? (
                  <>
                    <Text style={styles.ammountHeading}>
                      {"Driver’s License"}
                    </Text>
                    {route.params.buyUnit ? (
                      <>
                        <Separator height={10} />
                        <View style={{ width: "100%" }}>
                          <Text style={styles.licenseNumber}>
                            {"Driver’s License Number*"}
                          </Text>
                          <TextInput
                            onChangeText={(value) => {
                              if (validator.isEmpty(value)) {
                                setLicenseError(
                                  "License Number Field is empty"
                                );
                              } else if (
                                !isValid(
                                  user?.mailing_address?.state.code,
                                  value
                                )
                              ) {
                                setLicenseError("Invalid License Number");
                              } else {
                                setLicenseError("");
                              }
                              setLicenseNum(value);
                            }}
                            label={""}
                            value={licenseNum}
                            errorMessage={licenseError === "" ? false : true}
                            labelStyle={styles.inputLabelStyle}
                          />
                        </View>
                        {licenseError ? (
                          <Text style={{ color: Colors.red }}>
                            {licenseError}
                          </Text>
                        ) : null}
                      </>
                    ) : (
                      ""
                    )}
                    <Separator height={10} />
                    <Text style={styles.licenseNumber}>
                      {"Upload Your Document*"}
                    </Text>
                    <TouchableOpacity
                      onPress={() => openBottomSheetHandler("front")}
                      style={[styles.uploadButton, { padding: 20 }]}
                    >
                      <View style={styles.downloadFileContainer}>
                        <View style={styles.photoContainer}>
                          <RNImage
                            source={AssetImages.frontSide}
                            style={styles.driverCard}
                            resizeMode={"contain"}
                          />
                          <Text style={styles.photoSides} numberOfLines={1}>
                            {photo.frontSidePhoto
                              ? photo.frontSidePhoto.split("/").pop()
                              : "Front Side"}
                          </Text>
                        </View>
                        <RNImage
                          style={styles.bottomSheetForwardIcon}
                          source={AssetImages.forward}
                        />
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => openBottomSheetHandler("back")}
                      style={[
                        styles.uploadButton,
                        { padding: 20, marginTop: 1 },
                      ]}
                    >
                      <View style={styles.downloadFileContainer}>
                        <View style={styles.photoContainer}>
                          <RNImage
                            source={AssetImages.backSide}
                            style={styles.driverCard}
                            resizeMode={"contain"}
                          />
                          <Text style={styles.photoSides} numberOfLines={1}>
                            {photo.backSidePhoto
                              ? photo.backSidePhoto.split("/").pop()
                              : "Back Side"}
                          </Text>
                        </View>
                        <RNImage
                          style={styles.bottomSheetForwardIcon}
                          source={AssetImages.forward}
                        />
                      </View>
                    </TouchableOpacity>
                  </>
                ) : null}
              </View>
            </View>
          </ScrollView>
          <View style={styles.confirmOuterContainer}>
            <View style={styles.confirmInnerContainer}>
              <TouchableOpacity
                onPress={() => {
                  loggedIn && hasDoc
                    ? SelectInsurance && insuranceOption && toggleCheckBox
                      ? handleUploadInsurancePolicy()
                      : !SelectInsurance && insuranceNum && expDate && result
                      ? handleUploadInsurancePolicy()
                      : console.log("Please select Insurance options")
                    : photo.frontSidePhoto &&
                      photo.backSidePhoto &&
                      !SelectInsurance &&
                      insuranceNum &&
                      expDate &&
                      result
                    ? handleRegister()
                    : photo.frontSidePhoto &&
                      photo.backSidePhoto &&
                      SelectInsurance &&
                      insuranceOption &&
                      toggleCheckBox
                    ? handleRegister()
                    : console.log("Please select license first");
                }}
                style={[
                  Styles.PrimaryButton,
                  loggedIn && hasDoc
                    ? SelectInsurance && insuranceOption && toggleCheckBox
                      ? null
                      : !SelectInsurance && insuranceNum && expDate && result
                      ? null
                      : { backgroundColor: Colors.inputBackgroundColor }
                    : photo.frontSidePhoto &&
                      photo.backSidePhoto &&
                      !SelectInsurance &&
                      insuranceNum &&
                      licenseCheck &&
                      expDate &&
                      result
                    ? null
                    : photo.frontSidePhoto &&
                      photo.backSidePhoto &&
                      SelectInsurance &&
                      insuranceOption &&
                      licenseCheck &&
                      toggleCheckBox
                    ? null
                    : { backgroundColor: Colors.inputBackgroundColor },
                ]}
              >
                <Text
                  style={[
                    Styles.primaryButtonText,
                    loggedIn && hasDoc
                      ? SelectInsurance && insuranceOption && toggleCheckBox
                        ? null
                        : !SelectInsurance && insuranceNum && expDate && result
                        ? null
                        : { color: Colors.grayFont }
                      : photo.frontSidePhoto &&
                        photo.backSidePhoto &&
                        !SelectInsurance &&
                        insuranceNum &&
                        licenseCheck &&
                        expDate &&
                        result
                      ? null
                      : photo.frontSidePhoto &&
                        photo.backSidePhoto &&
                        SelectInsurance &&
                        insuranceOption &&
                        licenseCheck &&
                        toggleCheckBox
                      ? null
                      : { color: Colors.grayFont },
                  ]}
                >
                  {Constant.subtotalScreen.Confirm}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <RBSheet
          ref={bottomSheetRef}
          openDuration={250}
          customStyles={{
            container: {
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              height: 220,
            },
          }}
        >
          <View style={styles.contentContainer}>
            <Text style={styles.bottomSheetTitle}>{"Upload Documents"}</Text>
            <Separator height={10} />
            <View style={styles.boder} />
            <TouchableOpacity onPress={openCamera} style={styles.openCamera}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <RNImage
                  style={styles.bottomSheetIcon}
                  source={AssetImages._newCamera}
                />
                <Text style={[styles.bottomSheetTitle, { marginLeft: 10 }]}>
                  {"Use Camera"}
                </Text>
              </View>
              <RNImage
                style={styles.bottomSheetForwardIcon}
                source={AssetImages.forward}
              />
            </TouchableOpacity>
            <View style={[styles.boder, { width: "90%" }]} />
            <TouchableOpacity onPress={openGrallery} style={styles.openGallery}>
              <View style={styles.galleryContainer}>
                <RNImage
                  style={styles.bottomSheetIcon}
                  source={AssetImages.gallery}
                />
                <Text style={[styles.bottomSheetTitle, { marginLeft: 10 }]}>
                  {"Select Documents from Gallery"}
                </Text>
              </View>
              <RNImage
                style={styles.bottomSheetForwardIcon}
                source={AssetImages.forward}
              />
            </TouchableOpacity>
          </View>
        </RBSheet>
        {loading && <LoadingOverlay />}
      </View>
    </>
  );
};
const styles = StyleSheet.create({
  insuranceContainer: { flex: 1, backgroundColor: Colors.backgroundColor },
  descriptionText: {
    color: Colors.grayFont,
    fontfamily: "Inter",
    fontSize: 13,
    lineHeight: 20,
  },
  addDescriptionText: {
    color: Colors.white,
    fontfamily: "Inter",
    fontSize: 13,
    lineHeight: 20,
  },
  inputLabelStyle: {
    fontSize: 13,
  },
  button: {
    backgroundColor: Colors.inputBackgroundColor,
    padding: 12,
    width: "50%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  primaryText: {
    fontSize: 13,
    letterSpacing: 0,
    lineHeight: 20,
    fontFamily: "Inter",
    fontWeight: "500",
  },
  primaryButton: {
    backgroundColor: Colors.primaryButtonBackgroundColor,
    padding: 12,
    width: "50%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  boder: {
    borderBottomWidth: 0.4,
    borderBottomColor: Colors.grayFont,
    width: "100%",
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
  },
  bottomSheetForwardIcon: { tintColor: Colors.grayFont, height: 20, width: 20 },

  checkBox: {
    height: 15,
    width: 15,
    alignItems: "center",
    borderRadius: 15,
  },
  downloadFileContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 5,
    flex: 1,
    backgroundColor: Colors.inputBackgroundColor,
  },
  container: {
    padding: 20,
    width: "100%",
  },
  uploadButton: {
    padding: 10,
    backgroundColor: Colors.inputBackgroundColor,
    marginTop: 2,
    borderRadius: 10,
    flex: 1,
  },
  uploadBTN: {
    flexDirection: "row",
    alignItems: "center",
    flex: 0.9,
  },
  uploadText: { color: "white", marginLeft: 5 },
  driverCard: {
    height: 32,
    width: 52,
  },
  fileContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 0.9,
  },
  licenseNumber: {
    color: "white",
    fontSize: 11,
    fontFamily: "Inter",
    lineHeight: 24,
  },
  photoSides: { color: "white", marginLeft: 10, width: "80%" },
  image: { width: 27, height: 33 },
  file: { width: 20, height: 20 },
  agreementContainer: {
    flexDirection: "row",
    marginTop: 15,
    justifyContent: "space-between",
    alignItems: "center",
  },
  ammount: { color: "#3ED187" },
  dividerContainer: {
    borderBottomWidth: 0.5,
    borderTopWidth: 0.5,
    width: "100%",
    borderTopColor: "#1B1B23",
    borderBottomColor: "#1B1B23",
    padding: 11,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  ammountHeading: { color: "white" },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#1B1B23",
    paddingTop: 20,
  },
  bottomSheetTitle: {
    color: Colors.white,
    fontFamily: "Inter-Medium",
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 0,
  },
  checkBoxHeading: { color: "white", marginLeft: 8, fontSize: 13 },
  checkBox: {
    height: 20,
    width: 20,
    alignItems: "center",
    border: "none",
    outline: "none",
  },
  bottomSheetIcon: {
    tintColor: Colors.primaryButtonBackgroundColor,
    height: 24,
    width: 24,
  },
  donwIcon: {
    tintColor: Colors.grayFont,
    height: 18,
    width: 18,
    marginRight: 10,
  },
  dropdown2BtnStyle: {
    fontSize: 16,
    color: Colors.fontColor,
    borderRadius: 8,
    padding: 4,
    height: 42,
    marginTop: 10,
    backgroundColor: Colors.inputBackgroundColor,
    width: "100%",
  },
  dropdown2BtnWithBorderStyle: {
    fontSize: 16,
    color: Colors.fontColor,
    borderRadius: 8,
    padding: 4,
    height: 42,
    marginTop: 10,
    backgroundColor: Colors.inputBackgroundColor,
    width: "100%",
    borderColor: Colors.primaryButtonBackgroundColor,
    borderWidth: 1,
  },
  dropdown2BtnTxtStyle: {
    color: Colors.grayFont,
    textAlign: "left",
    fontSize: 14,
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
    fontSize: 14,
  },
  confirmOuterContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: Colors.backgroundColor,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmInnerContainer: {
    marginVertical: 20,
    width: "100%",
    paddingHorizontal: 10,
  },
  openCamera: {
    padding: 20,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  openGallery: {
    padding: 20,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  galleryContainer: {
    flexDirection: "row",
    alignItems: "center",
    fontFamily: "700",
  },
  photoContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
});
