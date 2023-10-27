import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { Text, View, Image, StyleSheet } from "react-native";
import AssetImages from "~assets";
import AuthenticationContainer from "~components/AuthenticationContainer";
import PrimaryButton from "~components/PrimaryButton";
import SecondaryButton from "~components/SecondaryButton";
import SimpleHeader from "~components/SimpleHeader";
import Colors from "~utils/Colors";
import { loginCall } from "~utils/Network/api";
import { useDispatch } from "react-redux";
import { authUser } from "~redux/reducers/authReducer";
import ConfettiCannon from "react-native-confetti-cannon";

export default ({ navigation, route }) => {
  const dispatch = useDispatch();
  const createPayload = () => {
    let payload = {
      email: route?.params?.email?.toLocaleLowerCase(),
      password: route?.params?.password,
      is_admin: false,
    };
    return payload;
  };
  const onLoginCall = async () => {
    await loginCall(createPayload())
      .then((res) => {
        dispatch(authUser(res?.data?.data));
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const secondaryButtonOnPress = async () => {
    const isBuy = await AsyncStorage.getItem("isBuy");
    AsyncStorage.setItem("isLoggedIn", JSON.stringify(true));
    {
      route?.params?.email &&
        route?.params?.password &&
        (await onLoginCall());
    }
    navigation.reset({
      index: 0,
      routes: [{ name: "tabs", isBuy: JSON.parse(isBuy) }],
    });
  }

  return (
    <AuthenticationContainer style={{ flex: 1 }}>
      <ConfettiCannon count={100} origin={{ x: -30, y: 30 }} />
      <SimpleHeader />
      <View style={styles.container}>
        <Image source={AssetImages.locker_ready} style={styles.image} />
        <Text style={styles.title}>Your Locker is Ready</Text>
        <Text style={styles.des}>
          Open the campus gate and enter the luxe locker campus.
        </Text>
      </View>
      <View style={styles.bottom}>
        <PrimaryButton label={"Open Campus Gate"} />
        <View style={{ marginTop: 20 }}>
          <SecondaryButton
            label={"Go to Dashboard"}
            onPress={secondaryButtonOnPress}
          />
        </View>
      </View>
    </AuthenticationContainer>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: { width: 192, height: 115 },
  title: {
    color: Colors.white,
    fontFamily: "Inter",
    fontSize: 15,
    fontWeight: "500",
    marginTop: 20,
  },
  des: {
    color: Colors.grayFont,
    fontFamily: "Inter",
    fontSize: 13,
    marginTop: 10,
    lineHeight: 20,
    marginLeft: 75,
    marginRight: 75,
    textAlign: "center",
  },
  bottom: { position: "absolute", bottom: 10, width: "90%" },
});
