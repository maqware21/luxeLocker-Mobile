import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Text,
  BackHandler,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import * as Animatable from "react-native-animatable";
//import for the collapsible/Expandable view
import { CommonActions } from "@react-navigation/native";
import LoadingOverlay from "~components/LoadingOverlay";
import CustomModal from "~components/CustomModal";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment";
//import for the Accordion view
import Accordion from "react-native-collapsible/Accordion";
import AssetImages from "~assets";
import AuthenticationContainer from "~components/AuthenticationContainer";
import ReadMore from "@fawazahmed/react-native-read-more";

import SimpleHeader from "~components/SimpleHeader";
import Colors from "~utils/Colors";
import Styles from "~utils/Style/Styles";
import PrimaryButton from "~components/PrimaryButton";
import { useSelector } from "react-redux";
import {
  openCampusGateCall,
  updateVendorDetailCall,
  fetchVendorDetailCall,
  openCloseUnitCall,
} from "~utils/Network/api";
import SecondaryButton from "~components/SecondaryButton";
const { width } = Dimensions.get("window");

export default ({ navigation, route }) => {
  const scroll = useRef();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const user = useSelector((state) => state?.authUser?.authUser);
  const [isDoorOpen, setIsDoorOpen] = useState(false);

  const [activeSections, setActiveSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isStartPickerVisible, setStartPickerVisibility] = useState(false);
  const [isEndPickerVisible, setEndPickerVisibility] = useState(false);
  const [changeDate, setChangeDate] = useState(false);
  const [vendorDetail, setVendorDetail] = useState(null);
  const { unit, vendorDetails } = route?.params;

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
    setChangeDate(true);
    setStartDate(moment(date).format("yyyy-MM-DD"));
    setStart(moment(date).format("yyyy-MM-DD"));
    setStartPickerVisibility(false);
  };

  const handleEndDateConfirm = (date) => {
    setChangeDate(true);
    setEndDate(moment(date).format("yyyy-MM-DD"));
    setEnd(moment(date).format("yyyy-MM-DD"));
    setEndPickerVisibility(false);
  };

  useEffect(() => {
    if (route?.params?.vendorDetails) {
      loadVendorDetail(
        route?.params?.vendorDetails?.vendor_unit_id,
        route?.params?.vendorDetails?.id
      );
    } else {
      loadVendorDetail(unit?.unit_id, vendorDetails?.id);
    }
  }, []);

  const loadVendorDetail = (unitId, vendorId) => {
    setLoading(true);
    fetchVendorDetailCall(user?.token?.access, unitId, vendorId)
      .then((res) => {
        setLoading(false);
        if (res?.data?.data) {
          setVendorDetail(res.data.data);
          setStartDate(res.data.data?.start_date);
          setEndDate(res.data.data?.end_date);
        }
      })
      .catch((error) => {
        console.log("err", error);
      });
  };

  const [multipleSelect, setMultipleSelect] = useState(false);

  const CONTENT = [
    {
      title: "Start Date",
      content:
        'The following terms and conditions, together with any referenced documents (collectively, "Terms of Use") form a legal agreement between you and your employer, employees, agents, contractors and any other entity on whose behalf you accept these terms (collectively, “you” and “your”), and ServiceNow, Inc. (“ServiceNow,” “we,” “us” and “our”).',
    },
    {
      title: "End Date",
      content:
        "A Privacy Policy agreement is the agreement where you specify if you collect personal data from your users, what kind of personal data you collect and what you do with that data.",
    },
  ];

  const setSections = (sections) => {
    //setting up a active section state
    setActiveSections(sections.includes(undefined) ? [] : sections);
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

  const handleNext = useCallback(
    async (userAccess) => {
      setLoading(true);
      await updateVendorDetailCall(
        user?.token?.access,
        unit?.unit_id,
        vendorDetails?.id,
        updatePayload(userAccess)
      )
        .then((res) => {
          setLoading(false);
          if (res?.data?.success) {
            setShowModal(true);
            setChangeDate(false);
          }
        })
        .catch((error) => {
          setLoading(false);
        });
    },
    [startDate, endDate]
  );

  const updatePayload = (userAccess) => {
    let payload = {
      start_date: startDate,
      end_date: endDate,
      end_all: userAccess,
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
        console.log("res", res.data.data);
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
        console.log("errr", errr?.response?.data);
      });
  };

  const renderContent = (section, _, isActive) => {
    return (
      <React.Fragment></React.Fragment>
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
        <TouchableOpacity
          onPress={() =>
            section?.title == "Start Date"
              ? showStartDatePicker("startDate")
              : section?.title == "End Date"
                ? showEndDatePicker("endDate")
                : null
          }
          disabled={unit ? false : true}
          style={styles.touchableHeader}
        >
          <Text style={Styles.description}>
            {section?.title == "Start Date"
              ? startDate
              : section?.title == "End Date"
                ? endDate
                : null}
          </Text>
          <Image source={AssetImages.down} style={styles.downImage} />
        </TouchableOpacity>
      </Animatable.View>
    );
  };

  const gotoAccessHistory = () => {
    navigation.navigate("vendorAccessHistory", {
      vendorID: vendorDetails?.user_id
        ? vendorDetails?.user_id
        : route?.params?.vendorDetails?.user_id,
      vendorDetail: vendorDetail,
    });
  };

  return (
    <>
      
        <AuthenticationContainer>
          {vendorDetail?.full_name ? (
            <SimpleHeader
            headerLabel={vendorDetail?.full_name}
              backgroundColor={Colors.inputBackgroundColor}
              onPress={gotoBack}
              RightIcon={false}
              navigation={navigation}
              backIcon={true}
            />
          ) : null}

        {loading ? <LoadingOverlay /> : (
          <>
          <KeyboardAwareScrollView
            ref={scroll}
            style={{ width: "100%", padding: 15 }}
          >
            {vendorDetail ? (
              <View style={styles.container}>
                <Accordion
                  activeSections={activeSections}
                  sections={CONTENT}
                  touchableComponent={TouchableOpacity}
                  expandMultiple={multipleSelect}
                  renderHeader={renderHeader}
                  renderContent={renderContent}
                  duration={400}
                  onChange={setSections}
                />
                <View style={styles.purposeContent}>
                  <Text style={Styles.purposeNameHeader}>{"Purpose"}</Text>
                  <View style={{ width: "78%"}}>
                   <ReadMore
                      numberOfLines={2}
                      style={[Styles.purposeDescription]}
                      seeMoreStyle={{ color: Colors.primaryButtonBackgroundColor }}
                      seeLessStyle={{ color: Colors.primaryButtonBackgroundColor }}
                    >
                      {vendorDetail?.purpose}
                    </ReadMore>
                  </View>
                </View>
                <View style={styles.content}>
                  <Text style={Styles.nameHeader}>{"Unit Number"}</Text>
                  <Text style={Styles.description}>
                    {vendorDetail?.vendor_unit}
                  </Text>
                </View>
                <View style={styles.content}>
                  <Text style={Styles.nameHeader}>{"Campus Name"}</Text>
                  <Text style={Styles.description}>
                    {vendorDetail?.vendor_facility_name}
                  </Text>
                </View>
                <View style={styles.content}>
                  <Text style={Styles.nameHeader}>{"Accessing the Unit"}</Text>
                  <View style={{ width: "30%" }}>
                    <PrimaryButton
                      label={isDoorOpen ? "Close" : "Open"}
                      onPress={() =>
                        openCloseUnitGate(isDoorOpen ? "door-close" : "door-open")
                      }
                      backgroundColor={Colors?.grayFont}
                      color={Colors?.inputBackgroundColor}
                      custom={isDoorOpen}
                      disabled={unit ? false : true}
                    />
                  </View>
                </View>
                <View style={styles.content}>
                  <Text style={Styles.nameHeader}>
                    {"Accessing the Campus Gate"}
                  </Text>
                  <View style={{ width: "30%" }}>
                    <PrimaryButton
                      label={"Close"}
                      onPress={() => openCampusGate("campus-open")}
                      disabled={unit ? false : true}
                    />
                  </View>
                </View>
              </View>
            ) : null}
            <View
              style={{
                width: "100%",
                marginTop: 20,
              }}
            >
              <PrimaryButton
                label={"End All Access"}
                onPress={() => handleNext(true)}
                disabled={unit ? false : true}
              />
            </View>
          </KeyboardAwareScrollView>
          {unit ? (
            <View
              style={styles.btnContainer}
            >
              <View style={{ width: "40%" }}>
                { }
                <PrimaryButton
                  label={"Access History"}
                  onPress={gotoAccessHistory}
                />
              </View>
              <View style={{ width: "40%" }}>
                {!changeDate ? (
                  <SecondaryButton label={"Re-Send"} />
                ) : (
                  <PrimaryButton
                    label={"Re-Send"}
                    onPress={() => handleNext(false)}
                  />
                )}
              </View>
            </View>
          ) : null}
          <CustomModal
            isVisible={showModal}
            icon={AssetImages.completed}
            primaryButtonText={"Continue"}
            title={"Completed"}
            des={"Vendor updated successfully."}
            onPress={gotoBack}
          />
          {startDate && endDate ? (
              <>
                <DateTimePickerModal
                  isVisible={isStartPickerVisible}
                  mode="date"
                  onConfirm={handleStartDateConfirm}
                  onCancel={handleStartDateCancel}
                  maximumDate={end ? new Date(end) : undefined}
                  minimumDate={new Date()}
                />

                <DateTimePickerModal
                  isVisible={isEndPickerVisible}
                  mode="date"
                  onConfirm={handleEndDateConfirm}
                  onCancel={handleEndDateCancel}
                  minimumDate={start ? new Date(start) : undefined}
                />
              </>
          ) : null}
          </>
          )}
        </AuthenticationContainer>
      
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderBottomColor,
    paddingVertical: 10,
  },
  purposeContent: {
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
    alignItems: "center",
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderBottomColor,
    paddingVertical: 10,
  },
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
    height: 20,
    width: 20,
    marginRight: 10,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    width,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F6F6F6",
  },

  divider: { width: 12 },
  dropdown2BtnStyle: {
    fontSize: 16,
    color: Colors.fontColor,
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    backgroundColor: Colors.inputBackgroundColor,
    width: "70%",
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
  contentContainer: { flexDirection: "row", justifyContent: "space-between" },
  modalButton: {
    height: 44,
    bottom: 3,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 25,
    backgroundColor: Colors.inputBackgroundColor,
  },
  downImage: {
    height: 14,
    width: 14,
    marginLeft: 10,
    tintColor: Colors.grayFont,
  },
  touchableHeader: { flexDirection: "row", alignItems: "center" },
  btnContainer: {
    width: "100%",
    alignItems: "center",
    backgroundColor: Colors.inputBackgroundColor,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 30,
  },
});
