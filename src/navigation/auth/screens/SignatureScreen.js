import React, { useState, useEffect, useMemo } from "react";
import {
  Text,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import AuthenticationContainer from "~components/AuthenticationContainer";
import Colors from "~utils/Colors";
import Constant from "~utils/Constant.json";
import { CommonActions } from "@react-navigation/native";
import BackgroundTimer from "react-native-background-timer";
import { getProfileStageCall } from "~utils/Network/api";
import { useSelector } from "react-redux";
import { WebView } from "react-native-webview";
import { ScrollView } from "react-native-gesture-handler";
import DeviceInfo from "react-native-device-info";
import AssetImages from "~assets";

export default ({ navigation, route }) => {
  const [isSignature, setSignature] = useState(false);
  const user = useSelector((state) => state?.authUser?.authUser);
  const [agent, setAgent] = useState(null);
  const [profileStage, setProfileStage] = useState("");

  const ActivityIndicatorElement = () => {
    return (
      <ActivityIndicator
        color="#009688"
        size="large"
        style={styles.activityIndicatorStyle}
      />
    );
  };

  const gotoBackMarketingScreen = () => {
    navigation.dispatch(CommonActions.goBack("marketplace"));
    return true;
  };

  const cardInfoScreen = useMemo(() => {
    const navigateToCardInfo = () => {
      BackgroundTimer.stopBackgroundTimer();
      navigation.navigate("cardInfo", { unitId: route?.params?.unitId });
    };
    return navigateToCardInfo;
  }, [navigation, route?.params?.unitId]);

  const getProfileStageCallHander = (user) => {
    getProfileStageCall(user?.token?.access)
        .then((res) => {
          if (
            res?.data?.data?.salemate_obj?.profile_stage
          ) {
            if (res.data.data.salemate_obj.profile_stage == "stripe") {
              setSignature(true);
            } else if (
              res.data.data.salemate_obj.profile_stage === "insurance"
            ) {
              setProfileStage(res.data.data.salemate_obj.profile_stage);
              setSignature(true);
            }
          }
        })
        .catch((error) => {
          console.log("error", error);
        });
  };

  useEffect(() => {
    BackgroundTimer.runBackgroundTimer(() => getProfileStageCallHander(user), 1000);
    DeviceInfo.getUserAgent().then((userAgent) => {
      setAgent(userAgent);
    });
    return () => {
      BackgroundTimer.stopBackgroundTimer();
    };
  }, []);

  const handlePress = () => {
    if (route?.params?.unitId) {
      navigation.navigate("insuranceScreen", {
        unitId: route?.params?.unitId,
        unit: route?.params?.unit,
      });
    } else if (isSignature) {
      cardInfoScreen();
    }
    BackgroundTimer.stopBackgroundTimer();
  };

  return (
    <AuthenticationContainer>
      {!isSignature ? (
        <View style={styles.container_}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            style={{ width: "100%" }}
          >
            {agent ? (
              <WebView
                source={{ uri: route?.params?.signing_url }}
                javaScriptEnabled={true}
                nestedScrollEnabled
                userAgent={
                  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36"
                }
                style={{ flex: 1 }}
                setBuiltInZoomControls
                renderLoading={ActivityIndicatorElement}
                startInLoadingState={true}
                onNavigationStateChange={({ url }) => {
                  if (url.includes("pricing")) {
                    gotoBackMarketingScreen();
                  } else if (
                    url.includes("viewer=false") ||
                    !url.includes("source=link") ||
                    profileStage === "insurance"
                  ) {
                    getProfileStageCallHander(user);
                  }
                }}
              />
            ) : null}
          </ScrollView>
        </View>
      ) : (
        <View style={styles.container}>
          <View style={styles.container}>
            <Image
              source={
                !isSignature
                  ? AssetImages.clock
                  : AssetImages.agree
              }
              style={styles.image}
            />
            <View style={styles.textContainer}>
              <Text style={styles.headerText}>
                {!isSignature
                  ? Constant.signatureScreen.heading
                  : Constant.signatureScreen.signedAgreementHeading}
              </Text>
              <Text style={styles.description}>
                {!isSignature
                  ? Constant.signatureScreen.description
                  : Constant.signatureScreen.detail}
              </Text>
            </View>
          </View>
          <View
            style={styles.btnContainer}
          >
            <TouchableOpacity
              style={isSignature ? styles.primaryButton : styles.button}
              onPress={handlePress}
            >
              <Text
                style={[
                  styles.primaryText,
                  { color: !isSignature ? "#85878D" : "#0F0F14" },
                ]}
              >
                {Constant.signatureScreen.next}
              </Text>
            </TouchableOpacity>
            {route?.params?.unitId ? (
                !isSignature ? (
              <TouchableOpacity onPress={gotoBackMarketingScreen}>
                <Text
                  style={styles.backToMarketPlace}
                >
                  Back to Marketplace
                </Text>
              </TouchableOpacity>
                ) : null
            ) : null}
          </View>
        </View>
      )}
    </AuthenticationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    width: "100%",
  },
  backToMarketPlace: {
    color: Colors.primaryButtonBackgroundColor,
    marginLeft: 20,
    marginTop: 20,
    fontFamily: "Inter",
    lineHeight: 20,
    fontWeight: "500",
    fontSize: 13,
  },
  btnContainer: { marginBottom: 50, width: "100%", alignItems: "center" },
  image: {
    height: 141,
    width: 170,
  },
  container_: {
    backgroundColor: "#F5FCFF",
    flex: 1,
    width: "100%",
  },
  activityIndicatorStyle: {
    flex: 1,
    justifyContent: "center",
  },
  textContainer: { width: 206 },
  headerText: {
    color: "white",
    marginTop: 20,
    textAlign: "center",
    fontFamily: "Inter",
    fontSize: 17,
    lineHeight: 20,
    fontWeight: "500",
  },
  description: {
    marginTop: 10,
    textAlign: "center",
    color: "#85878D",
    fontFamily: "Inter",
    fontSize: 13,
    lineHeight: 20,
  },
  button: {
    backgroundColor: Colors.inputBackgroundColor,
    padding: 15,
    width: "90%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  primaryButton: {
    backgroundColor: Colors.primaryButtonBackgroundColor,
    padding: 15,
    width: "90%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  primaryText: {
    fontSize: 13,
    letterSpacing: 0,
    lineHeight: 20,
    fontFamily: "Inter",
    fontWeight: "500",
  },
});
