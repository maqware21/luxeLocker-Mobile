import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  StatusBar,
  FlatList,
  TouchableOpacity,
} from "react-native";
import Colors from "~utils/Colors";
import moment from "moment";

const Separator = () => <View style={styles.itemSeparator} />;

export default ({ paymentHistory, navigation }) => {
  const ItemView = ({ item, index }) => {
    const paymetDate = moment(item?.payment_date).format("L");
    
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => navigation.navigate("paymentDetail", { payment: item })}
      >
        <View style={styles.itemWrapper}>
          <View style={{ flexDirection: "column" }}>
            <Text style={styles.itemTitle}>{item?.payment_type}</Text>
            <Text style={styles.itemDate}>
              {paymetDate}
            </Text>
          </View>
          <Text
            style={[
              styles.itemStatus,
              { color: item?.payment_status === "paid" ? "green" : "red" },
            ]}
          >
            {`$ ${item?.payment_price}`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderPaymentHistory = paymentHistory && paymentHistory.length < 0 ? (
    <View style={{ width: "100%", alignItems: "center" }}>
      <Text style={[styles.paymentHeading, { color: Colors.grayFont }]}>
        {"No Payments"}
      </Text>
    </View>
  ) : null;

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <View style={{ marginTop: 20 }}>
          <Text style={styles.paymentHeading}>Payments History</Text>
          <FlatList
            style={{ marginTop: 20 }}
            contentContainerStyle={{ paddingBottom: 340 }}
            data={paymentHistory}
            keyExtractor={(item) => item?.id}
            renderItem={ItemView}
            ItemSeparatorComponent={Separator}
            showsVerticalScrollIndicator={false}
          />
          {renderPaymentHistory}
        </View>
      </SafeAreaView>
    </>
  );
};
const styles = StyleSheet.create({
  itemSeparator: {
    flex: 1,
    height: 0.5,
    backgroundColor: Colors.inputBackgroundColor,
  },
  itemContainer: {
    paddingVertical: 10,
    marginTop: 1,
    paddingHorizontal: 10,
    borderRadius: 8,
    width: "100%",
  },
  itemWrapper: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  itemTitle: {
    fontSize: 13,
    fontFamily: "Inter",
    color: Colors.white,
    textTransform: "capitalize",
  },
  itemDate: {
    fontSize: 11,
    marginTop: 10,
    fontFamily: "Inter",
    color: Colors.grayFont,
  },
  itemStatus: {
    fontSize: 13,
    fontFamily: "Inter",
  },
  paymentHeading: {
    color: Colors.white,
    fontFamily: "Inter",
    fontSize: 15,
    fontWeight: "500",
  },
});
