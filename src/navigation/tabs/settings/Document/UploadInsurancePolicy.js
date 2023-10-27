import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Text,
  Alert,
  View,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Image as RNImage,
  BackHandler,
} from "react-native";
import AssetImages from "~assets";
import AuthenticationContainer from "~components/AuthenticationContainer";
import SimpleHeader from "~components/SimpleHeader";
import Colors from "~utils/Colors";
import { CommonActions } from "@react-navigation/native";

import ImagePicker from "react-native-image-crop-picker";
import RBSheet from "react-native-raw-bottom-sheet";
import Styles from "~utils/Style/Styles";
import Separator from "~components/Separator";
import { uploadInsurancePolicyCall } from "~utils/Network/api";
import LoadingOverlay from "~components/LoadingOverlay";
import { useSelector } from "react-redux";
import { Image } from "react-native-compressor";

export default ({ navigation }) => {
  const bottomSheetRef = useRef();
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state?.authUser?.authUser);

  const [documentPhoto, setDocumentPhoto] = useState(null);
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
          setDocumentPhoto(res);
          closeBottomSheetHandler();
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
  useEffect(() => {
    setLoading(false);
  }, [documentPhoto]);

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
          setDocumentPhoto(res);
          closeBottomSheetHandler();
        });
      })
      .catch((err) => {
        if (err?.message === "User cancelled image selection") {
        } else {
          Alert.alert("Permission", "User did not grant camera permission", [
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
  const closeBottomSheetHandler = (type) => {
    bottomSheetRef?.current.close();
  };
  const handleRegister = useCallback(() => {
    setLoading(true);
    const formdata = new FormData();
    formdata.append("insurance_policy_file", {
      type: "image/jpeg",
      uri: documentPhoto,
      name: documentPhoto.split("/").pop(),
    });
    uploadInsurancePolicyCall(formdata, user?.token?.access)
      .then((res) => {
        setLoading(false);
        gotoBack();
      })
      .catch((error) => {
        setLoading(false);

      });
  });

  return (
    <>
      {loading ? <LoadingOverlay /> : (
        <AuthenticationContainer>
          <SimpleHeader
            headerLabel={"Insurance Policy"}
            backgroundColor={Colors.inputBackgroundColor}
            backIcon={true}
            onPress={gotoBack}
          />
          <View style={styles.container}>
            <View style={{ padding: 5 }}>
              <Text
                style={styles.uploadNewDoc}
              >
                {"Upload New Document"}
              </Text>

              <TouchableOpacity
                onPress={() => openBottomSheetHandler("front")}
                style={[styles.uploadButton, { padding: 20 }]}
              >
                <View style={styles.downloadFileContainer}>
                  <View style={styles.uploadCard}>
                    <RNImage
                      source={AssetImages.policyFile}
                      style={styles.driverCard}
                      resizeMode={"contain"}
                    />
                    <Text style={styles.insuranceText}>
                      {"Upload Insurance Policy"}
                    </Text>
                  </View>

                  <RNImage
                    style={styles.bottomSheetForwardIcon}
                    source={AssetImages.forward}
                  />
                </View>
              </TouchableOpacity>
            </View>

            {documentPhoto ? (
              <View style={styles.uploadButtonBackSide}>
                <View style={styles.downloadFileContainer}>
                  <View
                    style={styles.docContainer}
                  >
                    <RNImage
                      source={AssetImages.fileColor}
                      style={styles.file}
                      resizeMode={"contain"}
                    />
                    <Text
                      numberOfLines={1}
                      style={styles.docText}
                    >
                      {documentPhoto?.split("/")?.pop()}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setDocumentPhoto(null)}>
                    <RNImage
                      style={[styles.bottomSheetForwardIcon, { flex: 1 }]}
                      source={AssetImages.trash}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
          </View>
          <View style={styles.saveContainer}>
            <TouchableOpacity
              onPress={() => {
                documentPhoto && handleRegister();
              }}
              style={[
                Styles.PrimaryButton,
                !documentPhoto
                  ? { backgroundColor: Colors.inputBackgroundColor }
                  : null,
              ]}
            >
              <Text
                style={[
                  Styles.primaryButtonText,
                  !documentPhoto ? { color: Colors.grayFont } : null,
                ]}
              >
                {"Save"}
              </Text>
            </TouchableOpacity>
          </View>
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
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  uploadNewDoc: {
    color: "white",
    fontSize: 13,
    fontFamily: "Inter",
    lineHeight: 24,
  },
  uploadCard: { 
    flexDirection: "row", 
    alignItems: "center" 
  },
  insuranceText: { 
    color: "white",
    marginLeft: 10 
  },
  docContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  docText: { 
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
  icon: {
    height: 25,
    width: 25,
    left: 10,
  },
  bottomSheetIcon: {
    tintColor: Colors.primaryButtonBackgroundColor,
    height: 24,
    width: 24,
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
    height: 32,
    width: 52,
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
});
