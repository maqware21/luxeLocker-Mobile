import React, { useState, useEffect } from "react";
import {
  Text,
  Alert,
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  PermissionsAndroid,
  BackHandler
} from "react-native";
import AssetImages from "~assets";
import AuthenticationContainer from "~components/AuthenticationContainer";
import SimpleHeader from "~components/SimpleHeader";
import Colors from "~utils/Colors";
import { CommonActions } from "@react-navigation/native";
import PrimaryButton from "~components/PrimaryButton";
import RNFetchBlob from "rn-fetch-blob";
import { getDrivingLicenseCall } from "~utils/Network/api";
import { useSelector } from "react-redux";
import LoadingOverlay from "~components/LoadingOverlay";
export default ({ navigation }) => {
  const user = useSelector((state) => state?.authUser?.authUser);
  const [loading, setLoading] = useState(false);
  const [driverLicenseNo, setDriverLicenseNo] = useState(null);
  const [photo, setphoto] = useState({
    frontSidePhoto: null,
    backSidePhoto: null,
  });
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

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      getDrivingLicenseHandler();
    });
    return unsubscribe;
  }, []);

  const getDrivingLicenseHandler = () => {
    setLoading(true);
    getDrivingLicenseCall(user?.token?.access)
      .then((res) => {
        setLoading(false);
        if (res?.data?.data) {
          setphoto({
            ...photo,
            frontSidePhoto: res?.data?.data?.front,
            backSidePhoto: res?.data?.data?.back,
          });
          setDriverLicenseNo(res.data.data?.license_number);
        }
      })
      .catch((error) => {
        setLoading(false);
      });
  };

  const actualDownload = (name, url) => {
    setLoading(true);
    const { dirs } = RNFetchBlob.fs;
    const dirToSave =
      Platform.OS == "ios" ? dirs?.DocumentDir : dirs?.DownloadDir;
    const configfb = {
      fileCache: true,
      useDownloadManager: true,
      notification: true,
      mediaScannable: true,
      title: name,
      path: `${dirToSave}/${name}`,
    };
    const configOptions = Platform.select({
      ios: {
        fileCache: configfb.fileCache,
        title: configfb.title,
        path: configfb.path,
        appendExt: "pdf",
      },
      android: configfb,
    });

    RNFetchBlob.config(configOptions)
      .fetch("GET", url)
      .then((res) => {
        setLoading(false);
        if (Platform.OS === "ios") {
          RNFetchBlob.fs.writeFile(configfb.path, res?.data, "base64");
          RNFetchBlob.ios.previewDocument(configfb.path);
        }
      })
      .catch((e) => {
        console.log(e.message);
      });
  };
  const actualDownloadAndroid = (name, url) => {
    setLoading(true);
    // Get today's date to add the time suffix in filename
    let date = new Date();
    // File URL which we want to download
    let FILE_URL = url;
    // Function to get extention of the file url
    let file_ext = getFileExtention(FILE_URL);

    file_ext = "." + file_ext[0];
    const { config, fs } = RNFetchBlob;
    let RootDir = fs.dirs.PictureDir;
    let options = {
      fileCache: true,
      addAndroidDownloads: {
        path:
          RootDir +
          "/file_" +
          Math.floor(date?.getTime() + date?.getSeconds() / 2) +
          file_ext,
        description: "downloading file...",
        notification: true,
        useDownloadManager: true,
        title: name,
      },
    };
    config(options)
      .fetch("GET", FILE_URL)
      .then((res) => {
        // Alert after successful downloading
        setLoading(false);
        alert("File Downloaded Successfully.");
      })
      .catch((err) => {
        setLoading(false);
      });
  };
  const getFileExtention = (fileUrl) => {
    // To get the file extension
    return /[.]/.exec(fileUrl) ? /[^.]+$/.exec(fileUrl) : undefined;
  };

  const downloadFile = async (name, url) => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        actualDownloadAndroid(name, url);
      } else {
        Alert.alert(
          "Permission Denied!",
          "You need to give storage permission to download the file"
        );
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const handleFrontDownlaod = () => {
    if (Platform.OS == "ios"){
      actualDownload(
        photo?.frontSidePhoto?.name,
        photo?.frontSidePhoto?.url
      )
    } else {
      downloadFile(
        photo?.frontSidePhoto?.name,
        photo?.frontSidePhoto?.url
      )
    }}

    const handleBackDownload = () => {
        if(Platform.OS == "ios"){
          actualDownload(
            photo?.backSidePhoto?.name,
            photo?.backSidePhoto?.url
            )
          } else {
            downloadFile(
              photo?.backSidePhoto?.name,
              photo?.backSidePhoto?.url
              )
      }}

  return (
    <>
      
        <AuthenticationContainer>
          <SimpleHeader
            headerLabel={"Driver’s License"}
            backgroundColor={Colors.inputBackgroundColor}
            backIcon={true}
            onPress={gotoBack}
          />
        {loading ? <LoadingOverlay /> : (
          <>
          <View style={styles.container}>
            {(photo?.frontSidePhoto && photo?.backSidePhoto && driverLicenseNo) ? (<>
              <TouchableOpacity style={styles.license}>
                <View style={styles.campusName}>
                  <Text style={styles.capmpusText}>{"Driver’s License Front"}</Text>
                  <TouchableOpacity
                    style={styles.licenseImage}
                    onPress={ handleFrontDownlaod }
                  >
                    <Image source={AssetImages.download} style={styles.icon} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.license}>
                <View style={styles.campusName}>
                  <Text style={styles.capmpusText}>{"Driver’s License Back"}</Text>
                  <TouchableOpacity
                    style={styles.licenseImage}
                    onPress={ handleBackDownload }
                  >
                    <Image source={AssetImages.download} style={styles.icon} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.license}>
                <View style={styles.campusName}>
                  <Text style={styles.capmpusText}>{"License Number"}</Text>
                  <View style={styles.licenseImage}>
                    <Text style={[styles.capmpusText, { color: Colors.grayFont }]}>
                      {driverLicenseNo}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </>) : null}
          </View>
          <View style={styles.uplaodLicense}>
            <PrimaryButton
              label={"Upload New Driver’s License"}
              onPress={() => navigation.navigate("uploaloadDriverLicense")}
            />
          </View>
          </>
      )}
        </AuthenticationContainer>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  license: { padding: 10 },
  licenseImage: { marginRight: 10 },
  capmpusText: {
    color: Colors.white,
    lineHeight: 24,
    fontSize: 15,
    fontFamily: "Inter",
  },
  icon: {
    tintColor: Colors.grayFont,
    height: 15,
    width: 15,
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
  uplaodLicense: { bottom: 50, width: "90%" },
});
