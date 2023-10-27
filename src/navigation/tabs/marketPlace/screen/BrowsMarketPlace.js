import React, { useState, useEffect, useCallback } from "react";
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  BackHandler,
} from "react-native";
import SimpleHeader from "~components/SimpleHeader";
import LoadingOverlay from "~components/LoadingOverlay";
import TextInput from "~components/TextInput";
import Colors from "~utils/Colors";
import AssetImages from "~assets";
import { useSelector } from "react-redux";
import { availableCampusCall } from "~utils/Network/api";
import NetInfo from "@react-native-community/netinfo";
import InternetModal from "~components/InternetModal";
import CustomModal from "~components/CustomModal";
export default ({ navigation, route }) => {
  const [search, setSearch] = useState("");
  const [network, setNetwork] = useState(false);
  const [filteredDataSource, setFilteredDataSource] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [masterDataSource, setMasterDataSource] = useState([]);
  const [selectedItem, setSelectedItems] = useState();
  const [loading, setLoading] = useState(false);
  const [emptyCampus, setEmptyCampus] = useState(false);

  const user = useSelector((state) => state?.authUser?.authUser);
  const getAllCampus = async () => {
    setLoading(true);
    await availableCampusCall()
      .then((res) => {
        if (res?.data?.data) {
          setFilteredDataSource(res?.data?.data);
          setMasterDataSource(res?.data?.data);
        }
      })
      .catch((error) => {
        console.log("Error", error);
      });
    setLoading(false);
  };

  const gotoMarketPlaceScreen = (item, selectedBuy) => {
    setShowModal(false);
    navigation.navigate("marketplace", { campus: item, buyUnit: selectedBuy });
  };

  const gotoBack = () => {
    if (user) {
      navigation.navigate("tabs", { screen: "MyUnits" });
      return true;
    } else if (!user) {
      navigation.navigate("map");
      return true;
    }
    return false
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", getCampuses);
    return unsubscribe;
  }, []);

  const getCampuses = () => {
    setNetwork(false);
    NetInfo.fetch().then((state) => {
      if (state.isConnected) {
        getAllCampus();
      } else {
        setNetwork(true);
      }
    });
  }

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", gotoBack);
    return () => {
      BackHandler.removeEventListener("hardwareBackPress", gotoBack);
    };
  }, []);

  const reTry = () => {
    setNetwork(false);
    getCampuses();
  };

  const selectUnitType = (item) => {
    setShowModal(true);
    setSelectedItems(item);
  };

  const selectedBuyUnit = () => {
    setShowModal(false);
    gotoMarketPlaceScreen(selectedItem, true);
  };
  const selectedLeaseUnit = () => {
    setShowModal(false);
    gotoMarketPlaceScreen(selectedItem, false);
  };
  const selectBuyUnitOrLeaseUnit = (item, value) => {
    setShowModal(false);
    gotoMarketPlaceScreen(item, value);
  };

  useEffect(() => {
    searchFilterFunction(search);
  }, [search]);

  const searchFilterFunction = (text) => {
    setSearch(text);
    if (text) {
      const masterDataSourceCopy = JSON.parse(JSON.stringify(masterDataSource));
      const searchData = masterDataSourceCopy?.filter((item) => {
        const searchCampus = item?.campus?.filter((campus) => {
          const capitalCampusName = campus?.name.toUpperCase();
          const capitalInputText = text && text.toUpperCase();
          return capitalCampusName.includes(capitalInputText);
        });
        return (item.campus = searchCampus.length ? searchCampus : "" );
      });
      setFilteredDataSource(searchData);
      const empty = filteredDataSource.every(
        (zone) => zone?.campus?.length === 0
      );
      setEmptyCampus(empty);
    } else {
      setFilteredDataSource(masterDataSource);
      setEmptyCampus(false);
    }
  };

  const ItemView = ({ item, index }) => {
    return (
      <View>
        <View
          style={{
            marginTop: index == 0 ? 0 : 26,
            borderBottomColor: Colors.borderBottomColor,
            borderBottomWidth: 1,
            paddingBottom: 8,
          }}
        >
          <Text style={styles.zoneText}>{item?.code}</Text>
        </View>
        {item?.campus?.map((item, index) => (
          <TouchableOpacity
            key={`${index}`}
            onPress={() => {
              route?.params?.buyUnit === true
                ? selectBuyUnitOrLeaseUnit(item, true)
                : route?.params?.buyUnit === false
                ? selectBuyUnitOrLeaseUnit(item, false)
                : selectUnitType(item);
            }}
          >
            <View style={styles.campusName}>
              <Text style={styles.capmpusText}>{item?.name}</Text>
              <View style={{ marginRight: 10 }}>
                <Image source={AssetImages.forward} style={styles.icon} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderNotFound = (value) => {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>{value}</Text>
      </View>
    );
  };

  return (
    <>
    <View style={{ flex: 1 }}>
        <>
      <SimpleHeader
        headerLabel={"Select Campus"}
        backgroundColor={Colors.inputBackgroundColor}
        backIcon={true}
        onPress={gotoBack}
      />
      <View style={styles.container}>
        <TextInput
          onChangeText={(text) => searchFilterFunction(text)}
          value={search}
          underlineColorAndroid="transparent"
          placeholder="Search"
          leftIcon={AssetImages.search}
          />
          {loading ? <LoadingOverlay /> : (
        <View style={styles.flatListContainer}>
          {filteredDataSource.length > 0 ? (
            emptyCampus === false ? (
              <FlatList
                data={filteredDataSource}
                keyExtractor={(item, index) => index.toString()}
                renderItem={ItemView}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              renderNotFound("No results are found against this search")
            )
          ) : (
              renderNotFound("No campuses have been added yet")
          )}
        </View>
        )}
      </View>
      <CustomModal
        isVisible={showModal}
        icon={AssetImages.questionMarkIcon}
        title={"Would you like to buy or lease a unit?"}
        secondaryButtonText={"Buy Unit"}
        primaryButtonText={"Lease Unit"}
        secondaryButtonOnPress={selectedBuyUnit}
        onPress={selectedLeaseUnit}
      />

      <InternetModal
        isVisible={network}
        icon={AssetImages.internet}
        title={"Internet Connection Issue"}
        des={"Please check your internet connection"}
        secondaryButtonText={"retry"}
        primaryButtonText={"close"}
        secondaryButtonOnPress={reTry}
        onPress={() => {
          gotoBack();
          setNetwork(false);
        }}
      />
      </>
      
    </View>
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundColor,
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  notFoundText: {
    fontSize: 18,
    color: "white"
  },
  zoneText: {
    color: Colors.primaryButtonBackgroundColor,
    fontFamily: "Inter",
    fontSize: 11,
    fontWeight: "500",
    lineHeight: 14,
  },
  flatListContainer: { flex: 1, padding: 5, marginTop: 20 },
  capmpusText: {
    color: Colors.white,
    lineHeight: 24,
    fontSize: 15,
    fontFamily: "Inter",
  },
  icon: {
    tintColor: Colors.grayFont,
    height: 16,
    width: 16,
    left: 10,
  },
  campusName: {
    height: 40,
    borderBottomColor: Colors.borderBottomColor,
    borderBottomWidth: 1,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
  },
});
