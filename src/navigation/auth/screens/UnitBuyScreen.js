import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  Image,
  BackHandler,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import AuthenticationContainer from "~components/AuthenticationContainer";
import Colors from "~utils/Colors";
import CustomModal from "~components/CustomModal";
import AssetImages from "~assets";
import PrimaryButton from "~components/PrimaryButton";
import {
  availableUnitDetailCall,
  getProfileStageCall,
} from "~utils/Network/api";
import LoadingOverlay from "~components/LoadingOverlay";
import BackgroundTimer from "react-native-background-timer";
import { useSelector } from "react-redux";
import { CommonActions } from "@react-navigation/native";
export default ({ navigation, route }) => {
  const user = useSelector((state) => state?.authUser?.authUser);
  const [from, setFrom] = useState(null);
  const [profileStage, setProfileStage] = useState(null);
  const [unitDetail, setUnitDetail] = useState({
    unit_number: route?.params?.unit?.unit_number,
    facility_name: null,
    facility_postalcode: null,
    facility_street: null,
    facility_amenities: [],
    facility_city: null,
  });
  const [unitDetails, setUnitDetails] = useState({});
  const [isModal, setModal] = useState(false);
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
    navigation.navigate("createAccount", {
      unit: unitDetails,
      buyUnit: route?.params?.buyUnit,
    });
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      if (route?.params?.from) {
        setFrom(route.params.from);
      }
      getProfileStageCallHander();
      Orientation.lockToPortrait();
      setLoading(false);
      if (route?.params?.unit?.id)
        availableUnitDetailCall(route.params.unit.id)
          .then((res) => {
            setLoading(false);
            if (res?.data?.data) {
              setUnitDetails(res.data.data);
            }
          })
          .catch((error) => {
            setLoading(false);
          });
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return () => {
      unsubscribe;
      BackgroundTimer.stopBackgroundTimer(); //after this call all code on background stop run.
    };
  }, [navigation]);

  const insuranceScreen = () => {
    setModal(false);
    BackgroundTimer.stopBackgroundTimer();
    navigation.navigate("insuranceScreen");
  };

 const getProfileStageCallHander = () => {
    BackgroundTimer.runBackgroundTimer(() => {
      getProfileStageCall(user?.token?.access)
        .then((res) => {
          if (res?.data?.data) {
            setProfileStage(res.data.data?.profile_stage);
          }
        })
        .catch((error) => {
          console.log("error", error);
        });
    }, 1000);
  };

  const primaryButtonPress = () => {
    from === "SignUp"
      ? setModal(true)
      : goToCreateAccountScreen();
  }

  return (
    <>
        <View style={{ flex: 1 }}>
          <Image
            source={AssetImages.unit}
            style={styles.unitImage}
            resizeMode="cover"
          />

      <AuthenticationContainer style={styles.authenticationContainer}>
        <View style={{ flex: 1, padding: 20, width: "100%" }}>
          {/* unit title view */}
          <View
            style={styles.unitNumAdd}
          >
            <Text
              style={[styles.title, { color: Colors.white }]}
              >{`Unit ${unitDetail?.unit_number}`}</Text>
              {unitDetails?.facility_street ? (
              <Text style={[styles.title, { color: Colors.grayFont }]}>
                {`${unitDetails.facility_street}`}
              </Text>
            ) : null}
          </View>

          {/* Faculty Address */}
              <View style={styles.detailContainer}>
              {unitDetails?.facility_name || unitDetails?.facility_postalcode ? (
                  <Text style={[styles.title, { color: Colors.grayFont }]}>
                    {" Campus Address".toUpperCase()}
                  </Text>
                ) : null}
              {unitDetails?.facility_name || unitDetails?.facility_postalcode ? (
                  <Text
                    style={[styles.title, styles.unitDetails]}
                  >
                  {`${unitDetails?.facility_name ? unitDetails?.facility_name : ""
                    },${unitDetails?.facility_postalcode
                    ? unitDetails.facility_postalcode
                        : ""
                      }`}
                  </Text>
                ) : null}
                <View style={styles.detailContainer}>
                  <Text style={[styles.title, { color: Colors.grayFont }]}>
                    {"Dimensions".toUpperCase()}
                  </Text>
                  <Text
                    style={[styles.title, styles.unitDetails]}
                  >
                  {`${unitDetails?.length} ft. x ${unitDetails?.width} ft.`}
                  </Text>
                  {unitDetails.facility_amenities ? (
                    <View style={styles.detailContainer}>
                      <Text style={[styles.title, { color: Colors.grayFont }]}>
                        {"Amenities".toUpperCase()}
                      </Text>
                      {unitDetails?.facility_amenities &&
                        unitDetails?.facility_amenities.map((item, index) => (
                          <Text
                            key={`${index}`}
                            style={[
                              styles.title,
                              styles.unitDetails,
                            ]}
                          >
                            {item?.amenity__name}
                          </Text>
                        ))}
                    </View>
                  ) : null}
                  <View style={{ position: "absolute", bottom: 30 }}>
                    <Text
                      style={[
                        styles.title,
                        styles.amount,
                      ]}
                    >
                    {route?.params?.buyUnit ? "Purchase Amount".toUpperCase() : "Lease Rate".toUpperCase()}
                    </Text>
                    <Text
                      style={[
                        styles.title,
                        styles.unitPrice,
                      ]}
                    >
                    {route?.params?.buyUnit && unitDetails
                        ? `$ ${unitDetails.buy_price}`
                        : `$ ${unitDetails.lease_price}`}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.bottomContainer}>
                <View style={{ marginLeft: 10, width: "100%" }}>
                  <PrimaryButton
                  label={route?.params?.buyUnit ? "Purchase Unit" : "Lease Unit"}
                    onPress={primaryButtonPress}
                  />
                </View>
              </View>
            </View>
          </AuthenticationContainer>
          <TouchableOpacity
            onPress={gotoBack}
            style={styles.goBackBtn}
          >
            <Image source={AssetImages.back} style={{ height: 20, width: 20 }} />
          </TouchableOpacity>
          <CustomModal
            isVisible={isModal}
            icon={AssetImages.completed}
            primaryButtonText={"Continue"}
            pimaryButtonColor={
              profileStage === "insurance"
                ? Colors.primaryButtonBackgroundColor
                : Colors.grayFont
            }
            title={"Thank You"}
            des={"Luxelocker Staff will contact you momentarily"}
            onPress={() =>
              profileStage === "insurance" ? insuranceScreen() : null
            }
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
  },
  bottomContainer: {
    backgroundColor: Colors.backgroundColor,
    width: "100%",
    bottom: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
  detailContainer: { flex: 1, paddingTop: 20, width: "100%" },
  authenticationContainer: {
    borderTopRightRadius: 20,
    borderTopLeftRadius:20,
    position: "absolute",
    top: "38%",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  unitImage: { 
    width: "100%",
    height: "40%" 
  },
  unitNumAdd: { 
    flexDirection: "row", 
    justifyContent: "space-between" 
  },
  unitDetails: { 
    color: Colors.white, 
    paddingTop: 4 
  },
  goBackBtn: {
    fontSize: 10,
    bottom: 280,
    left: 15,
    height: 40,
    width: 40,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 40 / 2,
  },
  amount: {
    color: Colors.grayFont,
    fontSize: 15,
    fontFamily: "Inter-Medium",
  },
  unitPrice: {
    color: Colors.white,
    paddingTop: 4,
    fontSize: 15,
    justifyContent: "space-around",
  },
});
