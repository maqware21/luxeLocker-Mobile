import React from "react";
import { Alert, View, StyleSheet } from "react-native";
import Colors from "~utils/Colors";
import TabItem from "./TabItem";

export default ({ SetSelectedTabHandler, selectedTab, fromBuy, enableROI }) => {
  return (
    <View style={styles.container}>
      <TabItem
        label="Details"
        isSelected={selectedTab === "Details"}
        onPress={() => SetSelectedTabHandler("Details")}
      />
      <TabItem
        label="Vendors"
        isSelected={selectedTab === "Vendors"}
        onPress={() => SetSelectedTabHandler("Vendors")}
      />
      <TabItem
        label="Users"
        isSelected={selectedTab === "Users"}
        onPress={() => SetSelectedTabHandler("Users")}
      />
      {fromBuy ? (
        <TabItem
          label="ROI"
          isSelected={selectedTab === "ROI"}
          onPress={() => !enableROI ? SetSelectedTabHandler("ROI") : Alert.alert("", "Unit is currently available for lease")}
        />
      ) : (
        <TabItem
          label="Payments"
          isSelected={selectedTab === "Payments"}
          onPress={() => SetSelectedTabHandler("Payments")}
        />
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    width: "95%",
    height: "7%",
    marginTop: 20,
    backgroundColor: Colors.inputBackgroundColor,
    flexDirection: "row",
    marginLeft: 10,
    borderRadius: 8,
  },
});
