import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
  Platform,
  BackHandler,
} from "react-native";
import Colors from "~utils/Colors";
import Header from "~components/Header";
import { SafeAreaView } from "react-native-safe-area-context";
import AssetImages from "~assets";
import TextInput from "~components/TextInput";
import TopTabs from "~components/TopTabs";
import { useSelector } from "react-redux";
import {
  fetchAllUnitCall,
  fetchAllForVendor,
  fetchNotifications,
} from "~utils/Network/api";
import LoadingOverlay from "~components/LoadingOverlay";
import { FlatList } from "react-native-gesture-handler";
import RBSheet from "react-native-raw-bottom-sheet";
import Separator from "~components/Separator";

export default ({ navigation, route }) => {
  const [search, setSearch] = useState("");
  const [selectedBuyUnit, setSelectedBuyUnit] = useState(
    route?.params?.isBuy ? route?.params?.isBuy : true
  );
  const user = useSelector((state) => state?.authUser?.authUser);
  const [dataSource, setDataSource] = useState({});
  const [loading, setLoading] = useState(false);
  const scroll = useRef();
  const [refreshing, setRefreshing] = useState(false);

  const [signUpMethods, setSignUpMethods] = useState([
    {
      id: 1,
      name: "Purchase",
      image: AssetImages.buyIcon,
      type: "qr",
    },
    {
      id: 2,
      name: "Lease",
      type: "manually",
      image: AssetImages.leaseIcon,
    },
  ]);
  const [notifCount, setNotifCount] = useState(0);

  const openBottomSheet = () => {
    scroll.current.open();
  };

  const gotoNotificationsScreen = () => {
    navigation.navigate("notifications");
  };

  const fetchNotificationsCount = async () => {
    const payload = {
      operation_type: "count",
    };
    await fetchNotifications(user?.token?.access, payload)
      .then((res) => {
        setNotifCount(res?.data?.data?.[0]?.notification_count);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  useEffect(() => {
    fetchAllUnitHandler();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllUnitHandler();
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      if (user?.token?.access) {
        fetchAllUnitHandler();
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        BackHandler.exitApp();
        return true;
      }
    );

    return () => backHandler.remove();
  }, []);

  const goToUnitDetail = (item) => {
    navigation.navigate("ownedUnitDetail", {
      unit: item,
      fromBuy: selectedBuyUnit,
    });
  };
  const goToQrCodeScreen = () => {
    navigation.navigate("storageAccess", { qr: true });
  };

  const fetchAllUnitHandler = async () => {
    setLoading(true);
    fetchNotificationsCount();
    if (user?.first_login == null) {
      await fetchAllUnitCall(user?.token?.access)
        .then((res) => {
          setLoading(false);
          if (res?.data?.data) {
            //  Start Merging Pending State Units intoo Ownned Untis
            const data = JSON.parse(JSON.stringify(res.data.data));
            const owned = data?.owned;
            {
              React.Children.toArray(
                data.pending_units?.map((item) => {
                  return (item.pending = true);
                })
              );
            }
            data.owned = [...owned, ...data.pending_units];
            //  End Merging Pending State Units intoo Ownned Untis
            setDataSource(data);
          }
          setRefreshing(false);
        })
        .catch((error) => {
          setLoading(false);
        });
    } else {
      await fetchAllForVendor(user?.token?.access)
        .then((res) => {
          setLoading(false);
          if (res?.data?.data) {
            setDataSource(res.data.data);
          }
          setRefreshing(false);
        })
        .catch((error) => {
          setLoading(false);
        });
    }
  };
  const SelectedOwenTab = () => {
    setSelectedBuyUnit(true);
    setSearch("");
  };
  const SelectedLeaseTab = () => {
    setSelectedBuyUnit(false);
    setSearch("");
  };

  const filteredDataSource =
    user?.first_login !== null
      ? dataSource
      : dataSource[selectedBuyUnit ? "owned" : "leased"]?.filter((el) =>
          el.unit_number.toLowerCase().includes(search.toLowerCase())
        );

  const gotoMarketingPlaceScreen = (buyUnit) => {
    scroll.current.close();

    navigation.navigate("browsMarketPlace", { buyUnit: buyUnit });
  };

  const gotoInsuranceScreen = (item) => {
    navigation.navigate("insuranceScreen", {
      unitId: item?.unit_id,
      unit: item,
      isProfileCompleted: user?.is_profile_completed,
      buyUnit: true,
    });
  };
  const gotoCardInfoScreen = (item) => {
    navigation.navigate("cardInfo", { unitId: item?.unit_id });
  };

  const onUnitPress = (item) => {
    if (item?.profile_stage === "insurance") {
      gotoInsuranceScreen(item);
    } else if (item?.profile_stage === "stripe") {
      gotoCardInfoScreen(item);
    } else {
      goToUnitDetail(item);
    }
  };

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      style={
        item?.pending && item?.profile_stage === "sales_mate"
          ? [styles.itemContainer, { opacity: 0.5 }]
          : styles.itemContainer
      }
      onPress={() => onUnitPress(item)}
      disabled={
        item?.pending && item?.profile_stage === "sales_mate"
          ? item?.pending
          : false
      }
      delayPressIn={70}
    >
      <View style={{ backgroundColor: Colors.backgroundColor }}>
        <Image source={AssetImages.singleUnit} style={styles.unitImage} />
        <Text style={styles.unitName}>{` Unit ${item?.unit_number}`}</Text>
        {item?.pending && item?.profile_stage === "sales_mate" && (
          <Text style={styles?.pendingTag}>Pending Response</Text>
        )}
        {item?.pending && item?.profile_stage === "insurance" && (
          <Text style={styles?.pendingTag}>Pending Documents Verification</Text>
        )}
        {item?.pending && item?.profile_stage === "stripe" && (
          <Text style={styles?.pendingTag}>Pending Documents Verification</Text>
        )}
        <View style={styles.unitProperity}>
          <Text style={styles.unitText}>
            {`${
              user?.first_login === null
                ? item?.unit_dimentions?.length
                : item?.length
            } ft x ${
              user?.first_login === null
                ? item?.unit_dimentions?.width
                : item?.width
            } ft.`}
          </Text>
          <Text style={styles.unitLocation}>{item?.unit_location}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <View style={styles.container}>
        <SafeAreaView style={styles.safeAreaView} />
        <View style={styles.headerContainer}>
          <Header
            rightIconPress={goToQrCodeScreen}
            plusIconPress={openBottomSheet}
            bellIconPress={gotoNotificationsScreen}
            checkuserPermission={user?.first_logn}
            notificationCount={notifCount}
          />
          <View>
            {user?.first_login == null ? (
              <TopTabs
                selectedBuyUnited={selectedBuyUnit}
                SelectedOwenTab={SelectedOwenTab}
                SelectedLeaseTab={SelectedLeaseTab}
                leaseTitle={"Leased"}
                buyTitle={"Owned"}
              />
            ) : null}
          </View>
        </View>

        <View style={styles.bodyContainer}>
          <TextInput
            onChangeText={(text) => setSearch(text)}
            value={search}
            underlineColorAndroid="transparent"
            placeholder="Search"
            leftIcon={AssetImages.search}
          />
          {loading ? (
            <LoadingOverlay />
          ) : (
            <View style={styles.listContainer}>
              {filteredDataSource && filteredDataSource?.length > 0 ? (
                <FlatList
                  horizontal={false}
                  data={filteredDataSource}
                  renderItem={renderItem}
                  style={Platform.OS == "ios" ? styles.cardcontainer : null}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 60 }}
                  keyExtractor={(item, index) => {
                    item.unit_number;
                  }}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                    />
                  }
                />
              ) : selectedBuyUnit &&
                filteredDataSource &&
                filteredDataSource?.length < 1 ? (
                <View style={styles.emptyView}>
                  <Text style={styles.notFoundHeader}>No Unit Found</Text>
                </View>
              ) : !selectedBuyUnit &&
                filteredDataSource &&
                filteredDataSource?.length < 1 ? (
                <View style={styles.emptyView}>
                  <Text style={styles.notFoundHeader}>No Unit Found</Text>
                </View>
              ) : null}
            </View>
          )}
        </View>

        <RBSheet
          ref={scroll}
          openDuration={250}
          customStyles={{
            container: {
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              height: 180,
            },
          }}
        >
          <View style={styles.contentContainer}>
            <Text style={styles.createAccount}>{"Add Another Unit"}</Text>
            <Separator height={20} />
            <View style={styles.boder} />

            {signUpMethods.map((item, index) => (
              <View key={`${index}`} style={{ width: "95%" }}>
                <TouchableOpacity
                  onPress={() =>
                    item?.name == "Purchase"
                      ? gotoMarketingPlaceScreen(true)
                      : gotoMarketingPlaceScreen(false)
                  }
                  style={[
                    styles.bottomSheetButton,
                    { borderBottomWidth: index == 0 ? 0.3 : 0 },
                  ]}
                >
                  <View style={styles.bottomSheetButtonContainer}>
                    <Image
                      style={styles.bottomSheetIcon}
                      source={item?.image}
                    />
                    <Text style={styles.itemText}>{item?.name}</Text>
                  </View>
                  <Image
                    style={styles.bottomSheetForwardIcon}
                    source={AssetImages.forward}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </RBSheet>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundColor,
    width: "100%",
    flex: 1,
  },
  listContainer: {
    marginTop: 10,
    flex: 1,
    height: "100%",
    width: "100%",
    paddingBottom: 30,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#1B1B23",
    paddingTop: 10,
  },
  unitText: {
    color: Colors.grayFont,
    fontSize: 16,
    fontWeight: "500",
    marginTop: 10,
  },
  itemContainer: { margin: 5, flex: 1, marginBottom: 10 },
  notFoundHeader: {
    fontFamily: "Inter",
    fontWeight: "600",
    color: Colors.grayFont,
    fontSize: 15,
  },
  emptyView: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  unitProperity: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  unitImage: { height: 250, borderRadius: 10, width: "100%" },
  cardcontainer: {
    overflow: "hidden",
    flex: 1,
    marginBottom: 100,
  },
  unitName: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: "600",
    marginTop: 20,
  },
  pendingTag: {
    color: Colors?.primaryButtonBackgroundColor,
    fontSize: 17,
    fontWeight: "600",
  },
  bodyContainer: {
    paddingRight: 10,
    paddingLeft: 10,
    height: "100%",
    paddingTop: 10,
  },
  unitLocation: {
    color: Colors.grayFont,
    fontSize: 16,
    fontWeight: "500",
    marginTop: 10,
  },
  headerContainer: {
    backgroundColor: Colors.inputBackgroundColor,
    paddingBottom: 10,
    marginTop: Platform.OS == "android" ? 20 : 0,
  },
  createAccount: {
    color: Colors.white,
    fontFamily: "Inter-Medium",
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 0,
  },
  safeAreaView: {
    backgroundColor: Colors.inputBackgroundColor,
    marginBottom: -20,
  },
  itemText: {
    color: Colors.white,
    fontFamily: "Inter-Medium",
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 0,
    marginLeft: 10,
  },
  bottomSheetButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 0.3,
    borderColor: Colors.grayFont,
    padding: 20,
    alignItems: "center",
  },
  bottomSheetButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomSheetIcon: {
    tintColor: Colors.primaryButtonBackgroundColor,
    height: 24,
    width: 24,
  },
  bottomSheetForwardIcon: { tintColor: Colors.grayFont, height: 20, width: 20 },
  boder: {
    borderBottomWidth: 0.3,
    borderBottomColor: Colors.grayFont,
    width: "100%",
  },
});
