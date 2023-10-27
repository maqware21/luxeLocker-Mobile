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
import SimpleHeader from "~components/SimpleHeader";
import Colors from "~utils/Colors";
import Styles from "~utils/Style/Styles";
import PrimaryButton from "~components/PrimaryButton";
import { useSelector } from "react-redux";
import { fetchUserDetailCall, updateUserDetailCall } from "~utils/Network/api";
import SecondaryButton from "~components/SecondaryButton";
const { width } = Dimensions.get("window");

export default ({ navigation, route }) => {
  const scroll = useRef();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const user = useSelector((state) => state?.authUser?.authUser);
  const [activeSections, setActiveSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isStartPickerVisible, setStartPickerVisibility] = useState(false);
  const [isEndPickerVisible, setEndPickerVisibility] = useState(false);
  const [changeDate, setChangeDate] = useState(false);
  const [userDetail, setUserDetail] = useState(null);

  const { unit, addUser } = route.params;

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
    loadVendorDetail(unit?.unit_id, addUser?.id);
  }, []);

  const loadVendorDetail = (unitId, vendorId) => {
    setLoading(true);
    fetchUserDetailCall(user?.token?.access, unitId, vendorId)
      .then((res) => {
        setLoading(false);
        if (res?.data?.data) {
          setUserDetail(res.data.data);
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

  const handleNext = useCallback(async () => {
    setLoading(true);
    await updateUserDetailCall(
      user?.token?.access,
      unit?.unit_id,
      addUser?.id,
      updatePayload()
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
  }, [startDate, endDate]);

  const updatePayload = () => {
    let payload = {
      start_date: startDate,
      end_date: endDate,
    };
    return payload;
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
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          <Text style={Styles.description}>
            {section?.title == "Start Date"
              ? startDate
              : section?.title == "End Date"
              ? endDate
              : null}
          </Text>
          <Image source={AssetImages.down} style={styles.downImage}/>
        </TouchableOpacity>
      </Animatable.View>
    );
  };

  const renderDetails = (label, value) => {
    return (
      <View style={styles.content}>
        <Text style={Styles.nameHeader}>{label}</Text>
        <Text style={Styles.description}>{value}</Text>
      </View>
    )
  }

  return (
    <>
        <AuthenticationContainer>
          {userDetail?.full_name ? (
            <SimpleHeader
              headerLabel={userDetail?.full_name}
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
            style={{ width: "100%", marginLeft: 40 }}
          >
            {userDetail ? (
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
                  {renderDetails("Note", userDetail?.note)}
                  {renderDetails("Unit Number", userDetail?.user_unit)}
                  {renderDetails("Campus Name", userDetail?.user_facility_name)}
                <View style={styles.content}>
                  <Text style={Styles.nameHeader}>{"Accessing the Unit"}</Text>
                  <View style={styles.openClose}>
                    <PrimaryButton
                      label={"Open"}
                      error={true}
                      onPress={() => console.log("hek")}
                    />
                  </View>
                </View>
                <View style={styles.content}>
                  <Text style={Styles.nameHeader}>
                    {"Accessing the Campus Gate"}
                  </Text>
                  <View style={styles.openClose}>
                    <PrimaryButton
                      label={"Close"}
                      onPress={() => console.log("hek")}
                    />
                  </View>
                </View>
              </View>
            ) : null}
            <View
              style={styles.accessBtnContainer}
            >
              <PrimaryButton label={"End All Access"} />
            </View>
          </KeyboardAwareScrollView>
          <View
            style={styles.bottomButtons}
          >
            <View style={styles.btnWidth}>
              <PrimaryButton
                label={"Access History"}
              />
            </View>
            <View style={styles.btnWidth}>
              {!changeDate ? (
                <SecondaryButton label={"Re-Send"} />
              ) : (
                <PrimaryButton label={"Re-Send"} onPress={handleNext} />
              )}
            </View>
          </View>

          <CustomModal
            isVisible={showModal}
            icon={AssetImages.completed}
            primaryButtonText={"Continue"}
            title={"Completed"}
            des={"Additional user updated successfully."}
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
    width: "90%",
  },
  bottomButtons: {
    width: "100%",
    alignItems: "center",
    backgroundColor: Colors.inputBackgroundColor,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 30,
  },
  btnWidth: { width: "40%" },
  accessBtnContainer: {
    width: "90%",
    marginTop: 20,
  },
  openClose: { width: "30%" },
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
    alignItems: "center",
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderBottomColor,
    paddingVertical: 10,
  },
  label: { color: Colors.white, fontFamily: "Inter-Regular" },
  header: {
    flexDirection: "row",
    width,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F6F6F6",
  },
  downImage: {
    height: 14,
    width: 14,
    marginLeft: 10,
    tintColor: Colors.grayFont,
  },
});
