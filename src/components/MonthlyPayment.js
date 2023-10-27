import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
} from "react-native";
import Colors from "~utils/Colors";
import moment from "moment";
import AssetImages from "~assets";

export default ({ item }) => {

  const formattedDate = moment(item?.payment_date).format("DD/MM/yyyy")

  return (
    <TouchableOpacity style={styles.itemContainer}>
      <View style={styles.itemWrapper}>
        <View style={styles.imgContainer}>
          <Image
            source={AssetImages.checkIcon}
            style={styles.img}
          />
          <View style={styles.dateContainer}>
            <Text style={styles.itemTitle}>{"Monthly Payment"}</Text>
            <Text style={styles.itemDate}>
              {formattedDate}
            </Text>
          </View>
        </View>
        <Text
          style={[
            styles.itemStatus,
            {
              color:
                item?.payment_status === "paid" ? Colors.statusColor : "red",
            },
          ]}
        >
          ${item?.payment_price}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  imgContainer: { flexDirection: "row", alignItems: "center" },
  itemContainer: {
    paddingVertical: 10,
    marginTop: 1,
    paddingHorizontal: 10,
    borderRadius: 8,
    width: "100%",
  },
  img: { height: 20, width: 20 },
  dateContainer: { flexDirection: "column", marginLeft: 10 },
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
});
