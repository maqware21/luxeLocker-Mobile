import React, { useState, useEffect } from "react";
import {
  Text,
  Alert,
  View,
  StyleSheet,
  FlatList,
  Image,
  Switch,
} from "react-native";
import LoadingOverlay from "~components/LoadingOverlay";

import AuthenticationContainer from "~components/AuthenticationContainer";
import Colors from "~utils/Colors";
import SimpleHeader from "~components/SimpleHeader";
import Constant from "~utils/Constant.json";
import { TouchableOpacity } from "@gorhom/bottom-sheet";
import AssetImages from "../../../assets/index";
import { useSelector, useDispatch } from "react-redux";
import { authUser } from "~redux/reducers/authReducer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDrivingLicenseCall } from "~utils/Network/api";

import TouchID from "react-native-touch-id";

export default ({ navigation }) => {
  const dispatch = useDispatch();
  const [faceId, setFaceId] = useState(false);
  const [supportFaceId, setSupportFaceId] = useState(false);
  const [touchId, settouchId] = useState(false);
  const [hasDoc, setHasDoc] = useState(false);
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state?.authUser?.authUser);
  const off = (val, type) => {
    if (type == "faceId") {
      setFaceId(val);
      if (val) addTouchID();
      else {
        AsyncStorage.removeItem("authType");
        AsyncStorage.removeItem("user");
      }
    } else {
      settouchId(val);
      setFaceId(val);
      if (val) addTouchID();
      else {
        AsyncStorage.removeItem("authType");
        AsyncStorage.removeItem("user");
      }
    }
  };

  const goToRelatedScreen = (type) => {
    if (type == "personalInfo") navigation.navigate("personalInfoEditScreen");
    if (type == "changePassword") navigation.navigate("changePasswordScreen");
    if (type == "notification") navigation.navigate("notification");
    if (type == "documents" && hasDoc) {
      navigation.navigate("document");
    }
    if (type == "documents" && !hasDoc) {
      Alert.alert("Error", "No documents have been uploaded by the user yet.");
    }
    if (type == "payment") navigation.navigate("payment");
    if (type == "faq") navigation.navigate("faq");
  };

  useEffect(() => {
    getUser();
    setLoading(true);
    getDrivingLicenseHandler();
    checkDeviceSupport();
  }, []);

  const checkDeviceSupport = async () => {
    const user = await AsyncStorage.getItem("user");
    TouchID.isSupported()
      .then((biometryType) => {
        setLoading(false);
        // Success code
        if (biometryType === "FaceID") {
          if (user) setFaceId(true);
          setSupportFaceId(true);
        } else if (biometryType === "TouchID") {
          setSupportFaceId(false);
          if (user) settouchId(true);
        } else if (biometryType === true) {
          setSupportFaceId(false);
          if (user) settouchId(true);
        }
      })
      .catch((error) => {
        Alert.alert("Error", JSON.stringify(error?.message));
        settouchId(false);
        setFaceId(false);
      });
  };
  const addTouchID = () => {
    TouchID.isSupported()
      .then((biometryType) => {
        setLoading(false);
        // Success code
        if (biometryType === "FaceID") {
          setSupportFaceId(true);
          authenticate("faceId");
        } else if (biometryType === "TouchID") {
          setSupportFaceId(false);
          authenticate("touchId");
        } else if (biometryType === true) {
          setSupportFaceId(false);
          authenticate("biometryType");
        }
      })
      .catch((error) => {
        Alert.alert("Error", JSON.stringify(error?.message));
        settouchId(false);
        setFaceId(false);
      });
  };

  function authenticate(name) {
    return TouchID.authenticate()
      .then((success) => {
        AsyncStorage.setItem("authType", JSON.stringify(name));
        AsyncStorage.setItem("user", JSON.stringify(user));
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const getDrivingLicenseHandler = () => {
    getDrivingLicenseCall(user?.token?.access)
      .then((res) => {
        setLoading(false);
        if (
          res?.data?.data?.front?.url &&
          res?.data?.data?.back?.url
        ) {
          setHasDoc(true);
        }
      })
      .catch((error) => {
        setLoading(false);
      });
  };

  const getUser = async () => {
    const user = await AsyncStorage.getItem("user");
    if (user && !supportFaceId) settouchId(true);
    if (user && supportFaceId) setFaceId(true);
  };

  const renderItem = ({ item }) => {
    if (item?.type && item?.type == "faceId") {
      return(
      <View
        style={[
          styles.itemContainer,
          item.type == "touchId" || item.type == "touchId"
            ? {
              borderBottomWidth: 1,
              borderBottomColor: Colors.borderBottomColor,
            }
            : null,
        ]}
      >
        <View style={styles.faceId}>
          <View style={styles.iconContainer}>
            {item.type && item.type == "faceId" ? (
              <Image style={styles.image} source={AssetImages.faceId} />
            ) : null}
          </View>
          <Text style={[styles.nameHeader, { fontSize: 14 }]}>{item?.name}</Text>
        </View>
        <Switch
          trackColor={{
            false: "#767577",
            true: Colors.primaryButtonBackgroundColor,
          }}
          thumbColor={faceId ? Colors.white : Colors.white}
          ios_backgroundColor="#3e3e3e"
          onValueChange={(val) => off(val, "faceId")}
          value={faceId}
        />
      </View>
      )
    } else if (item?.type && item?.type == "touchId") {
      return(
        <View
          style={[
            styles.itemContainer,
            item.type == "touchId" || item.type == "touchId"
              ? {
                borderBottomWidth: 1,
                borderBottomColor: Colors.borderBottomColor,
              }
              : null,
          ]}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={styles.iconContainer}>
                <Image style={styles.image} source={AssetImages.touchId} />
            </View>
            <Text style={[styles.nameHeader, { fontSize: 14 }]}>{item?.name}</Text>
          </View>
            <Switch
              trackColor={{
                false: "#767577",
                true: Colors.primaryButtonBackgroundColor,
              }}
              thumbColor={touchId ? Colors.white : Colors.white}
              ios_backgroundColor="#3e3e3e"
              onValueChange={(val) => off(val, "touchId")}
              value={touchId}
            />
        </View>
      )
    } else {
      return (
      <TouchableOpacity onPress={() => goToRelatedScreen(item?.type)}>
        <View
          style={[
            styles.itemContainer,
          ]}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={styles.iconContainer}>
              {item?.type && item?.type == "personalInfo" ? (
                <Image style={styles.image} source={AssetImages.personalInfo} />
              ) : item?.type && item?.type == "changePassword" ? (
                <Image style={styles.image} source={AssetImages.changePassword} />
              ) : item?.type && item?.type == "payment" ? (
                <Image style={styles.image} source={AssetImages.payment} />
              ) : item?.type && item?.type == "documents" ? (
                <Image style={styles.image} source={AssetImages.documents} />
              ) : item?.type && item?.type == "faq" ? (
                <Image style={styles.image} source={AssetImages.faq} />
              ) : item?.type && item?.type == "notification" ? (
                <Image style={styles.image} source={AssetImages.notification} />
              ) : null}
            </View>
            <Text style={[styles.nameHeader, { fontSize: 14 }]}>{item?.name}</Text>
          </View> 
            <Image
              style={styles.forwardImage}
              source={AssetImages.forward}
            />
        </View>
      </TouchableOpacity>
      )
    }
  }
const logOut = () => {
  AsyncStorage.setItem("isLoggedIn", JSON.stringify(false));
  dispatch(authUser(null));
  navigation.reset({
    index: 0,
    routes: [{ name: "login" }],
  });
};

  const headerName = user?.first_name?.charAt(0).toUpperCase() + user?.first_name?.slice(1) + " " + user?.last_name?.charAt(0).toUpperCase() + user?.last_name?.slice(1);

return (
  <>
    {loading ? <LoadingOverlay /> : (
      <AuthenticationContainer>
        <SimpleHeader
          headerLabel={Constant.setting.title}
          backgroundColor={Colors.inputBackgroundColor}
          RightIcon={true}
          navigation={navigation}
          rightIcon={AssetImages.logOutIcon}
          rightIconOnPress={logOut}
        />
        <View style={styles.container}>
          <View style={styles.subContainer}>
            <Text style={styles.nameHeader}>
            {headerName}
            </Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
          <FlatList
            data={
              user?.first_login !== null && supportFaceId
                ? Constant.setting.settingVenorWithFaceId
                : user?.first_login !== null && !supportFaceId
                  ? Constant.setting.settingVendrodWithTocuhId
                  : user?.first_login == null && !supportFaceId
                    ? Constant.setting.settingWithTocuchIdItems
                    : user?.first_login == null && supportFaceId
                      ? Constant.setting.settingWithFaceIdItems
                      : null
            }
            renderItem={renderItem}
            keyExtractor={(item) => item.type}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </AuthenticationContainer>
    )}
  </>
);
};

const styles = StyleSheet.create({
  container: { flex: 1, width: "90%", margin: 20 },
  subContainer: {
    paddingBottom: 20,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderBottomColor,
    width: "100%",
  },
  nameHeader: {
    color: Colors.white,
    fontFamily: "Inter",
    fontSize: 17,
    fontWeight: "500",
    lineHeight: 20,
  },
  email: {
    color: Colors.grayFont,
    fontFamily: "Inter",
    fontSize: 11,
    fontWeight: "500",
    lineHeight: 14,
    marginTop: 4,
  },
  image: {
    tintColor: Colors.primaryButtonBackgroundColor,
    height: 25,
    width: 25,
  },
  iconContainer: {
    marginVertical: 12,
    marginRight: 10,
    flexDirection: "row",
    height: 45,
    width: 45,
    borderRadius: 50,
    backgroundColor: Colors.inputBackgroundColor,
    alignItems: "center",
    justifyContent: "center",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  faceId: { flexDirection: "row", alignItems: "center" },
  forwardImage: { tintColor: Colors.white, height: 15, width: 15 },
});
