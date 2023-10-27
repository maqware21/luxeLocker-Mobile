import React, { useState, useEffect } from "react";
import { View, StyleSheet, BackHandler } from "react-native";
import Colors from "~utils/Colors";
import { CommonActions } from "@react-navigation/native";
import AuthenticationContainer from "~components/AuthenticationContainer";
import SimpleHeader from "~components/SimpleHeader";
import Card from "~components/Card";
import SecondaryButton from "~components/SecondaryButton";
import PaymentHistory from "~components/PaymentHistory";

import { useSelector } from "react-redux";

import {
  getCardListingCall,
  getAllPaymentHistoryCall,
} from "~utils/Network/api";
import LoadingOverlay from "~components/LoadingOverlay";

export default ({ navigation }) => {
  const [getCards, setCards] = useState([]);
  const [getPaymentList, setPaymentListory] = useState([]);
  const user = useSelector((state) => state?.authUser?.authUser);
  const [loading, setLoading] = useState(false);

  const gotoBack = () => {
    navigation.dispatch(CommonActions.goBack());
    return true;
  };
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      getAllCardsHandler();
      getAllPaymentHandler();
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", gotoBack);
    return () => {
      BackHandler.removeEventListener("hardwareBackPress", gotoBack);
    };
  }, []);

  const getAllCardsHandler = () => {
    setLoading(true);
    setCards([]);
    getCardListingCall(user?.token?.access)
      .then((res) => {
        setLoading(false);
        if (res?.data?.data?.length > 0) {
          setCards(res.data.data);
        }
      })
      .catch((error) => {
        setLoading(false);
      });
  };

  const getAllPaymentHandler = () => {
    setLoading(true);
    getAllPaymentHistoryCall(user?.token?.access)
      .then((res) => {
        setLoading(false);
        if (res?.data?.data?.history)
          setPaymentListory(res.data.data.history);
      })
      .catch((error) => {
        setLoading(false);
      });
  };
  return (
    <>
        <AuthenticationContainer>
          <SimpleHeader
            headerLabel={"Payments"}
            backgroundColor={Colors.inputBackgroundColor}
            backIcon={true}
            onPress={gotoBack}
          />
          <View style={styles.container}>
            {getCards && getCards.length > 0 ? (
              <Card
                card={getCards}
                user={user?.token?.access}
                getAllCardsHandler={getAllCardsHandler}
                listHeader={"Your Cards"}
              />
            ) : null}
            <View style={{ marginTop: 20 }}>
              <SecondaryButton
                label={"Add Card"}
                onPress={() => {
                  getCards && getCards?.length == 2
                    ? null
                    : navigation.navigate("cardInfo", { from: "payment" });
                }}
              error={getCards && getCards?.length == 2 ? "error" : null}
              />

              <PaymentHistory
                paymentHistory={getPaymentList}
                navigation={navigation}
              />
            </View>
          </View>
      {loading && <LoadingOverlay /> }
        </AuthenticationContainer>
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "95%",
  },
});
