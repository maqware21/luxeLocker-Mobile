import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import Colors from "~utils/Colors";
import AssetImages from "~assets";
import { useSelector } from "react-redux";

export default ({
  rightIconPress,
  plusIconPress,
  bellIconPress,
  notificationCount
}) => {
  const user = useSelector((state) => state?.authUser?.authUser);

  // Title
  const renderTitle = user?.first_login == null ? "My Units" : "Available Units";

  // Notification Count
  const renderNotificationCount = notificationCount > 0 ? (
    <View style={styles.notifCircle}>
      <Text style={styles.nameHeader}>
        {notificationCount}
      </Text>
    </View>
  ) : null;

  // Plus Icon
  const renderPlusIcon = user?.first_login == null ? (
    <TouchableOpacity
      style={{ padding: 10 }}
      onPress={plusIconPress && plusIconPress}
    >
      <Image
        style={styles.icon}
        source={AssetImages.plus}
      />
    </TouchableOpacity>
  ) : null;

  return (
    <View style={styles.container}>
      <View style={styles.subContainer}>
        <View style={styles.hederLeft}>
          <TouchableOpacity
            onPress={rightIconPress && rightIconPress}
            style={styles.bellIconButton}
          >
            <Image
              style={[
                styles.icon,
                { tintColor: Colors.primaryButtonBackgroundColor },
              ]}
              source={AssetImages.qrCodeIcon}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>
          {renderTitle}
        </Text>
        <View style={{ flex: 1, marginRight: 10 }}>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={bellIconPress && bellIconPress}
              style={styles.bellIconButton}
            >
              <Image
                style={styles.icon}
                source={AssetImages.bell}
              />
              {renderNotificationCount}
            </TouchableOpacity>
            {renderPlusIcon}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.inputBackgroundColor,
    width: "100%",
    flexDirection: "column",
  },
  subContainer: {
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  title: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  headerRight: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  hederLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  notifCircle: {
    backgroundColor: 'red',
    height: 15,
    width: 15,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 20,
    top: 5
  },
  nameHeader: {
    color: Colors.white,
    fontFamily: "Inter-Medium",
    fontSize: 9,
    fontWeight: "500",
  },
  bellIconButton: { padding: 10, marginLeft: 20 },
  icon: { tintColor: Colors.white, height: 25, width: 25 },
});
