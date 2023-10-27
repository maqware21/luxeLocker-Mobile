import React, { useState, useEffect } from "react";
import {
  Text,
  Alert,
  View,
  BackHandler,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";
import AssetImages from "~assets";
import AuthenticationContainer from "~components/AuthenticationContainer";
import PrimaryButton from "~components/PrimaryButton";
import SimpleHeader from "~components/SimpleHeader";
import Colors from "~utils/Colors";
import UnitDetailTabs from "~components/UnitDetailTabs";
import { CommonActions } from "@react-navigation/native";
import { useSelector } from "react-redux";

import {
  UnitDetaiCall,
  fetchVendorCall,
  fetchUserCall,
  fetchMonthlyPaymentHistoryCall,
  openCampusGateCall,
  openCloseUnitCall,
  roiDetailCall,
  fetchNotifications,
  availableUnitDetailCall,
} from "~utils/Network/api";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment";
import Vendors from "~components/Vendors";
import Styles from "~utils/Style/Styles";
import AdditionalUser from "~components/AdditionalUser";
import MonthlyPayment from "~components/MonthlyPayment";
import LoadingOverlay from "~components/LoadingOverlay";
import Separator from "~components/Separator";

export default ({ navigation, route }) => {
  const [selectedTab, setSelectedTab] = useState("Details");
  const user = useSelector((state) => state?.authUser?.authUser);
  const [unitDetail, setUnitDetails] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [isDoorOpen, setIsDoorOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [leasePaymentHistory, setLeasePaymentHistory] = useState([]);
  const { unit } = route?.params;
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const SetSelectedTabHandler = (value) => {
    setSelectedTab(value);
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


  const gotoManageUnits = () => {
    navigation.navigate("manageUnit", { unit: unit });
  };

  const fetchNotificationsCount = async () => {
    const payload = {
      operation_type: "count",
    };
    await fetchNotifications(user?.token?.access, payload)
      .then((res) => {
        setNotifCount(res?.data?.data?.[0]?.notification_count);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      if (user?.token?.access) {
        if (user?.first_login == null) {
          getAllUnitDetail();
          getAllVendorHandler();
          getAllAdditionalUserHandler();
          getPayhistoryHandler();
        } else {
          getUnitDetails();
        }
        fetchNotificationsCount();
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
      if (user?.token?.access) {
        fetchNotificationsCount();
      }
  }, [isDoorOpen]);

  const getUnitDetails = () => {
    setLoading(true)
    availableUnitDetailCall(unit?.id)
      .then((res) => {
        setUnitDetails(res?.data?.data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
      });
  };

  const getAllUnitDetail = () => {
    setLoading(true);
    UnitDetaiCall(
      user?.token?.access,
      user?.first_login == null ? unit?.unit_id : unit?.id
    )
      .then((res) => {
        if (res?.data?.data) setUnitDetails(res.data.data);
        setLoading(false);
      })
      .catch((errr) => {
        setLoading(false);
      });
  };

  const getPayhistoryHandler = () => {
    fetchMonthlyPaymentHistoryCall(
      user?.token?.access,
      user?.first_login == null ? unit?.unit_id : unit?.id
    )
      .then((res) => {
        if (res?.data?.data)
          setLeasePaymentHistory(res.data.data);
      })
      .catch((errr) => {
        console.log("PaymentError", errr);
      });
  };

  const getAllVendorHandler = () => {
    fetchVendorCall(
      user?.token?.access,
      user?.first_login == null ? unit?.unit_id : unit?.id
    )
      .then((res) => {
        if (res?.data?.data) setVendors(res.data.data);
      })
      .catch((errr) => {
        console.log("errr", errr);
      });
  };
  const getAllAdditionalUserHandler = () => {
    fetchUserCall(user?.token?.access, unit?.unit_id)
      .then((res) => {
        if (res?.data?.data) setUsers(res.data.data);
      })
      .catch((errr) => {
        console.log("errr", errr);
      });
  };

  const gotoVendorDetailScreen = (item) => {
    navigation.navigate("venderDetail", { unit: unit, vendorDetails: item });
  };
  const gotoAdditionalUserDetailScreen = (item) => {
    navigation.navigate("additionalUserDetail", { unit: unit, addUser: item });
  };

  const goToRoiDetailScreen = () => {
    roiDetailCall(roiPayload(), user?.token?.access, unit?.unit_id)
      .then((res) => {
        if (res?.data?.data) {
          navigation.navigate("ROIDetails", { roiDetail: res?.data.data });
        }
      })
      .catch((errr) => {
        if (
          errr?.response?.data?.message?.length > 0 &&
          errr?.response?.data?.message[0]?.LEASED_ISSUE
        )
          Alert.alert("Error", errr.response.data.message[0].LEASED_ISSUE);
        else {
          Alert.alert(
            "Error",
            errr?.response?.data?.message[0]?.DATES_SELECTION
          );
        }
      });
  };
  const roiPayload = () => {
    let payload = {
      start_date: startDate,
      end_date: endDate,
    };
    return payload;
  };

  const openCampusGate = (code) => {
    openCampusGateCall(
      { status_code: code },
      user?.token?.access,
      user?.first_login == null ? unit?.unit_id : unit?.id
    )
      .then((res) => {
        console.log("res", res?.data?.data);
      })
      .catch((errr) => {
        console.log("error", errr?.response?.data);
      });
  };

  const openCloseUnitGate = (code) => {
    openCloseUnitCall(
      { status_code: code },
      user?.token?.access,
      user?.first_login == null ? unit?.unit_id : unit?.id
    )
      .then((res) => {
        if (res?.data) {
          setIsDoorOpen(!isDoorOpen);
        }
      })
      .catch((errr) => {
        console.log("errr", errr.response.data);
      });
  };

  const showDatePicker = (start) => {
    setSelectedDate(start);
    setDatePickerVisibility(true);
  };
  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };
  const handleConfirm = (date) => {
    if (selectedDate === "startDate") {
      setStartDate(moment(date).format("yyyy-MM-DD"));
    } else {
      setEndDate(moment(date).format("yyyy-MM-DD"));
    }
    hideDatePicker();
  };

  const gotoNotificationsScreen = () => {
    navigation.navigate("notifications");
  };

  return (
    <>
      <AuthenticationContainer>
        <SimpleHeader
          headerLabel={`Unit ${unitDetail?.unit_number ? unitDetail?.unit_number : ""}`}
          backgroundColor={Colors.inputBackgroundColor}
          backIcon={true}
          rightIcon={AssetImages.bellIcon}
          RightIcon={true}
          navigation={navigation}
          rightIconOnPress={gotoNotificationsScreen}
          onPress={gotoBack}
          settings={AssetImages.setting}
          settingsPress={gotoManageUnits}
          isOwnedUnit={route?.params?.fromBuy}
          notificationCount={notifCount}
        />
        {loading ? <LoadingOverlay /> : (
          <View style={{ flex: 1 }}>
            <View>
              <Image
                source={AssetImages.singleUnit}
                style={styles.unitImage}
              />
            </View>

        <View
          style={styles.bottomImageDetail}
        >
          <Text style={{ color: "white" }}>{unitDetail?.unit_number ? ` Unit ${unitDetail?.unit_number}` : ""}</Text>
          <Text style={{ color: "white" }}>{unitDetail?.facility_name ? unitDetail?.facility_name : ""}</Text>
        </View>
        <View
          style={styles.gateAccessBTNContainer}
        >
          <View
            style={[styles.gateAccessBTN, { justifyContent: "center" }]}
          >
            <View style={{ marginLeft: 10 }}>
              <View
                style={styles.btnContainer}
              >
                <Image
                  source={AssetImages.roadblockIcon}
                  style={styles.btnImage}
                />
              </View>
              <Text
                style={styles.btnText}
              >
                Campus Gate
              </Text>
              <View style={styles.buttons}>
                <PrimaryButton
                  label={"Open"}
                  onPress={() => openCampusGate("campus-open")}
                />
              </View>
            </View>
          </View>
          <View
            style={[styles.gateAccessBTN, { marginLeft: 20 }]}
          >
            <View
              style={[styles.gateAccessBTN, { justifyContent: "center" }]}
            >
              <View style={{ marginLeft: 10 }}>
                <View
                  style={styles.btnContainer}
                    >
                      <Image
                        source={AssetImages.hangarIcon}
                        style={styles.btnImage}
                      />
                    </View>
                    <Text
                      style={styles.btnText}
                    >
                      Unit Access
                    </Text>
                    <View style={styles.buttons}>
                      <PrimaryButton
                        label={isDoorOpen ? "Close" : "Open"}
                        onPress={() =>
                          openCloseUnitGate(isDoorOpen ? "door-close" : "door-open")
                        }
                        backgroundColor={Colors?.grayFont}
                        color={Colors?.inputBackgroundColor}
                        custom={isDoorOpen}
                      />
                    </View>
                  </View>
                </View>
              </View>
            </View>
            {user.first_login == null ? (
              <>
                <UnitDetailTabs
                  SetSelectedTabHandler={SetSelectedTabHandler}
                  selectedTab={selectedTab}
                  fromBuy={route?.params?.fromBuy}
                  enableROI={unit?.unit_lease_availability}
                />
                {selectedTab == "Details" && unitDetail ? (
                  <ScrollView style={{ marginBottom: 10 }}>
                    <View style={styles.titleContainer}>
                      <Text style={styles.title}>
                        {"Campus Address".toUpperCase()}
                      </Text>
                      <Text
                        style={[styles.title, { marginTop: 5, color: Colors.white }]}
                      >
                        {`${unitDetail?.facility_street ? unitDetail.facility_street : ""
                          }, ${unitDetail?.facility_name
                          ? unitDetail?.facility_name
                            : ""
                          }, ${unitDetail?.facility_city
                          ? unitDetail?.facility_city
                            : ""
                          }`}
                      </Text>

                      <Separator height={20} />

                      {unitDetail?.unit_description ? (
                        <View>
                          <Text style={styles.title}>
                            {"Description".toUpperCase()}
                          </Text>
                          <Text
                            style={[styles.title, { marginTop: 5, color: Colors.white }]}
                          >
                            {`${unitDetail?.unit_description}`}
                          </Text>
                        </View>
                      ) : null}

                      <Text style={[styles.title, { marginTop: 20 }]}>
                        {"Dimensions".toUpperCase()}
                      </Text>

                      <Text
                        style={[styles.title, { marginTop: 5, color: Colors.white }]}
                      >
                        {unitDetail?.length ? `${unitDetail?.length} ft` : ""} {"  "} {unitDetail?.width ? `x   ${unitDetail?.width} ft` : ""}
                      </Text>
                      <Text style={[styles.title, { marginTop: 20 }]}>
                        {"Amenities".toUpperCase()}
                      </Text>
                      {unitDetail?.unit_amenities?.length > 0 &&
                        unitDetail?.unit_amenities?.map((item, index) => (
                          <Text
                            key={index + 1}
                            style={[ styles.title, { marginTop: 5, color: Colors.white } ]}
                          >
                            {`. ${item?.amenity__name}`}
                          </Text>
                        ))}
                    </View>
                  </ScrollView>
                ) : null}
              </>
            ) : null}

            {user?.first_login !== null ? (
              <ScrollView style={{ marginBottom: 10 }}>
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>
                    {"Campus Address".toUpperCase()}
                  </Text>
                  <Text
                    style={[styles.title, { marginTop: 5, color: Colors.white }]}
                  >
                    {`${unitDetail?.facility_street ? unitDetail?.facility_street : ""
                      }, ${unitDetail?.facility_name
                        ? unitDetail?.facility_name
                        : ""
                      }, ${unitDetail?.facility_city
                        ? unitDetail?.facility_city
                        : ""
                      }`}
                  </Text>

                  <Separator height={20} />

                  {unitDetail?.unit_description ? (
                    <View>
                      <Text style={[styles.title, { color: Colors.grayFont }]}>
                        {"Description".toUpperCase()}
                      </Text>
                      <Text style={[styles.title, { color: Colors.white }]}>
                        {`${unitDetail?.unit_description}`}
                      </Text>
                    </View>
                  ) : null}

              <Text style={[styles.title, { marginTop: 20 }]}>
                {"Dimensions".toUpperCase()}
              </Text>
              <Text
                style={[styles.title, { marginTop: 5, color: Colors.white }]}
              >
                {unitDetail?.length ? `${unitDetail?.length} ft` : ""} {"  "} {unitDetail?.width ? `x   ${unitDetail?.width} ft` : ""}
              </Text>
               <Text style={[styles.title, { marginTop: 20 }]}>
                {"Amenities".toUpperCase()}
              </Text>
              {unitDetail?.unit_amenities.length > 0 &&
                unitDetail?.unit_amenities.map((item, index) => (
                  <Text
                    style={[
                      styles.title,
                      { marginTop: 5, color: Colors.white },
                    ]}
                  >
                    {`. ${item?.amenity__name}`}
                  </Text>
                ))}
            </View>
          </ScrollView>
        ) : null}
        {selectedTab == "Users" ? (
          <ScrollView 
            showsVerticalScrollIndicator={false}
          style={styles.vendorBtn}
          >
            {selectedTab == "Users" &&
              users &&
              users?.length > 0 &&
              users?.map((item, index) => (
                <View key={`${index}`} style={{ marginRight: 10, marginLeft: 10 }}>
                  <AdditionalUser
                    navigation={navigation}
                    addUser={item}
                    gotoAdditionalUserDetailScreen={()=> gotoAdditionalUserDetailScreen(item)}
                  />
                </View>
              ))}
            {users?.length == 0 ? (
              <View
                style={styles.noUser}
              >
                <Text style={{ color: "grey", fontFamily: "Inter" }}>
                  {"No additional user has been added yet"}
                </Text>
              </View>
            ) : null}
          </ScrollView>
        ) : null}
        {selectedTab == "Users" ? (
          <View style={{ marginBottom: 14 }}>
            <PrimaryButton
              label={"+ New Additional User"}
              onPress={() =>
                navigation.navigate("additionalUser", { unit: unit })
              }
            />
          </View>
        ) : null}
        {selectedTab == "Vendors" ? (
          <ScrollView 
            showsVerticalScrollIndicator={false}
          style={styles.vendorBtn}
          >
            {selectedTab == "Vendors" &&
              vendors?.length > 0 &&
              vendors?.map((item, index) => (
                <View key={`${index}`} style={{ flex: 1, marginHorizontal: 10}}>
                  <Vendors
                    navigation={navigation}
                    vendor={item}
                    gotoVendorDetailScreen={()=> gotoVendorDetailScreen(item)}
                  />
                </View>
              ))}

            {vendors?.length == 0 ? (
              <View
                style={styles.noUser}
              >
                <Text style={{ color: "grey", fontFamily: "Inter" }}>
                  {"No vendor has been added yet"}
                </Text>
              </View>
            ) : null}
          </ScrollView>
        ) : null}

        {selectedTab == "Vendors" ? (
          <View style={{ marginBottom: 14 }}>
            <PrimaryButton
              label={"+ New Vendor"}
              onPress={() => navigation.navigate("addVendor", { unit: unit })}
            />
          </View>
        ) : null}
        <ScrollView>
          {selectedTab == "Payments" &&
            leasePaymentHistory &&
            leasePaymentHistory?.length > 0 &&
            leasePaymentHistory?.map((item, index) => (
              <View key={`${index}`} style={{ marginRight: 10, marginLeft: 10 }}>
                <MonthlyPayment
                  navigation={navigation}
                  item={item}
                  gotoVendorDetailScreen={gotoVendorDetailScreen}
                />
              </View>
            ))}
        </ScrollView>

            {selectedTab == "ROI" ? (
              <>
               <View
                  style={styles.dateContainer}
                >
                  <View
                    style={styles.dateInnerContainer}
                  >
                    <Text style={Styles.headingStyle}>Start Date</Text>
                    <TouchableOpacity
                      onPress={() => showDatePicker("startDate")}
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Text style={Styles.description}>
                        {startDate ? startDate : "Select Date"}
                      </Text>
                      <Image source={AssetImages.down} style={styles.downImage} />
                    </TouchableOpacity>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      marginTop: 10,
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={Styles.headingStyle}>End Date</Text>
                    <TouchableOpacity
                      onPress={() => showDatePicker("endDate")}
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Text style={Styles.description}>
                        {endDate ? endDate : "Select Date"}
                      </Text>
                      <Image source={AssetImages.down} style={styles.downImage} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={{ marginBottom: 40, marginHorizontal: 10 }}>
                  <PrimaryButton
                    label={"View Statistics"}
                    onPress={goToRoiDetailScreen}
                    disabled={startDate !== null && endDate !== null ? false : true}
                  />
                </View>
              </>
            ) : null}
          </View>
        )}
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
          minimumDate={selectedDate == "startDate" ? null : new Date()}
          maximumDate={new Date()}
        />
      </AuthenticationContainer>
      </>
      );
};
const styles = StyleSheet.create({
  title: {
    fontFamily: "Inter",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 20,
    color: Colors.grayFont,
    fontFamily: "Inter",
    lineHeight: 20,
  },
  downImage: {
    height: 14,
    width: 14,
    marginTop: 10,
    marginLeft: 10,
    tintColor: Colors.grayFont,
  },
  vendorBtn: { 
    height: "100%", 
  },
  unitImage: {
    height: 160,
    borderRadius: 10,
    width: "95%",
    marginLeft: 10,
    marginTop: 10,
    marginRight: 10,
  },
  bottomImageDetail: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 10,
  },
  bottomImageDetailColor: { color: "white" },
  gateAccessBTNContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 10,
  },
  gateAccessBTN: {
    borderRadius: 8,
    height: 144,
    width: 165,
    backgroundColor: Colors.inputBackgroundColor,
  },
  btnContainer: {
    height: 44,
    width: 44,
    borderRadius: 44 / 2,
    backgroundColor: Colors.backgroundColor,
    alignItems: "center",
    justifyContent: "center",
  },
  btnImage: {
    height: 24,
    borderRadius: 10,
    width: 24,
    tintColor: Colors.primaryButtonBackgroundColor,
  },
  btnText: {
    color: Colors.grayFont,
    marginTop: 10,
    fontFamily: "Inter",
  },
  buttons: { marginRight: 10, marginTop: 10 },
  titleContainer: { marginLeft: 10, marginRight: 10, marginTop: 10 },
  noUser: {
    marginRight: 10,
    marginLeft: 10,
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    marginTop: 50,
  },
  dateContainer: {
    flexDirection: "column",
    width: "100%",
    position: "absolute",
    bottom: "30%",
    marginHorizontal: 10,
  },
  dateInnerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderBottomColor,
  },
});
