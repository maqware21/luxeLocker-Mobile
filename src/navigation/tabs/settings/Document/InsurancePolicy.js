import React, { useState, useEffect } from "react";
import {
  Text,
  Alert,
  View,
  TouchableOpacity,
  StyleSheet,
  PermissionsAndroid,
  ScrollView,
  Image as RNImage,
  BackHandler,
  Platform,
} from "react-native";
import AssetImages from "~assets";
import SimpleHeader from "~components/SimpleHeader";
import Colors from "~utils/Colors";
import { CommonActions } from "@react-navigation/native";
import PrimaryButton from "~components/PrimaryButton";
import RNFetchBlob from "rn-fetch-blob";
import { getInsurancePolicyCall } from "~utils/Network/api";
import { useSelector } from "react-redux";
import LoadingOverlay from "~components/LoadingOverlay";
import moment from "moment";

export default ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [documentDetail, setDocumentDetail] = useState([]);
  const user = useSelector((state) => state?.authUser?.authUser);
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
    setLoading(false);
    const unsubscribe = navigation.addListener("focus", () => {
      getInsurancePolicyHandler();
    });
    return unsubscribe;
  }, []);

  const getInsurancePolicyHandler = () => {
    setLoading(true);
    getInsurancePolicyCall(user?.token?.access)
      .then((res) => {
        setLoading(false);
        if (res?.data?.data) {
          setDocumentDetail(res.data.data);
        }
      })
      .catch((error) => {
        setLoading(false);
      });
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

  const actualDownload = (name, url) => {
    setLoading(true);
    const { dirs } = RNFetchBlob.fs;
    const dirToSave =
      Platform.OS == "ios" ? dirs.DocumentDir : dirs.DownloadDir;
    const configfb = {
      fileCache: true,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        path: `${dirToSave}/${name}`,
        description: "Image",
      },
      title: name,
      path: `${dirToSave}/${name}`,
    };

    const configOptions = Platform.select({
      ios: {
        fileCache: configfb.fileCache,
        title: configfb.title,
        path: configfb.path,
      },
      android: configfb,
    });
    RNFetchBlob.config(configOptions)
      .fetch("GET", url, {})
      .then((res) => {
        setLoading(false);
        if (Platform.OS === "ios") {
          RNFetchBlob.fs.writeFile(configfb.path, res.data, "base64");
          RNFetchBlob.ios.previewDocument(configfb.path);
        }
        if (Platform.OS == "android") {
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
          Math.floor(date.getTime() + date.getSeconds() / 2) +
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

  const documentDetails = documentDetail?.length > 0 && documentDetail?.map((item, index) => {
    const formattedDate = moment(item?.created_at).format("MMMM Do YYYY, h:mm:ss a");
  return (
      <View key={`${index}`} style={styles.container}>
        <Text style={styles.formattedDate}>
          {formattedDate}
        </Text>
        <View style={styles.uploadButtonBackSide}>
          <View style={styles.downloadFileContainer}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <RNImage
                source={AssetImages.fileColor}
                style={styles.file}
                resizeMode={"contain"}
              />
              <Text
                numberOfLines={1}
                style={styles.docName}
              >
                {item?.name}
              </Text>
            </View>
            <View style={styles.downlaodDoc}>
              <TouchableOpacity
                onPress={() =>
                  Platform.OS == "ios"
                    ? actualDownload(item?.name, item?.url)
                    : downloadFile(item?.name, item?.url)
                }
              >
                <RNImage
                  style={styles.bottomSheetForwardIcon}
                  source={AssetImages.download}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
  )
})

  return (
        <View style={styles.insurance}>
          <SimpleHeader
            headerLabel={"Insurance Policy"}
            backgroundColor={Colors.inputBackgroundColor}
            backIcon={true}
            onPress={gotoBack}
          />
        {loading ? <LoadingOverlay /> : (
          <>
          <ScrollView style={styles.docDetail}>
            {documentDetails}
          </ScrollView>
          <View
            style={styles.uploadBtnOuterContainer}
          >
            <View style={styles.uploadBtnInnerContainer}>
              <PrimaryButton
                label={"Upload New Insurance Policy"}
                onPress={() => navigation.navigate("uploadInsurancePolicy")}
              />
            </View>
          </View>
          </>
            )}
        </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  insurance: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Colors.backgroundColor,
    width: "100%",
  },
  docDetail: { flex: 1, width: "100%" },
  uploadBtnOuterContainer: {
    alignItems: "center",
    justifyContent: "flex-end",
    width: "100%",
  },
  uploadBtnInnerContainer: { width: "90%", marginBottom: 10 },
  downlaodDoc: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 5,
  },
  docName: { color: "white", marginLeft: 10, width: "80%" },
  formattedDate: {
    color: Colors.primaryButtonBackgroundColor,
    marginBottom: 10,
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
    paddingLeft: 10,
    paddingRight: 10,
    padding: 5,
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
    padding: 20,
    backgroundColor: Colors.inputBackgroundColor,
    borderRadius: 10,
  },
  image: { width: 27, height: 33 },
  file: { width: 20, height: 20 },
  bottomSheetForwardIcon: {
    tintColor: Colors.grayFont,
    height: 15,
    width: 15,
  },
});
