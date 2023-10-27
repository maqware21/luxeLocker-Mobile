import React from "react";
import { Text, View, TouchableOpacity, Image, StyleSheet } from "react-native";
import AssetImages from "~assets";
import Colors from "~utils/Colors";
import Styles from "~utils/Style/Styles";
import moment from "moment";

export default ({ vendor, gotoVendorDetailScreen }) => {
  const formattedDate = moment(vendor?.start_date).format("L");

  return (
    <View>
      <View>
        <TouchableOpacity
          style={styles.vendor}
          onPress={() => gotoVendorDetailScreen(vendor)}
        >
          <View>
            <Text
              style={styles.vendorName}
            >
              {vendor?.full_name}
            </Text>
            <Text
              style={styles.formatDate}
            >
              {`${formattedDate} . ${vendor?.email}`}
            </Text>
          </View>
          <View>
            <Image
              source={AssetImages.forward}
              style={[Styles.icon]}
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  vendor: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 5,
    marginTop: 10,
    borderBottomWidth: 1,
    borderColor: Colors.inputBackgroundColor,
  }, 
  vendorName: {
    color: Colors.white,
    fontSize: 13,
    fontFamily: "Inter",
    fontWeight: "500",
    lineHeight: 20,
  },
  formatDate: {
    color: Colors.grayFont,
    marginTop: 1,
    marginBottom: 1,
    fontSize: 13,
    fontFamily: "Inter",
    lineHeight: 20,
  },
})