import React, { useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  BackHandler
} from "react-native";
import AssetImages from "~assets";
import AuthenticationContainer from "~components/AuthenticationContainer";
import SimpleHeader from "~components/SimpleHeader";
import Colors from "~utils/Colors";
import { CommonActions } from "@react-navigation/native";
export default ({ navigation }) => {
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

  const navigateToScreen = (screen) => {
    navigation.navigate(screen);
  };

  const documents = (screen, title) => {
    return (
      <TouchableOpacity
      style={{ padding: 10 }}
      onPress={() => navigateToScreen(screen)}
      >
      <View style={styles.campusName}>
        <Text style={styles.capmpusText}>{title}</Text>
        <View style={{ marginRight: 10 }}>
            <Image source={AssetImages.forward} style={styles.icon} />
        </View>
      </View>
    </TouchableOpacity>
      )
  }

  return (
    <AuthenticationContainer>
      <SimpleHeader
        headerLabel={"Document"}
        backgroundColor={Colors.inputBackgroundColor}
        backIcon={true}
        onPress={gotoBack}
      />
      <View style={styles.container}>
        {documents("insurancePolicy", "Insurance Policy")}
        {documents("driverlicense", "Driver’s License")}
        {documents("leaseAgrement", "Lease Agreement")}
      </View>
    </AuthenticationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  capmpusText: {
    color: Colors.white,
    lineHeight: 24,
    fontSize: 15,
    fontFamily: "Inter",
  },
  icon: {
    tintColor: Colors.grayFont,
    height: 16,
    width: 16,
    left: 10,
  },
  campusName: {
    height: 40,
    borderBottomColor: Colors.borderBottomColor,
    borderBottomWidth: 1,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
  },
});
