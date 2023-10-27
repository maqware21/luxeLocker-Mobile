import React, { useEffect } from "react";
import {
  View,
  ImageBackground,
  Platform,
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
} from "react-native";
import PrimaryButtom from "~components/PrimaryButton";
import SecondaryButton from "~components/SecondaryButton";
import Logo from "~components/Logo";
import AssetImages from "~assets";
import Styles from "~utils/Style/Styles";
import Colors from "~utils/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default ({ navigation }) => {
  const goToLoginScreen = () => {
    navigation.navigate("login");
  };
  useEffect(() => {
    AsyncStorage.setItem("isLoggedIn", JSON.stringify(false));
  }, []);

  const goToQrCodeScreen = () => {
    navigation.navigate("storageAccess", { qr: true });
  };

  const gotoMarketPlaceScreen = () => {
    navigation.navigate("marketplace");
  };
  return (
    <ImageBackground
      source={AssetImages.map}
      style={styles.backgroundImg}
    >
      <View
        style={styles.logoContainer}
      >
        <Logo />
      </View>
      <View
        style={styles.btnContainer}
      >
        <PrimaryButtom
          onPress={gotoMarketPlaceScreen}
          label={"Browse Marketplace"}
        />
        <View style={{ marginTop: 10 }}>
          <SecondaryButton
            onPress={goToLoginScreen}
            label={"Sign In"}
          />
        </View>
        <View
          style={styles.qrcodeContainer}
        >
          <TouchableOpacity
            onPress={goToQrCodeScreen}
            style={styles.qrcodeBtn}
          >
            <Image
              source={AssetImages.qrCodeIcon}
              style={[
                Styles.icon,
                { tintColor: Colors.primaryButtonBackgroundColor },
              ]}
            />
            <Text
              style={styles.qrcodeText}
            >
              Scan QR-Code
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImg: { 
    height: "100%", 
    width: "100%" 
  },
  logoContainer: { 
    position: "absolute", 
    alignItems: "center", 
    width: "100%" 
  },
  btnContainer: {
    position: "absolute",
    bottom: Platform.OS == "ios" ? 30 : 10,
    width: "100%",
    paddingHorizontal: 20,
  },
  qrcodeContainer: {
    marginTop: 10,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  qrcodeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 130,
  },
  qrcodeText: {
    color: Colors.primaryButtonBackgroundColor,
    marginLeft: 10,
  },
})