import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, BackHandler } from "react-native";
import AuthenticationContainer from "~components/AuthenticationContainer";
import SimpleHeader from "~components/SimpleHeader";
import Colors from "~utils/Colors";
import LoadingOverlay from "~components/LoadingOverlay";
import { getAllPaymentDetailCall } from "~utils/Network/api";
import { useSelector } from "react-redux";
import moment from "moment";
import { CommonActions } from "@react-navigation/native";

export default ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state?.authUser?.authUser);
  const [paymentDetail, setPaymentDetail] = useState();

  const { id } = route?.params?.payment;

  useEffect(() => {
    getPaymentDetailHandler(id);
  }, []);

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

  const getPaymentDetailHandler = (id) => {
    setLoading(true);
    getAllPaymentDetailCall(user?.token?.access, id)
      .then((res) => {
        setLoading(false);
        if (res?.data?.data) {
          setPaymentDetail(res.data.data);
        }
      })
      .catch((error) => {
        setLoading(false);
      });
  };

  const renderPaymentDetailItem = (label, value) => {
    return (
      <View style={styles.wrapper}>
        <Text style={styles.title}>{label}</Text>
        <Text style={styles.description}>{value}</Text>
      </View>
    );
  };  


  return (
    <>
        <AuthenticationContainer>
          <SimpleHeader
            headerLabel={"Monthly Payment"}
            backIcon={true}
            backgroundColor={Colors.inputBackgroundColor}
            onPress={gotoBack}
            />
            {loading ? <LoadingOverlay /> : (
            <>
          {paymentDetail ? (
            <View style={styles.container}>
              {paymentDetail?.card_number ? (
               renderPaymentDetailItem("Card", `*** ${paymentDetail.card_number}`)
              ) : null}
              {paymentDetail?.payment_date ? (
                renderPaymentDetailItem("End Date", moment(paymentDetail.payment_date).format("L"))
              ) : null}
              {paymentDetail?.payment_type ? (
                renderPaymentDetailItem("Type", paymentDetail.payment_type)
              ) : null}
              {paymentDetail?.unit_name ? (
                renderPaymentDetailItem("Unit", paymentDetail.unit_name)
              ) : null}
              {paymentDetail?.unit_address ? (
                renderPaymentDetailItem("Address", paymentDetail.unit_address)
              ) : null}
              {paymentDetail?.payment_price ? (
                renderPaymentDetailItem("Payment Amount", `$ ${paymentDetail.payment_price}`)
              ) : null}
              {paymentDetail?.payment_status ? (
                <View style={styles.wrapper}>
                  <Text style={styles.title}>Status</Text>
                  <Text
                    style={[
                      styles.description,
                      {
                        color:
                          paymentDetail?.payment_status == "unpaid"
                            ? "red"
                            : "green",
                      },
                    ]}
                  >
                    {paymentDetail.payment_status.toUpperCase()}
                  </Text>
                </View>
              ) : null}
              </View>
              ) : null}
              </>
            )}
            </AuthenticationContainer>
              </>
              );
            };
            const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    borderWidth: 1,
    width: "100%",
    justifyContent: "space-between",
  },
  wrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderBottomColor: Colors.inputBackgroundColor,
    borderBottomWidth: 1,
  },
  title: {
    color: Colors.white,
    fontFamily: "Inter",
    fontSize: 13,
    lineHeight: 20,
  },
  description: {
    color: Colors.grayFont,
    fontFamily: "Inter",
    fontSize: 13,
    lineHeight: 20,
  },
});
