import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import AssetImages from "~assets";
import Colors from "~utils/Colors";

export default ({
  headerLabel,
  onPress,
  backgroundColor,
  backIcon,
  RightIcon,
  navigation,
  rightText,
  rightIcon,
  rightIconOnPress,
  settings,
  settingsPress,
  isOwnedUnit,
  fromNotifications,
  onMarkAllReadPress,
  notificationCount,
  disableMarkAllRead
}) => {

  const handleRightIconClick = rightIconOnPress && rightIconOnPress

  return (
    <SafeAreaView
      style={styles.headerContainer}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: backgroundColor && backgroundColor,
            justifyContent: fromNotifications ? "flex-start" : "space-between",
          }
        ]}>
        {backIcon ? (
          <TouchableOpacity onPress={onPress && onPress}>
            <View
            style={styles.backIcon}
            >
            <Image
              source={AssetImages.back}
              style={styles.backImg}
            />
            </View>
          </TouchableOpacity>
        ) : fromNotifications ? (
          <TouchableOpacity onPress={onPress && onPress}>
              <View
                style={styles.backIcon}
              >
            <Image
              source={AssetImages.closeIcon}
              style={styles.backImg}
            />
            </View>
          </TouchableOpacity>
        ) : (
          <View style={{ height: 20, width: 20 }}></View>
        )}
        <View>
          <Text style={styles.title}>{headerLabel}</Text>
        </View>
        <View style={[{ flexDirection: "row" }, (fromNotifications && { flex: 1, justifyContent: 'flex-end' })]}>
          {RightIcon ? (
            <TouchableOpacity onPress={handleRightIconClick}>
              {rightText ? (
                <Text style={styles.rightText}>{rightText}</Text>
              ) : (<>
                <Image
                  source={rightIcon}
                  style={{
                    tintColor: Colors.white,
                    height: 25,
                    width: 25,
                    marginRight: isOwnedUnit ? 20 : 0,
                  }}
                />
                {(notificationCount && notificationCount > 0) ? (
                  <View style={styles.notifCircle}>
                    <Text style={styles.nameHeader}>
                      {notificationCount}
                    </Text>
                  </View>
                ) : null}
              </>)}
            </TouchableOpacity>
          ) : (
            <View style={{ height: 20, width: 20 }}></View>
          )}
          {isOwnedUnit && settings ? (
            <TouchableOpacity onPress={() => settingsPress()}>
              <Image
                source={settings}
                style={{ tintColor: Colors.white, height: 25, width: 25 }}
              />
            </TouchableOpacity>
          ) : null}
          {fromNotifications ? (
            <TouchableOpacity
              disabled={disableMarkAllRead}
              onPress={() => onMarkAllReadPress()}>
              <Text style={[styles.rightText, { fontSize: 11, color: disableMarkAllRead ? Colors.grayFont : Colors.white }]}>
                Mark All as Read
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingLeft: 16,
    paddingRight: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: "500",
    padding: 20,
    textAlign: "center",
    fontFamily: "Inter-Medium",
    justifyContent: "center",
  },
  rightText: {
    fontFamily: "Inter",
    fontWeight: "500",
    textAlign: "right",
    lineHeight: 24,
    color: Colors.primaryButtonBackgroundColor,
  },
  notifCircle: {
    backgroundColor: 'red',
    height: 15,
    width: 15,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 10
  },
  nameHeader: {
    color: Colors.white,
    fontFamily: "Inter-Medium",
    fontSize: 9,
    fontWeight: "500",
  },
  icon: { tintColor: Colors.white, height: 20, width: 20 },
  headerContainer: {
    backgroundColor: Colors.backgroundColor,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  backImg: {
    tintColor: Colors.white,
    height: 20,
    width: 20,
    alignItems: "center",
  },
});
