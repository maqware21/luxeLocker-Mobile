import React, { useState } from "react";
import { Text, View, StyleSheet, Image, Alert } from "react-native";
import Colors from "~utils/Colors";
import { useCameraDevices, Camera } from "react-native-vision-camera";
import { useScanBarcodes, BarcodeFormat } from "vision-camera-code-scanner";
import BarcodeMask from "react-native-barcode-mask";
import { TouchableOpacity } from "react-native-gesture-handler";
import { CommonActions } from "@react-navigation/native";
import { availableUnitCall } from "~utils/Network/api";
import NetInfo from "@react-native-community/netinfo";
import InternetModal from "~components/InternetModal";
import AssetImages from "~assets";

export default ({ navigation }) => {
  const [barcode, setBarcode] = useState("");
  const [isScanned, setIsScanned] = useState(false);
  const [hasPermission, setHasPermission] = React.useState(false);
  const [network, setNetwork] = useState(false);
  const [serverError, setServerError] = useState(false);
  const [frameProcessor, barcodes] = useScanBarcodes(
    [BarcodeFormat.ALL_FORMATS],
    {}
  );
  const devices = useCameraDevices();
  const device = devices.back;

  React.useEffect(() => {
    barCodeScanner();
    return () => {
      barcodes;
    };
  }, [barcodes]);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      setIsScanned(false);
    });
    return unsubscribe;
  }, []);

  const barCodeScanner = async () => {
    const status = await Camera.requestCameraPermission();
    setHasPermission(status === "authorized");
    if (barcodes?.length > 0 && isScanned === false) {
      setIsScanned(true);
      barcodes.forEach(async (scannedBarcode) => {
        if (
          scannedBarcode.rawValue !== "" &&
          scannedBarcode.rawValue.includes("luxelocker.page.link")
        ) {
          setBarcode(scannedBarcode.rawValue);
          getAllAvaibaleUnits(scannedBarcode.rawValue.split("=").pop());
        } else {
          Alert.alert("Error", "Invalid Qr code");
        }
      });
    }
    return Promise.resolve();
  };

  const gotoBack = () => {
    navigation.dispatch(CommonActions.goBack());
  };
  const gotoMarketingPlaceScreen = (Id) => {
    navigation.navigate("marketplace", { campus: { id: Id }, buyUnit: true });
  };

  const getAllAvaibaleUnits = (unitId) => {
    setNetwork(false);
    setServerError(false);

    if (unitId) {
      NetInfo.fetch().then((state) => {
        if (state.isConnected) {
          setNetwork(false);
          setServerError(false);
          availableUnitCall(unitId)
            .then((res) => {
              setBarcode("");
              if (res?.data) {
                gotoMarketingPlaceScreen(unitId);
              }
            })
            .catch((error) => {
              setBarcode("");
              if (
                error?.response?.status == 404 ||
                error?.response?.status == 400 ||
                error?.response?.status == 502
              ) {
                setNetwork(true);
                setServerError(true);
              }
            });
        } else {
          setBarcode("");
          L;
          setNetwork(true);
          setServerError(false);
        }
      });
    }
  };

  return (
    device != null &&
    hasPermission && (
      <>
        <Camera
          style={styles.camera}
          device={device}
          isActive={!isScanned}
          frameProcessor={frameProcessor}
          frameProcessorFps={5}
          audio={false}
        />
        <View
          style={styles.mainContainer}
        >
          <View style={styles.closeBtnContainer}>
            <TouchableOpacity
              onPress={gotoBack}
              style={styles.closeBtn}
            >
              <Image
                source={AssetImages.closeIcon}
                style={styles.closeImg}
              />
            </TouchableOpacity>
          </View>
          <View
            style={styles.storageOuterContainer}
          >
            <View
              style={styles.storageInnerContainer}
            >
              <Text style={styles.heading}>{"Enter Storage ID"}</Text>
              <Text style={styles.description}>
                {
                  "Lorem Ipsum is simply dummy text of the printing and typesetting industry"
                }
              </Text>
            </View>
          </View>
        </View>
        <BarcodeMask
          width={"75%"}
          height={280}
          showAnimatedLine={true}
          outerMaskOpacity={0.8}
        />
        <View
          style={{
            position: "absolute",
            bottom: 0,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              width: "100%",
              paddingLeft: 10,
              paddingRight: 10,
            }}
          ></View>
        </View>
        <InternetModal
          isVisible={network}
          icon={AssetImages.internet}
          title={serverError ? "Server Error" : "Internet Connection Issue"}
          des={
            serverError
              ? "Went some thing Wrong"
              : "Please check your internet connection"
          }
          primaryButtonText={"Close"}
          secondaryButtonOnPress={() => console.log("")}
          onPress={() => setNetwork(false)}
        />
      </>
    )
  );
};

const styles = StyleSheet.create({
  heading: {
    color: Colors.white,
    fontFamily: "Inter",
    fontSize: 17,
    fontWeight: "500",
    letterSpacing: 0,
    lineHeight: 24,
    textAlign: "center",
  },
  camera: { width: "100%", height: "100%" },
  mainContainer: {
    position: "absolute",
    top: 10,
    zIndex: 1000,
    zIndex: 1000,
    alignItems: "center",
    width: "100%",
  },
  closeBtnContainer: { 
    width: "100%",
    marginTop: 40, 
    marginLeft: 40 
  },
  closeBtn: {
    justifyContent: "center",
    alignItems: "center",
    height: 24,
    width: 24,
    backgroundColor: Colors.white,
    borderRadius: 24 / 2,
  },
  closeImg: { 
    width: 14, 
    height: 14, 
    tintColor: Colors.grayFont 
  },
  storageOuterContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  storageInnerContainer: {
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
    width: "75%",
  },
  description: {
    color: Colors.white,
    marginTop: 6,
    fontFamily: "Inter",
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0,
    lineHeight: 20,
    textAlign: "center",
  },
});
