import React from "react";
import { Text, View, StyleSheet } from "react-native";
import AuthenticationContainer from "~components/AuthenticationContainer";
import Colors from "~utils/Colors";
import AssetImages from "~assets";
import SimpleHeader from "~components/SimpleHeader";
import { CommonActions } from "@react-navigation/native";
import Styles from "~utils/Style/Styles";

export default ({ navigation, route }) => {
  const gotoBack = () => {
    navigation.dispatch(CommonActions.goBack());
    return true;
  };
  const headerRightIconHandler = () => {};
  const roiPercentage = Math.round(route?.params?.roiDetail?.roi_percentage * 100) / 100;
  const annualRio = Math.round(route?.params?.roiDetail?.annual_roi * 100) / 100;

  const renderROIDetails = (label, value) => {
    return (
      <View
        style={styles.roiDetailsContainer}
      >
        <Text style={styles.nameHeader}>{label}</Text>
        <Text style={styles.description}>
          {value}
        </Text>
      </View>
    )
  }

  return (
    <AuthenticationContainer>
      <SimpleHeader
        headerLabel={"ROI"}
        backgroundColor={Colors.inputBackgroundColor}
        backIcon={true}
        rightIcon={AssetImages.bellIcon}
        RightIcon={true}
        rightIconOnPress={headerRightIconHandler}
        navigation={navigation}
        onPress={gotoBack}
      />
      <View style={styles.container}>
        <View style={styles.tile}>
          <Text style={Styles.headingStyle}>
            {`${roiPercentage}% ROI`}
          </Text>
        </View>
        <Text style={[Styles.headingStyle, { marginTop: 20 }]}>Details</Text>
        <View
          style={[
            styles.tile,
            {
              flexDirection: "column",
              justifyContent: "space-between",
              padding: 0,
              paddingHorizontal: 15,
            },
          ]}
        >
          {renderROIDetails("Revenue", "$" + `${route?.params?.roiDetail?.revenue}`)}
          {renderROIDetails("Investment Amount", "$" + `${route?.params?.roiDetail?.unit_investment_amount}`)}
          {renderROIDetails("Investment Gain", "$" + `${route?.params?.roiDetail?.investment_gain}`)}
          {renderROIDetails("Return on Investment", ` ${roiPercentage}% ROI`)}
          <View
            style={styles.annualReturn}
          >
            <Text style={styles.nameHeader}>Annual Return on Invesment</Text>
            <Text style={styles.description}>
              {" "}
              {`${annualRio}% ROI`}
            </Text>
          </View>
        </View>
      </View>
    </AuthenticationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  tile: {
    padding: 15,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: Colors.inputBackgroundColor,
  },
  nameHeader: {
    color: Colors.white,
    fontFamily: "Inter-Medium",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 20,
  },
  description: {
    color: Colors.statusColor,
    fontFamily: "Inter",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 20,
    marginTop: 4,
  },
  roiDetailsContainer: {
    justifyContent: "space-between",
    borderBottomWidth: 1,
    paddingBottom: 5,
    borderBottomColor: Colors.backgroundColor,
    flexDirection: "row",
    marginTop: 15,
  },
  annualReturn: {
    justifyContent: "space-between",
    paddingBottom: 5,
    flexDirection: "row",
    marginTop: 15,
    marginBottom: 10,
  },
});
