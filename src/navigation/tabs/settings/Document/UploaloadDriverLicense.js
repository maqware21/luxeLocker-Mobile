import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Text,
  Alert,
  View,
  TouchableOpacity,
  StyleSheet,
  Image as RNImage,
  Linking,
  BackHandler
} from "react-native";
import AssetImages from "~assets";
import validator from "validator";

import AuthenticationContainer from "~components/AuthenticationContainer";
import SimpleHeader from "~components/SimpleHeader";
import Colors from "~utils/Colors";
import { CommonActions } from "@react-navigation/native";
import ImagePicker from "react-native-image-crop-picker";
import RBSheet from "react-native-raw-bottom-sheet";
import Styles from "~utils/Style/Styles";
import Separator from "~components/Separator";
import { uploadDrivingLicenseCall } from "~utils/Network/api";
import { updateObject } from "~utils/Helpers";
import { Image } from "react-native-compressor";

import { useSelector } from "react-redux";
import LoadingOverlay from "~components/LoadingOverlay";
import TextInput from "~components/TextInput";
export default ({ navigation }) => {
  const bottomSheetRef = useRef();
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state?.authUser?.authUser);
  const [form, setForm] = useState({
    driverLicense: "",
  });
  const [formErrors, setFormErrors] = useState({
    driverLicense: "",
  });
  const [photo, setphote] = useState({
    frontSidePhoto: null,
    backSidePhoto: null,
  });
  const [selectedPhotoType, setSelectedPhotoType] = useState(null);
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

  const openGrallery = async () => {
    ImagePicker.openPicker({
      mediaType: "photo",
    })
      .then(async (img) => {
        let imagePAth =
          Platform.OS === "ios" ? img?.path?.replace("file://", "") : img?.path;
        await Image.compress(imagePAth, {
          compressionMethod: "auto",
        }).then((res) => {
          closeBottomSheetHandler();
          if (selectedPhotoType === "front")
            setphote({ ...photo, frontSidePhoto: res });
          else setphote({ ...photo, backSidePhoto: res });
        });
      })
      .catch((err) => {
        if (err?.message === "User cancelled image selection") {
        } else {
          Alert.alert("Permission", "User did not grant library permission.", [
            {
              text: "Cancel",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel",
            },
            {
              text: "Settings",
              onPress: () => Linking.openURL("app-settings:"),
            },
          ]);
        }
      });
  };

  const closeBottomSheetHandler = () => {
    bottomSheetRef?.current.close();
  };
  const openCamera = async (type) => {
    ImagePicker.openCamera({
      mediaType: "photo",
      compressImageQuality: 0.7,
    })
      .then(async (img) => {
        let imagePAth =
          Platform.OS === "ios" ? img?.path?.replace("file://", "") : img?.path;
        await Image.compress(imagePAth, {
          compressionMethod: "auto",
        }).then((res) => {
          closeBottomSheetHandler();
          if (selectedPhotoType === "front") {
            setphote({ ...photo, frontSidePhoto: res });
          } else {
            setphote({ ...photo, backSidePhoto: res });
          }
        });
      })
      .catch((err) => {
        if (err?.message === "User cancelled image selection") {
        } else {
          Alert.alert("Permission", "User did not grant library permission.", [
            {
              text: "Cancel",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel",
            },
            {
              text: "Settings",
              onPress: () => Linking.openURL("app-settings:"),
            },
          ]);
        }
      });
  };

  const openBottomSheetHandler = (type) => {
    setSelectedPhotoType(type);
    bottomSheetRef?.current.open();
  };

  const handleRegister = useCallback(() => {
    setLoading(true);
    const formdata = new FormData();

    formdata.append("front", {
      type: "image/jpeg",
      uri: Platform.OS === "ios" ? photo.backSidePhoto : photo.backSidePhoto,
      name: photo.backSidePhoto.split("/").pop(),
    });
    formdata.append("back", {
      type: "image/jpeg",
      uri: Platform.OS === "ios" ? photo.backSidePhoto : photo.backSidePhoto,
      name: photo.backSidePhoto.split("/").pop(),
    });

    formdata.append("number", form?.driverLicense);

    uploadDrivingLicenseCall(formdata, user?.token?.access)
      .then((res) => {
        setLoading(false);
        gotoBack();
      })
      .catch((error) => {
        setLoading(false);
      });
  });

  const uploadDriver = () => {
    if (!validator.isEmpty(form?.driverLicense) && photo.frontSidePhoto && photo.backSidePhoto){
      handleRegister();
    }
  }

  return (
    <>
        <AuthenticationContainer>
          <SimpleHeader
            headerLabel={"New Driver’s License"}
            backgroundColor={Colors.inputBackgroundColor}
            backIcon={true}
            onPress={gotoBack}
          />
        {loading ? <LoadingOverlay /> : (
          <>
          <View style={styles.container}>
            <View style={{ padding: 5, }}>
              <Text
                style={styles.licenseText}
              >
                {"Driver’s License"}
              </Text>
              <Text
                style={styles.uploadText}
              >
                {"Upload Your Document*"}
              </Text>
              <TouchableOpacity
                onPress={() => openBottomSheetHandler("front")}
                style={[styles.uploadButton, { padding: 15 }]}
              >
                <View style={styles.downloadFileContainer}>
                  <View
                    style={styles.textContainer}
                  >
                    <RNImage
                      source={AssetImages.frontSide}
                      style={[styles.driverCard]}
                      resizeMode={"contain"}
                    />
                    <Text
                      style={styles.frontText}
                      numberOfLines={1}
                    >
                      {photo.frontSidePhoto
                        ? photo.frontSidePhoto.split("/").pop()
                        : "Front Side"}
                    </Text>
                  </View>
                  <RNImage
                    style={styles.bottomSheetForwardIcon}
                    source={AssetImages.forward}
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => openBottomSheetHandler("back")}
                style={[styles.uploadButtonBackSide, { padding: 15, marginTop: 1 }]}
              >
                <View style={styles.downloadFileContainer}>
                  <View
                    style={styles.textContainer}
                  >
                    <RNImage
                      source={AssetImages.backSide}
                      style={[styles.driverCard]}
                      resizeMode={"contain"}
                    />
                    <Text
                      style={styles.frontText}
                      numberOfLines={1}
                    >
                      {photo.backSidePhoto
                        ? photo.backSidePhoto.split("/").pop()
                        : "Back Side"}
                    </Text>
                  </View>
                  <RNImage
                    style={styles.bottomSheetForwardIcon}
                    source={AssetImages.forward}
                  />
                </View>
              </TouchableOpacity>
            </View>
            <Separator height={10} />
            <View style={{ width: "100%" }}>
              <TextInput
                errorMessage={formErrors?.driverLicense}
                onChangeText={(value) =>
                  updateObject(value, "driverLicense", setForm)
                }
                value={form.driverLicense}
                autoCapitalize="none"
                label="Driver’s License Number*"
              />
              {formErrors?.driverLicense ? (
                <Text style={Styles.errorText}>{formErrors.driverLicense}</Text>
              ) : null}
            </View>
          </View>
          <View style={styles.saveContainer}>
            <TouchableOpacity
              onPress={uploadDriver}
              style={[
                Styles.PrimaryButton,
                !photo.frontSidePhoto ||
                  !photo.backSidePhoto ||
                  validator.isEmpty(form.driverLicense)
                  ? { backgroundColor: Colors.inputBackgroundColor }
                  : null,
              ]}
            >
              <Text
                style={[
                  Styles.primaryButtonText,
                  !photo.frontSidePhoto || !photo.backSidePhoto
                    ? { color: Colors.grayFont }
                    : null,
                ]}
              >
                {"Save"}
              </Text>
            </TouchableOpacity>
          </View>
          </>
        )}
          <RBSheet
            ref={bottomSheetRef}
            openDuration={250}
            customStyles={{
              container: {
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                height: 220,
              },
            }}
          >
            <View style={styles.contentContainer}>
              <Text style={styles.bottomSheetTitle}>{"Upload Documents"}</Text>
              <Separator height={10} />
              <View style={styles.boder} />
              <TouchableOpacity
                onPress={openCamera}
                style={styles.openCamera}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <RNImage
                    style={styles.bottomSheetIcon}
                    source={AssetImages._newCamera}
                  />
                  <Text style={[styles.bottomSheetTitle, { marginLeft: 10 }]}>
                    {"Use Camera"}
                  </Text>
                </View>
                <RNImage
                  style={styles.bottomSheetForwardIcon}
                  source={AssetImages.forward}
                />
              </TouchableOpacity>
              <View style={[styles.boder, { width: "90%" }]} />
              <TouchableOpacity
                onPress={openGrallery}
                style={styles.openGallery}
              >
                <View
                  style={styles.selectDoc}
                >
                  <RNImage
                    style={styles.bottomSheetIcon}
                    source={AssetImages.gallery}
                  />
                  <Text style={[styles.bottomSheetTitle, { marginLeft: 10 }]}>
                    {"Select Documents from Gallery"}
                  </Text>
                </View>
                <RNImage
                  style={styles.bottomSheetForwardIcon}
                  source={AssetImages.forward}
                />
              </TouchableOpacity>
            </View>
          </RBSheet>
        </AuthenticationContainer>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  icon: {
    height: 25,
    width: 25,
    left: 10,
  },
  downloadFileContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  container: {
    padding: 20,
    width: "100%",
  },
  uploadButton: {
    padding: 10,
    backgroundColor: Colors.inputBackgroundColor,
    marginTop: 10,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
  },
  uploadButtonBackSide: {
    padding: 10,
    backgroundColor: Colors.inputBackgroundColor,
    marginTop: 10,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
  },
  driverCard: {
    height: 30,
    width: 30,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#1B1B23",
    paddingTop: 20,
  },
  bottomSheetTitle: {
    color: Colors.white,
    fontFamily: "Inter-Medium",
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 0,
  },
  boder: {
    borderBottomWidth: 0.4,
    borderBottomColor: Colors.grayFont,
    width: "100%",
  },
  image: { width: 27, height: 33 },
  file: { width: 20, height: 20 },
  bottomSheetForwardIcon: { tintColor: Colors.grayFont, height: 20, width: 20 },
  bottomSheetIcon: {
    tintColor: Colors.primaryButtonBackgroundColor,
    height: 24,
    width: 24,
  },
  licenseText: {
    color: "white",
    fontSize: 15,
    fontFamily: "Inter",
    lineHeight: 24,
    fontWeight: "500",
  },
  uploadText: {
    color: "white",
    fontSize: 11,
    fontFamily: "Inter",
    lineHeight: 24,
  },
  textContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  frontText: { 
    color: "white", 
    marginLeft: 10, 
    flex: 1 
  },
  saveContainer: { 
    position: "absolute", 
    bottom: 50, 
    width: "90%" 
  },
  openCamera: {
    padding: 20,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  openGallery: {
    padding: 20,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  selectDoc: {
    flexDirection: "row",
    alignItems: "center",
    fontFamily: "700",
  },
});
