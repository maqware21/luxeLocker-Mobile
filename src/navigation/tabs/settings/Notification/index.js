import React, { useState, useEffect } from "react";
import {
  Text,
  StyleSheet,
  View,
  Switch,
  BackHandler,
} from "react-native";
import AuthenticationContainer from "~components/AuthenticationContainer";
import SimpleHeader from "~components/SimpleHeader";
import Colors from "~utils/Colors";
import {
  getNotificationSetting,
  changeNotificationSetting,
} from "~utils/Network/api";
import { useSelector } from "react-redux";
import { CommonActions } from "@react-navigation/native";

export default ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState(null);
  const user = useSelector((state) => state?.authUser?.authUser);
  const [accessNotification, setAccessNotification] = useState({
    id: null,
    email: false,
    push: false,
    sms: false,
  });
  const [paymentNotification, setPaymentNotification] = useState({
    email: false,
    push: false,
    sms: false,
  });
  const [activityNotification, setActitvityNotification] = useState({
    email: false,
    push: false,
    sms: false,
  });

  useEffect(() => {
    if (user?.token?.access) {
      getNotficationSetting();
    }
  }, []);

  const getNotficationSetting = () => {
    setLoading(true);
    
    getNotificationSetting(user?.token?.access)
      .then((res) => {
        setLoading(false);
        if (res?.data) {
          setId(res?.data?.data[0]?.id);
          setAccessNotification({
            push: res?.data?.data[0]?.access_push,
            sms: res?.data?.data[0]?.access_sms,
            email: res?.data?.data[0]?.access_email,
          });
          setPaymentNotification({
            push: res?.data?.data[0]?.payment_push,
            sms: res?.data?.data[0]?.payment_sms,
            email: res?.data?.data[0]?.payment_email,
          });

          setActitvityNotification({
            push: res?.data?.data[0]?.activity_push,
            sms: res?.data?.data[0]?.activity_sms,
            email: res?.data?.data[0]?.activity_email,
          });
        }
      })
      .catch((error) => {
        setLoading(false);
      });
  };

  useEffect(() => {
    updateNoitficationSetting();
  }, [accessNotification, paymentNotification, activityNotification]);

  const updateNoitficationSetting = () => {
    changeNotificationSetting(user?.token?.access, id, createPayload())
      .then((res) => {})
      .catch((err) => {
        console.log("err", err);
      });
  };

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

  const createPayload = () => {
    let payload = {
      access_push: accessNotification.push,
      access_email: accessNotification.email,
      access_sms: accessNotification.sms,
      payment_push: paymentNotification.push,
      payment_email: paymentNotification.email,
      payment_sms: paymentNotification.sms,
      activity_push: activityNotification.push,
      activity_email: accessNotification.email,
      activity_sms: activityNotification.sms,
    };
    return payload;
  };

  return (
    <AuthenticationContainer>
      <SimpleHeader
        headerLabel={"Notification"}
        backgroundColor={Colors.inputBackgroundColor}
        backIcon={true}
        onPress={gotoBack}
      />
      <View style={styles.container}>
        <View
          style={{
            flexDirection: "row",
          }}
        >
          <View style={styles.LeftSide}>
            <Text style={styles.heading}>Access</Text>
            <Text style={styles.des}>
              There are many variations of passages of Lorem Ipsum available,
              but the majority have suffered alteration in some form
            </Text>
          </View>
          <View style={styles.rightSide}>
            <View style={styles.switchContainer}>
              <Switch
                trackColor={{
                  false: "#767577",
                  true: Colors.primaryButtonBackgroundColor,
                }}
                thumbColor={
                  accessNotification.push ? Colors.white : Colors.white
                }
                ios_backgroundColor="#3e3e3e"
                onValueChange={(val) =>
                  setAccessNotification((prevState) => {
                    return Object.assign({}, prevState, { push: val });
                  })
                }
                value={accessNotification.push}
              />
              <Text style={styles.switchHeading}>Push</Text>
            </View>
            <View style={[styles.switchContainer, { marginTop: 20 }]}>
              <Switch
                trackColor={{
                  false: "#767577",
                  true: Colors.primaryButtonBackgroundColor,
                }}
                thumbColor={
                  accessNotification.email ? Colors.white : Colors.white
                }
                ios_backgroundColor="#3e3e3e"
                onValueChange={(val) =>
                  setAccessNotification((prevState) => {
                    return Object.assign({}, prevState, { email: val });
                  })
                }
                value={accessNotification.email}
              />
              <Text style={styles.switchHeading}>Email</Text>
            </View>
            <View style={[styles.switchContainer, { marginTop: 20 }]}>
              <Switch
                trackColor={{
                  false: "#767577",
                  true: Colors.primaryButtonBackgroundColor,
                }}
                thumbColor={
                  accessNotification.sms ? Colors.white : Colors.white
                }
                ios_backgroundColor="#3e3e3e"
                onValueChange={(val) =>
                  setAccessNotification((prevState) => {
                    return Object.assign({}, prevState, { sms: val });
                  })
                }
                value={accessNotification.sms}
              />
              <Text style={styles.switchHeading}>SMS</Text>
            </View>
          </View>
        </View>
        <View style={styles.borderView} />
        <View
          style={{
            flexDirection: "row",
          }}
        >
          <View style={styles.LeftSide}>
            <Text style={styles.heading}>Payment Notifications</Text>
            <Text style={styles.des}>
              There are many variations of passages of Lorem Ipsum available,
              but the majority have suffered alteration in some form
            </Text>
          </View>
          <View style={styles.rightSide}>
            <View style={styles.switchContainer}>
              <Switch
                trackColor={{
                  false: "#767577",
                  true: Colors.primaryButtonBackgroundColor,
                }}
                thumbColor={
                  paymentNotification.push ? Colors.white : Colors.white
                }
                ios_backgroundColor="#3e3e3e"
                onValueChange={(val) =>
                  setPaymentNotification((prevState) => {
                    return Object.assign({}, prevState, { push: val });
                  })
                }
                value={paymentNotification.push}
              />
              <Text style={styles.switchHeading}>Push</Text>
            </View>
            <View style={[styles.switchContainer, { marginTop: 20 }]}>
              <Switch
                trackColor={{
                  false: "#767577",
                  true: Colors.primaryButtonBackgroundColor,
                }}
                thumbColor={
                  paymentNotification.email ? Colors.white : Colors.white
                }
                ios_backgroundColor="#3e3e3e"
                onValueChange={(val) =>
                  setPaymentNotification((prevState) => {
                    return Object.assign({}, prevState, { email: val });
                  })
                }
                value={paymentNotification.email}
              />
              <Text style={styles.switchHeading}>Email</Text>
            </View>
            <View style={[styles.switchContainer, { marginTop: 20 }]}>
              <Switch
                trackColor={{
                  false: "#767577",
                  true: Colors.primaryButtonBackgroundColor,
                }}
                thumbColor={
                  paymentNotification.sms ? Colors.white : Colors.white
                }
                ios_backgroundColor="#3e3e3e"
                onValueChange={(val) =>
                  setPaymentNotification((prevState) => {
                    return Object.assign({}, prevState, { sms: val });
                  })
                }
                value={paymentNotification.sms}
              />
              <Text style={styles.switchHeading}>SMS</Text>
            </View>
          </View>
        </View>
        <View style={styles.borderView} />
        <View
          style={{
            flexDirection: "row",
          }}
        >
          <View style={styles.LeftSide}>
            <Text style={styles.heading}>More Activity About You</Text>
            <Text style={styles.des}>
              There are many variations of passages of Lorem Ipsum available,
              but the majority have suffered alteration in some form
            </Text>
          </View>
          <View style={styles.rightSide}>
            <View style={styles.switchContainer}>
              <Switch
                trackColor={{
                  false: "#767577",
                  true: Colors.primaryButtonBackgroundColor,
                }}
                thumbColor={
                  activityNotification.push ? Colors.white : Colors.white
                }
                ios_backgroundColor="#3e3e3e"
                onValueChange={(val) =>
                  setActitvityNotification((prevState) => {
                    return Object.assign({}, prevState, { push: val });
                  })
                }
                value={activityNotification.push}
              />
              <Text style={styles.switchHeading}>Push</Text>
            </View>
            <View style={[styles.switchContainer, { marginTop: 20 }]}>
              <Switch
                trackColor={{
                  false: "#767577",
                  true: Colors.primaryButtonBackgroundColor,
                }}
                thumbColor={
                  activityNotification.email ? Colors.white : Colors.white
                }
                ios_backgroundColor="#3e3e3e"
                onValueChange={(val) =>
                  setActitvityNotification((prevState) => {
                    return Object.assign({}, prevState, { email: val });
                  })
                }
                value={activityNotification.email}
              />
              <Text style={styles.switchHeading}>Email</Text>
            </View>
            <View style={[styles.switchContainer, { marginTop: 20 }]}>
              <Switch
                trackColor={{
                  false: "#767577",
                  true: Colors.primaryButtonBackgroundColor,
                }}
                thumbColor={
                  activityNotification.sms ? Colors.white : Colors.white
                }
                ios_backgroundColor="#3e3e3e"
                onValueChange={(val) =>
                  setActitvityNotification((prevState) => {
                    return Object.assign({}, prevState, { sms: val });
                  })
                }
                value={activityNotification.sms}
              />
              <Text style={styles.switchHeading}>SMS</Text>
            </View>
          </View>
        </View>
        <View style={styles.borderView} />
      </View>
    </AuthenticationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundColor,
    width: "100%",
    flex: 1,
    paddingHorizontal: 20,
  },
  heading: { color: "white", fontFamily: "Inter", fontSize: 13 },
  des: {
    color: "grey",
    fontFamily: "Inter",
    marginTop: 10,
    fontSize: 11,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  rightSide: {
    alignItems: "flex-end",
    marginLeft: 20,
  },
  switchContainer: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  borderView: {
    borderBottomWidth: 0.5,
    borderBottomColor: "grey",
    marginTop: 20,
  },
  switchHeading: { color: "white", marginLeft: 5, fontFamily: "Inter" },
  LeftSide: {
    justifyContent: "flex-start",
    width: "70%",
    paddingTop: 20,
  },
});
