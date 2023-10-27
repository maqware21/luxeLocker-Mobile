import React from "react";
import { StyleSheet, View, Text, Image } from "react-native";
import AuthenticationContainer from "~components/AuthenticationContainer";
import Separator from "~components/Separator";
import { CommonActions } from "@react-navigation/native";
import AssetImages from "~assets";
import SimpleHeader from "~components/SimpleHeader";
import PrimaryButtom from "~components/PrimaryButton";
import Colors from "~utils/Colors";

export default ({ navigation }) => {

  const goToLoginScreen = () => {
    navigation.navigate("login");
  };
  const gotoBack = () => {
    navigation.dispatch(CommonActions.goBack());
  };

  return (
    <AuthenticationContainer>
      <SimpleHeader
        headerLabel={"Forgot Password"}
        showbackButton={true}
        onPress={gotoBack}
        backIcon={true}
      />
      <View style={styles.forgetSection}>
        <Image
          source={AssetImages.emailIcon}
          style={styles.emailIcon}
        />

        <Text
          style={[
            styles.noteText,
            { fontWeight: "500", color: "white", fontSize: 17 },
          ]}
        >
          {"Check Your Email"}
        </Text>
        <Separator height={10} />
        <Text style={styles.noteText}>
          {"We have sent a password recover instructions to your email."}
        </Text>
      </View>
      <Separator height={20} />
      <View style={{ width: "90%" }}>
        <PrimaryButtom
          onPress={goToLoginScreen}
          label={"Back to Sign In"}
        />
      </View>
    </AuthenticationContainer>
  );
};

const styles = StyleSheet.create({
  forgetSection: {
    width: "90%",
    alignItems: "center",
  },
  noteText: {
    color: Colors.grayFont,
    fontSize: 13,
    fontFamily: "Inter-Regular",
    lineHeight: 20,
    alignItems: "center",
    textAlign: "center",
  },
  emailIcon: { height: 200, width: 200 },
});
