import React from "react";
import { Text, View, TouchableOpacity, Image, StyleSheet } from "react-native";
import AssetImages from "~assets";
import Colors from "~utils/Colors";
import Styles from "~utils/Style/Styles";
import moment from "moment";

export default ({ addUser, gotoAdditionalUserDetailScreen }) => {

  const handlePress = () => {
    gotoAdditionalUserDetailScreen(addUser);
  };

  const formattedDate = moment(addUser?.start_date).format("L");

  return (
    <View>
      <View>
        <TouchableOpacity
          style={styles.addUser}
          onPress={handlePress}
        >
          <View>
            <Text
              style={styles.addUserName}
            >
              {addUser?.full_name}
            </Text>
            <Text
              style={styles.adduserDate}
            >
              {`${formattedDate} . ${addUser?.email}`}
            </Text>
          </View>
          <View>
            <Image
              source={AssetImages.forward}
              style={[Styles.icon, { marginRight: 10 }]}
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  addUser: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 5,
    marginTop: 10,
    borderBottomWidth: 1,
    borderColor: Colors.inputBackgroundColor,
  },
  addUserName: {
    color: Colors.white,
    fontSize: 13,
    fontFamily: "Inter",
    fontWeight: "500",
    lineHeight: 20,
  },
  adduserDate: {
    color: Colors.grayFont,
    marginTop: 1,
    marginBottom: 1,
    fontSize: 13,
    fontFamily: "Inter",
    lineHeight: 20,
  }
});