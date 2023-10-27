import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  BackHandler
} from "react-native";
import AuthenticationContainer from "~components/AuthenticationContainer";
import Colors from "~utils/Colors";
import AssetImages from "~assets";
import SimpleHeader from "~components/SimpleHeader";
import { CommonActions } from "@react-navigation/native";
import TopTabs from "~components/TopTabs";
import PrimaryButton from "~components/PrimaryButton";
import { leaseUnitCall, sellUnitCall } from "~utils/Network/api";
import { useSelector } from "react-redux";
import LoadingOverlay from "~components/LoadingOverlay";
import CustomModal from "~components/CustomModal";

export default ({ navigation, route }) => {
  const [selectedBuyUnit, setSelectedBuyUnit] = useState(true);
  const [isVisible, setVisible] = useState(false);
  const user = useSelector((state) => state?.authUser?.authUser);
  const [loading, setLoading] = useState(false);

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

  const SelectedOwenTab = () => {
    setSelectedBuyUnit(true);
  };
  const SelectedLeaseTab = () => {
    setSelectedBuyUnit(false);
  };

  const gotoManageUnitPrice = () => {
    navigation.navigate("manageUnitPrice", {
      unit: route?.params?.unit,
      fromBuy: selectedBuyUnit,
    });
  };
  const myUnitsScreen = () => {
    setVisible(false);
    navigation.navigate("tabs", { screen: "MyUnits" });
  };
  const onPressSaleORLeaseBtn = () => {
    setLoading(true);
    if (selectedBuyUnit) {
      sellUnitCall(
        { buy_price: route?.params?.buyPrice },
        user?.token?.access,
        route?.params?.unit.unit_id
      )
        .then((res) => {
          if (res.data?.data) {
            setVisible(true);
            setLoading(false);
          }
        })
        .catch((errr) => {
          setLoading(false);
          {
            errr?.response?.data?.message?.[0]?.UNIT &&
              Alert.alert("Error", errr?.response?.data?.message?.[0]?.UNIT);
          }
        });
    } else {
      leaseUnitCall(
        { rental_price: route?.params?.leasePrice },
        user?.token?.access,
        route?.params?.unit?.unit_id
      )
        .then((res) => {
          if (res?.data?.data) {
            setVisible(true);
            setLoading(false);
          }
        })
        .catch((errr) => {
          setLoading(false);
          {
            errr?.response?.data?.message?.[0]?.UNIT &&
              Alert.alert("Error", errr?.response?.data?.message?.[0]?.UNIT);
          }
        });
    }
  };

  const renderUnitDetails = (label, value) => {
    return (
      <View style={styles.content}>
        <Text style={styles.nameHeader}>{label}</Text>
        <Text style={styles.description}>
          {value}
        </Text>
      </View>
    )
  }
  return (
    <>
      {loading ? <LoadingOverlay /> : (
        <AuthenticationContainer>
          <SimpleHeader
            headerLabel={"Manage Unit"}
            backgroundColor={Colors.inputBackgroundColor}
            backIcon={true}
            navigation={navigation}
            onPress={gotoBack}
          />

          <View style={styles.sellLeaseContainer}>
            <Text style={[styles.title, { color: Colors.white, fontSize: 15 }]}>
              Sell or Lease Unit
            </Text>
            <Text style={styles.title}>Do you want to sell or rent a Unit?</Text>
          </View>

          <View style={{ paddingHorizontal: 20 }}>
            <TopTabs
              selectedBuyUnited={selectedBuyUnit}
              SelectedOwenTab={SelectedOwenTab}
              SelectedLeaseTab={SelectedLeaseTab}
              buyTitle={"Sell"}
              leaseTitle={"Lease Out"}
              fromManage
            />
          </View>

          <View style={styles.container}>
            {renderUnitDetails("Unit Number", route?.params?.unit?.unit_number)}
            {renderUnitDetails("Facility Name", route?.params?.unit?.unit_location)}
            {renderUnitDetails("Facility Name", `${route?.params?.unit?.unit_dimentions?.length} ft x ${route?.params?.unit?.unit_dimentions?.width} ft.`)}

            <TouchableOpacity onPress={gotoManageUnitPrice} style={styles.content}>
              <Text style={styles.nameHeader}>
                {selectedBuyUnit ? "Sale Amount" : "Rental Price"}
              </Text>
              <View style={{ flexDirection: "row" }}>
                <Text
                  style={[
                    styles.description,
                    {
                      color:
                        (selectedBuyUnit && route?.params?.buyPrice) ||
                          (!selectedBuyUnit && route?.params?.leasePrice)
                          ? Colors.statusColor
                          : Colors.grayFont,
                    },
                  ]}
                >
                  {selectedBuyUnit && route?.params?.buyPrice
                    ? `$${route?.params?.buyPrice}`
                    : !selectedBuyUnit && route?.params?.leasePrice
                      ? `$${route?.params?.leasePrice}`
                      : "0.00"}
                </Text>
                <Image source={AssetImages.forward} style={styles.forwardImage} />
              </View>
            </TouchableOpacity>
          </View>
          {(!route?.params?.unit?.unit_buy_request && selectedBuyUnit) ||
            (!route?.params?.unit?.unit_lease_request && !selectedBuyUnit) ? (
            <View style={styles.btnContainer}>
              <PrimaryButton
                label={selectedBuyUnit ? "Sell Unit" : "Lease Unit"}
                onPress={onPressSaleORLeaseBtn}
                disabled={
                  (selectedBuyUnit && !route?.params?.buyPrice) ||
                    (!selectedBuyUnit && !route?.params?.leasePrice)
                    ? true
                    : false
                }
              />
            </View>
          ) : (
            <View style={styles.btnContainer}>
              <PrimaryButton
                label={selectedBuyUnit ? "Sell Unit" : "Lease Unit"}
                onPress={onPressSaleORLeaseBtn}
                disabled={true}
              />
            </View>
          )}
          <CustomModal
            isVisible={isVisible}
            icon={AssetImages.completed}
            primaryButtonText={"Continue"}
            onPress={myUnitsScreen}
            title={"Thank You"}
            des={
              selectedBuyUnit
                ? "your locker is available for Buy"
                : "your locker is available for Lease"
            }
          />
        </AuthenticationContainer>
      )}
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
  container: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 20,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderBottomColor,
    paddingVertical: 10,
  },
  nameHeader: {
    color: Colors.white,
    fontFamily: "Inter-Medium",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 20,
  },
  description: {
    color: Colors.grayFont,
    fontFamily: "Inter",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 20,
    marginTop: 4,
  },
  forwardImage: {
    height: 14,
    width: 14,
    marginTop: 8,
    marginLeft: 5,
    tintColor: Colors.grayFont,
  },
  sellLeaseContainer: { 
    marginLeft: 40, 
    marginTop: 20, 
    width: "100%" 
  },
  btnContainer: { width: "90%", marginBottom: 30 },
});
