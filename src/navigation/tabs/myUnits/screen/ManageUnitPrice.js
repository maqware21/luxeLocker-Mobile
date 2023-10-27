import React, { useState, useEffect } from "react";
import { View, StyleSheet, BackHandler } from "react-native";
import AuthenticationContainer from "~components/AuthenticationContainer";
import Colors from "~utils/Colors";
import SimpleHeader from "~components/SimpleHeader";
import { CommonActions } from "@react-navigation/native";
import PrimaryButton from "~components/PrimaryButton";
import TextInput from "~components/TextInput";

export default ({ navigation, route }) => {
  const [changedPrice, setChangedPrice] = useState("");

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

  const onApplyPress = () => {
    if (route?.params?.fromBuy) {
      navigation.navigate("manageUnit", {
        unit: route?.params?.unit,
        buyPrice: changedPrice,
      });
    } else {
      navigation.navigate("manageUnit", {
        unit: route?.params?.unit,
        leasePrice: changedPrice,
      });
    }
  };

  return (
    <AuthenticationContainer>
      <SimpleHeader
        headerLabel={route?.params?.fromBuy ? "Sale Amount" : "Rental Price"}
        backgroundColor={Colors.inputBackgroundColor}
        backIcon={true}
        navigation={navigation}
        onPress={gotoBack}
      />

      <View style={styles.container}>
        <TextInput
          onChangeText={(value) => setChangedPrice(value)}
          keyboardType="numeric"
          label={route?.params?.fromBuy ? "Sale Amount" : "Rental Price"}
          value={changedPrice}
        />
      </View>

      <View style={{ width: "90%", marginBottom: 30 }}>
        <PrimaryButton
          label={"Apply"}
          onPress={onApplyPress}
          disabled={changedPrice === "" ? true : false}
        />
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
});
