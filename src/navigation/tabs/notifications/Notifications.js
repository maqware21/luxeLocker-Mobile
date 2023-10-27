import React, { useEffect, useState, useCallback } from "react";
import {
  Text,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import Colors from "~utils/Colors";
import AssetImages from "~assets";
import SimpleHeader from "~components/SimpleHeader";
import { CommonActions } from "@react-navigation/native";
import { Swipeable } from "react-native-gesture-handler";
import Styles from "~utils/Style/Styles";
import moment from "moment";
import { fetchNotifications } from "~utils/Network/api";
import { useSelector } from "react-redux";
import LoadingOverlay from "~components/LoadingOverlay";
import ReadMore from "@fawazahmed/react-native-read-more";

export default ({ navigation }) => {
  const user = useSelector((state) => state?.authUser?.authUser);
  const [loading, setLoading] = useState(false);
  const [readLoading, setReadLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [disableMarkAllRead, setDisableMarkAllRead] = useState(false);
  const [notificationData, setNotificationData] = useState([]);

  useEffect(() => {
    // For Fetching Listing
    notificationsCall({}, true);
  }, []);

  const notificationsCall = async (payload, loading) => {
    loading && setLoading(true) 
    await fetchNotifications(user?.token?.access, payload)
      .then((res) => {
        if (Array.isArray(res?.data?.data)) {
          setNotificationData(res?.data?.data);
        }
        fetchNotificationsCount();
      })
      .catch((error) => {
        console.log("error", error);
      });
      setLoading(false);
      setReadLoading(false);
      setRefreshing(false)
  };

  const fetchNotificationsCount = async () => {
    const payload = {
      operation_type: "count",
    };
    await fetchNotifications(user?.token?.access, payload)
      .then((res) => {
        if (res?.data?.data?.[0]?.notification_count === 0) {
          setDisableMarkAllRead(true);
        }
      })
      .catch((error) => {
        console.log("error:", error);
      });
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // For Fetching Listing
    notificationsCall({}, false);
    setRefreshing(false);
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
  
  const RightActions = (progress, dragX, item, id) => {
    const scale = dragX.interpolate({
      inputRange: [-50, 0],
      outputRange: [0.7, 0],
    });

    const readItemHandler = async (id) => {
      setReadLoading(true);
      setRefreshing(true);
      // For marking notification as read
      const payload = {
        operation_type: "is_read",
        notif_id: id,
      };
      await notificationsCall(payload, true);
      // For Fetching Listing
      notificationsCall({}, true);
    };

    return (
      <TouchableOpacity
        onPress={() => (!item?.is_read ? readItemHandler(id) : null)}
        style={{
          width: "20%"
        }}
      >
        <View
          style={styles.readNotifications}
        >
          {!readLoading ? (
            <Text style={styles.readText}>Read</Text>
          ) : (
            <ActivityIndicator size="small" color={Colors.white} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const ItemView = ({ item, index }) => {
    const time = moment(item?.created_at).fromNow();
    return (
        <Swipeable
          renderRightActions={(progress, dragX) =>
          !item?.is_read ? RightActions(progress, dragX, item, item.id) : null
          }
          containerStyle={{ marginTop: index !== 0 ? 12 : 0 }}
        >
          <View
            style={[
              styles.cardContainer,
              {
                borderLeftColor: !item?.is_read
                  ? Colors.primaryButtonBackgroundColor
                  : null,
                borderLeftWidth: !item?.is_read ? 8 : 0,
              },
            ]}
          >
            <View
              style={styles.notificationHeader}
            >
              <Text
                style={[Styles.nameHeader, { lineHeight: 0, width: "65%" }]}
              >
                {item?.title}
              </Text>
              <Text
                style={[
                  Styles.description,
                  {fontSize: 11, marginRight: 8 },
                ]}
              >
                {time}
              </Text>
            </View>

            <ReadMore
              numberOfLines={2}
              style={[Styles.description]}
              seeMoreStyle={{ color: Colors.primaryButtonBackgroundColor }}
              seeLessStyle={{ color: Colors.primaryButtonBackgroundColor }}
            >
              {item?.body}
            </ReadMore>
          </View>
        </Swipeable>
    );
  };
  const EmptyView = () => {
    return (
      <>
        {!loading ? (
          <View style={styles.emptyListContainer}>
            <Image
              style={{
                height: 200,
                width: 200,
              }}
              resizeMode="contain"
              source={AssetImages.notificationPlaceholder}
            />
            <Text style={styles.emptyText}>
              There are No New Notifications.
            </Text>
          </View>
        ) : (
          <></>
        )}
      </>
    );
  };
  const readAllItemHandler = async () => {
    setReadLoading(true);
    // For marking notification as read
    const payload = {
      operation_type: "is_read",
      notif_id: "all",
    };
    await notificationsCall(payload, true);
    // For Fetching Listing
    notificationsCall({}, true);
  };

  return (
    <>
        <View style={{ flex: 1, backgroundColor: Colors.backgroundColor }}>
          <SimpleHeader
            fromNotifications
            headerLabel={"Notifications"}
            backgroundColor={Colors.inputBackgroundColor}
            navigation={navigation}
            onPress={gotoBack}
            onMarkAllReadPress={readAllItemHandler}
            disableMarkAllRead={disableMarkAllRead}
            />
            {loading ? <LoadingOverlay /> : (
              <View style={styles.container}>
            <FlatList
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 30 }}
              data={notificationData}
              keyExtractor={(item) => item.id.toString()}
              renderItem={ItemView}
              ListEmptyComponent={EmptyView}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          </View>
      )}
        </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 14,
    paddingTop: 20,
  },
  emptyListContainer: {
    marginTop: "45%",
    alignItems: "center",
  },
  emptyText: {
    color: Colors.grayFont,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
  cardContainer: {
    flexDirection: "column",
    justifyContent: "center",
    padding: 10,
    width: "100%",
    backgroundColor: Colors.inputBackgroundColor,
    borderRadius: 8,
  },
  readText: {
    fontFamily: "Inter-Medium",
    fontSize: 13,
    color: Colors.white,
    textAlign: "center"
  },
  readNotifications: {
    flex: 1,
    backgroundColor: Colors.statusColor,
    justifyContent: "center",
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  notificationHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
});
