import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  BackHandler,
  Alert,
} from "react-native";
import AuthenticationContainer from "~components/AuthenticationContainer";
import Colors from "~utils/Colors";
import { fetchVendorAccessHistory } from "~utils/Network/api";
import SimpleHeader from "~components/SimpleHeader";
import { CommonActions } from "@react-navigation/native";
import Styles from "~utils/Style/Styles";
import { useSelector } from "react-redux";
import moment from "moment";

export default ({ navigation, route }) => {
  const user = useSelector((state) => state?.authUser?.authUser);
  const [vendorHistory, setVendorHistory] = useState()

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
    loadVendorDetail(
      route?.params?.vendorDetail?.vendor_unit_id,
      route?.params?.vendorID
    );
  }, []);

  const loadVendorDetail = (unitId, vendorId) => {
    fetchVendorAccessHistory(user?.token?.access, unitId, vendorId)
      .then((res) => {
        if (res?.data?.data) {
          setVendorHistory(res.data.data)
        }
      })
      .catch((error) => {
        if (
          error?.response?.data?.message?.length > 0 &&
          error?.response?.data?.message[0]?.UNIT
        )
          Alert.alert("Error", error?.response?.data?.message[0]?.UNIT);
      });
  };

  const calendarDate = moment(item?.updated_at).add(10, 'days').calendar();
  const formattedDate = moment(item?.updated_at).format('LT')
  const  rendorVendorHistory = vendorHistory?.map((item, index) => (
    <View key={`${index}`} style={[styles.card, { marginTop: index !== 0 ? 20 : 0 }]}>
      <View style={styles.leftLine} />
      <View style={styles.infoData}>
        <View>
          <Text style={[Styles.nameHeader, { lineHeight: 0 }]}>
            {route?.params?.vendorDetail?.full_name}
          </Text>
          <Text style={[Styles.description, { marginTop: -2 }]}>
            Vendor
          </Text>
        </View>

        <Text style={Styles.nameHeader}>
          {
            item?.status_code === 1 ? "Open Campus gate"
              : item?.status_code === 2 ? "Open Unit door"
                : item?.status_code === 3 ? "Close Unit door"
                  : null
          }
          {" - "}
          {calendarDate}
          {" • "}
          {formattedDate}
        </Text>
      </View>
    </View>
  ))

  return (
    <AuthenticationContainer>
      <SimpleHeader
        headerLabel={"Access History"}
        backgroundColor={Colors.inputBackgroundColor}
        backIcon={true}
        navigation={navigation}
        onPress={gotoBack}
      />
      <View style={styles.container}>
        {rendorVendorHistory}
      </View>
    </AuthenticationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 90,
    backgroundColor: Colors.inputBackgroundColor,
    borderRadius: 10,
  },
  leftLine: {
    width: "2.2%",
    height: "100%",
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    backgroundColor: Colors.primaryButtonBackgroundColor,
  },
  infoData: {
    height: "70%",
    width: "90%",
    marginLeft: 10,
    justifyContent: "space-between",
  },
});
