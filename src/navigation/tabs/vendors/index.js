import React, { useState, useEffect } from "react";
import {
  Text,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  RefreshControl,
  FlatList,
} from "react-native";
import AssetImages from "~assets";
import AuthenticationContainer from "~components/AuthenticationContainer";
import SimpleHeader from "~components/SimpleHeader";
import TextInput from "~components/TextInput";
import Colors from "~utils/Colors";
import { getAllVendors } from "~utils/Network/api";
import { useSelector } from "react-redux";
import LoadingOverlay from "~components/LoadingOverlay";

export default ({ navigation }) => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [vendorsCopy, setVendorsCopy] = useState([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const user = useSelector((state) => state?.authUser?.authUser);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      if (user?.token?.access) {
        getVendors();
      }
    });
    return unsubscribe;
  }, []);


  const getVendors = (name) => {
    setLoading(true);
    getAllVendors(user?.token?.access, name)
      .then((res) => {
        setVendors(res?.data?.data);
        setVendorsCopy(res?.data?.data);
        setLoading(false);
        setRefreshing(false);
      })
      .catch((error) => {
        setLoading(false);
        setRefreshing(false);
      });
  };
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getVendors();
  }, []);

  const gotoVendorDetails = (item) => {
    navigation.navigate("venderDetail", { vendorDetails: item });
  };

  useEffect(() => {
    searchVendors(search);
  }, [search]);

  const searchVendors = (text) => {
    setSearch(text)
    if (text){
      const vendorsData = JSON.parse(JSON.stringify(vendorsCopy));
      const searchedVendors = vendorsData?.filter((vendor) => {
        return vendor?.full_name.toLowerCase().includes(text.toLowerCase())
      })
      setVendors(searchedVendors)
    } else {
      setVendors(vendorsCopy)
    }
  };

  const renderItem = (item) => (
    <TouchableOpacity
      onPress={() => gotoVendorDetails(item?.item)}
      style={styles.vendor}
    >
      <View style={styles.rowText}>
        <Text style={[styles.title, { color: Colors.white, fontSize: 15 }]}>
          {item?.item?.full_name}
        </Text>
        <Text style={styles.title}>{item?.item?.email}</Text>
      </View>
      <Image source={AssetImages.forward} style={styles.forwardImage} />
    </TouchableOpacity>
  );

  return (
    <>
        <AuthenticationContainer>
          <SimpleHeader
            headerLabel={"Vendors"}
            backgroundColor={Colors.inputBackgroundColor}
          />
          <View style={styles.container}>
            {loading ? <LoadingOverlay /> : (
            <>
            <TextInput
              onChangeText={(text) => searchVendors(text)}
              value={search}
              underlineColorAndroid="transparent"
              placeholder="Search"
              leftIcon={AssetImages.search}
            />
            {vendors?.length > 0 ? (
              <FlatList
                horizontal={false}
                data={vendors}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                style={styles.cardcontainer}
                contentContainerStyle={{ paddingBottom: 60 }}
                keyExtractor={(item, index) => {
                  item?.unit_number;
                }}
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
              />
            ) : (search ? (
              <View style={styles.emptyView}>
                <Text style={styles.notFoundHeader}>No results found</Text>
              </View>
            ) : (
                  <View style={styles.emptyView}>
                    <Text style={styles.notFoundHeader}>No vendor has been added yet</Text>
                  </View>
            ))}
            </>
            )}
          </View>
        </AuthenticationContainer>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundColor,
    width: "100%",
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  cardcontainer: {
    overflow: "hidden",
    flex: 1,
  },
  emptyView: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  notFoundHeader: {
    fontFamily: "Inter",
    fontWeight: "600",
    color: Colors.grayFont,
    fontSize: 15,
  },
  rowText: {
    width: "100%",
    marginTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderBottomColor,
  },
  title: {
    fontFamily: "Inter",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 20,
    color: Colors.grayFont,
    fontFamily: "Inter",
    lineHeight: 20,
  },
  forwardImage: {
    height: 14,
    width: 14,
    marginLeft: -20,
    tintColor: Colors.grayFont,
  },
  vendor: { flexDirection: "row", alignItems: "center" },
});
