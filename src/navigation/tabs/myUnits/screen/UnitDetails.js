import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  Alert,
  View,
  Image,
  BackHandler,
  StyleSheet,
  Image as RNImage,
  TouchableOpacity,
} from "react-native";
import SelectDropdown from "react-native-select-dropdown";
import Styles from "~utils/Style/Styles";
import Colors from "~utils/Colors";
import CustomModal from "~components/CustomModal";
import AssetImages from "~assets";
import PrimaryButton from "~components/PrimaryButton";

import {
  availableUnitDetailCall,
  addUnitForRegisteredUserCall,
} from "~utils/Network/api";
import LoadingOverlay from "~components/LoadingOverlay";
import NetInfo from "@react-native-community/netinfo";
import InternetModal from "~components/InternetModal";
import Orientation from "react-native-orientation-locker";
import { CommonActions } from "@react-navigation/native";
import { useSelector } from "react-redux";
import Separator from "~components/Separator";
import { ScrollView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default ({ navigation, route }) => {
  const leaseTermOptionRef = useRef();
  const [from, setFrom] = useState(null);
  const [network, setNetwork] = useState(false);
  const user = useSelector((state) => state?.authUser?.authUser);
  const [signNowLink, setSignNowLink] = useState(null);
  const [leaseTermOption, setleaseTermOption] = useState("");
  const [formErrors, setFormErrors] = useState({
    leaseTerm: "",
  });
  const [leasetermDropdownOpen, setleasetermDropdownOpen] = useState(false);
  const [unitDetails, setUnitDetails] = useState({});
  const [isModal, setModal] = useState(false);
  const [leaseConfirmationModal, setLeaseConfirmationModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const gotoBack = () => {
    if (route?.params?.extendMap) Orientation.lockToLandscape();
    else Orientation.lockToPortrait();
    navigation.dispatch(CommonActions.goBack());
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", gotoBack);
    return () => {
      BackHandler.removeEventListener("hardwareBackPress", gotoBack);
    };
  }, []);

  const goToCreateAccountScreen = () => {
    setLeaseConfirmationModal(false);
    navigation.navigate("createAccount", {
      unit: unitDetails,
      buyUnit: route?.params?.buyUnit,
    });
  };
  useEffect(() => {
    setLoading(false);
    if (route?.params?.from) {
      setFrom(route.params.from);
    }
    Orientation.lockToPortrait();
  }, [route?.params?.unit?.id]);

  const reTry = () => {
    setNetwork(false);
    if (user?.token?.access) addUnitForRegisteredUserHandler();
    else getUnitDetail();
  };
  const getUnitDetail = () => {
    setLoading(true);
    NetInfo.fetch().then((state) => {
      if (state.isConnected) {
        setNetwork(false);
        setLoading(true);
        availableUnitDetailCall(route?.params?.unit?.id)
          .then((res) => {
            setLoading(false);
            if (res?.data?.data) {
              res.data.data.maintenance_fee =
                route.params.unit.maintenance_fee;
              setUnitDetails(res.data.data);
            }
          })
          .catch((error) => {
            setLoading(false);
          });
      } else {
        setNetwork(true);
      }
    });
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      NetInfo.fetch().then((state) => {
        if (state.isConnected) {
          setNetwork(false);
          getUnitDetail();
          Orientation.lockToPortrait();
        } else {
          setNetwork(true);
        }
      });
    });
    return unsubscribe;
  }, [navigation]);

  const myUnitsScreen = () => {
    setModal(false);
    navigation.navigate("tabs", { screen: "MyUnits" });
  };

  const signNowScreen = (link) => {
    setModal(false);
    navigation.navigate("signature", {
      signing_url: link ? link : signNowLink,
      unitId: route?.params?.unit?.id,
      unit: unitDetails,
    });
  };

  ///add unit for already registed user....///
  const addUnitForRegisteredUserHandler = () => {
    if (user?.token?.access) {
      setFormErrors({ leaseTerm: "" });
      NetInfo.fetch().then((state) => {
        if (state.isConnected) {
          setNetwork(false);
          setLeaseConfirmationModal(false);
          setLoading(true);
          addUnitForRegisteredUserCall(
            addUnitPayload(),
            user.token.access,
            route?.params?.unit?.id
          )
            .then((res) => {
              setLoading(false);
              if (res?.data?.data?.length > 0
              ) {
                if (route?.params?.buyUnit) return setModal(true);
                setSignNowLink(res?.data?.data);
                if (res.data.data) return signNowScreen(res.data.data);
              } else if (Object.keys(res?.data?.data).length === 0) {
                if (route?.params?.buyUnit) return setModal(true);
              }
            })
            .catch((errr) => {
              setLoading(false);
              if (errr?.length > 0 && errr[0].AxiosError) {
                Alert.alert("Error", errr[0].AxiosError);
              }
              if (errr?.response?.data?.message?.[0]?.error) {
                Alert.alert("Error", errr?.response?.data?.message?.[0]?.error);
              }
            });
        }
      });
    }
  };
  const addUnitPayload = () => {
    let payload = {
      is_lessee: route?.params?.buyUnit == false ? true : false,
      lease_term: leaseTermOption,
    };
    return payload;
  };

  const handlePrimaryBTNPress = () => {
    AsyncStorage.setItem("isBuy", JSON.stringify(route?.params?.buyUnit));
    if (route?.params?.buyUnit){
      if (user?.token?.access){
        addUnitForRegisteredUserHandler()
      } else {
        goToCreateAccountScreen()
      }
    } else {
      setLeaseConfirmationModal(true);
    }
  }

  const handleSecondaryBTNOnPress = () => {
    if(user?.token?.access){
      addUnitForRegisteredUserHandler();
    } else {
      goToCreateAccountScreen();
    }
  }

    const facilityAmenity = unitDetails?.facility_amenities?.map((item, index) => {
      return (
        <Text
        key={`${index}`}
        style={[
          styles.title,
          { paddingTop: 4 },
        ]}
        >
          {item?.amenity__name}
      </Text>
    )
})

  return (
    <>
        <View style={{ flex: 1 }}>
          <Image
            source={
              unitDetails?.unit_image_url &&
              unitDetails?.unit_image_url?.length > 0
                ? {
                  uri: unitDetails?.unit_image_url[0]?.replace("download", "view"),
                }
                : AssetImages.unit
            }
            style={styles.unitDetail}
            resizeMode="cover"
          />

          <View style={styles.authContainer}>
            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
            >
            <View style={[styles.scrollView, { padding: 20 }]}>
                {/* unit title view */}
                <>
                <View
                  style={styles.titleContainer}
                >
                  <Text
                    style={[styles.title, { fontSize: 15 }]}
                  >{unitDetails?.unit_number && `Unit ${unitDetails?.unit_number}`}</Text>
                  {unitDetails?.facility_street ? (
                    <Text style={[styles.title, { color: Colors.grayFont }]}>
                      {unitDetails?.facility_name && `${unitDetails?.facility_name}`}{unitDetails?.state_code && `, ${unitDetails?.state_code}`}
                    </Text>
                  ) : null}
                </View>

                {/* Faculty Address */}
                <View style={styles.detailContainer}>
                  {unitDetails?.facility_name || unitDetails?.facility_postalcode ? (
                    <Text style={[styles.title, { color: Colors.grayFont }]}>
                      {"Campus Address".toUpperCase()}
                    </Text>
                  ) : null}
                  {unitDetails?.facility_name || unitDetails?.facility_postalcode ? (
                    <Text
                      style={[styles.title, { paddingTop: 4 }]}
                    >
                      {`${unitDetails?.facility_street ? unitDetails?.facility_street : ""
                        }, ${unitDetails?.facility_name
                        ? unitDetails?.facility_name
                          : ""
                        }, ${unitDetails?.facility_city
                        ? unitDetails?.facility_city
                          : ""
                        }`}
                    </Text>
                  ) : null}

                  <Separator height={20} />
                  {unitDetails?.unit_description ? (
                      <View>
                        <Text style={[styles.title, { color: Colors.grayFont }]}>
                          {"Description".toUpperCase()}
                        </Text>
                        <Text
                          style={[styles.title, { paddingTop: 4 }]}
                        >
                          {`${unitDetails?.unit_description}`}
                        </Text>
                      </View>
                    ) : null}

                    <Separator height={20} />
                    <View>
                      <Text style={[styles.title, { color: Colors.grayFont }]}>
                       {"Dimensions".toUpperCase()}
                      </Text>
                      <Text
                        style={[styles.title, { paddingTop: 4 }]}
                      >
                      {`${unitDetails?.length} ft. x ${unitDetails?.width} ft.`}
                      </Text>
                    </View>

                  {unitDetails?.facility_amenities ? (
                      <View style={styles.detailContainer}>
                        <Text style={[styles.title, { color: Colors.grayFont }]}>
                          {"Amenities".toUpperCase()}
                        </Text>
                        {facilityAmenity}
                      </View>
                    ) : null}
                  {!route?.params?.buyUnit &&
                      user?.first_login == null &&
                      user &&
                    user?.token?.access ? (
                      <View>
                        <Separator height={10} />
                        <Text style={styles.MailingheaderText}>
                          {"Lease Terms Options"}
                        </Text>
                        <Separator height={10} />

                        <Text
                          style={{
                            color: Colors.white,
                            fontFamily: "Inter-Regular",
                          }}
                        >
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
                                source={
                                  isOpened ? AssetImages.up : AssetImages.down
                                }
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
                          <Text style={Styles.errorText}>
                            {formErrors.leaseTerm}
                          </Text>
                        ) : null}
                      </View>
                    ) : null}

                  <View style={{ marginTop: 20 }}>
                    <Text
                      style={[
                        styles.title,
                        {
                          color: Colors.grayFont,
                          fontFamily: "Inter-Medium",
                        },
                      ]}
                    >
                      {route.params.buyUnit
                        ? "Purchase Amount".toUpperCase()
                        : "Lease Rate".toUpperCase()}
                    </Text>
                    <Text
                      style={[
                        styles.title,
                        {
                          paddingTop: 4,
                          fontSize: 15,
                          justifyContent: "space-around",
                        },
                      ]}
                    >
                      {route?.params?.buyUnit && unitDetails
                        ? `$ ${unitDetails?.buy_price}`
                        : `$ ${unitDetails?.lease_price}`}
                    </Text>
                  </View>
                </View>
              </>
              </View>
            </ScrollView>
            <View style={styles.bottomContainer}>
              {user?.first_login == null ? (
                <View style={{ marginLeft: 10, width: "90%" }}>
                  <PrimaryButton
                    label={route.params.buyUnit ? "Purchase Unit" : "Lease Unit"}
                  onPress={handlePrimaryBTNPress}
                    disabled={
                      !route?.params?.buyUnit && leaseTermOption === "" && user
                        ? true
                        : false
                    }
                  />
                </View>
              ) : null}
            </View>
        </View>
          <TouchableOpacity
            onPress={gotoBack}
            style={styles.goBack}
          >
            <Image source={AssetImages.back} style={{ height: 20, width: 20 }} />
          </TouchableOpacity>
          <CustomModal
            isVisible={leaseConfirmationModal}
            icon={AssetImages.questionMarkIcon}
            title={"Are you sure you would like to lease this unit?"}
            secondaryButtonText={"Yes"}
            primaryButtonText={"No"}
            secondaryButtonOnPress={handleSecondaryBTNOnPress}
            onPress={() => setLeaseConfirmationModal(false)}
          />
          <CustomModal
            isVisible={isModal}
            icon={AssetImages.staff}
            primaryButtonText={"Continue"}
            PrimaryButtonTextColor={Colors.grayFont}
            pimaryButtonColor={Colors.primaryButtonBackgroundColor}
            title={"Thank you, Luxelocker Staff will contact you momentarily"}
            onPress={() => (signNowLink ? signNowScreen() : myUnitsScreen())}
          />
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
        </View>
      {loading && <LoadingOverlay />}
    </>
  );
};

const styles = StyleSheet.create({
  title: {
    fontFamily: "Inter",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 20,
    color: Colors.white
  },
  MailingheaderText: {
    color: Colors.white,
    fontFamily: "Inter-Medium",
    fontSize: 15,
    alignSelf: "flex-start",
    marginVertical: 15,
  },
  bottomContainer: {
    width: "100%",
    bottom: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
  detailContainer: { flex: 1, paddingTop: 20, width: "100%" },
  authContainer: {
    width: "100%",
    flex: 1,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    position: "absolute",
    top: "35%",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.backgroundColor,
  },
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
  unitDetail: { width: "100%", height: "40%" },
  scrollView: { flex: 1, width: "100%" },
  titleContainer: { flexDirection: "row", justifyContent: "space-between" },
  goBack: {
    fontSize: 10,
    bottom: 300,
    left: 15,
    height: 40,
    width: 40,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 40 / 2,
  },
});
