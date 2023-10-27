import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  BackHandler,
} from "react-native";
import PrimaryButton from "~components/PrimaryButton";
import SimpleHeader from "~components/SimpleHeader";
import Colors from "~utils/Colors";
import Constant from "~utils/Constant.json";
import { fetchUnitLength } from "~utils/Network/api";
import LoadingOverlay from "~components/LoadingOverlay";

export default ({ navigation, route }) => {
  const [selectedItems, setSelectedItems] = useState(route?.params?.selectedItemsList ? route?.params?.selectedItemsList : []);
  const [selectedItemsList, setSelectedItemsList] = useState(route?.params?.itemsList ? route?.params?.itemsList : []);
  const [sum, setSum] = useState(0);
  const [filter, setFilter] = useState([]);
  const [dataUpdated, setDataUpdated] = useState(false);
  const [loading, setLoading] = useState(false);

  const gotoBack = async () => {
    !selectedItemsList?.length && await route?.params?.handleItemsList(selectedItemsList, selectedItems);
    navigation.navigate("marketplace", { 
      campus: route?.params?.campus, 
      buyUnit: route?.params?.selectedBuyUnit,
    });
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", gotoBack);
    return () => {
      BackHandler.removeEventListener("hardwareBackPress", gotoBack);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetchUnitLength(route?.params?.campus?.id);
        const data = response?.data?.data?.lengths || [];
        const tempArray = data?.map((item, index) => ({
          isSelect: false,
          name: Number(item?.u_length),
          count: Number(route?.params?.selectedBuyUnit ? item?.for_buy : item?.for_lease),
          id: index + 1,
        }));

        let sortedArray = tempArray.sort((a, b) => b.name - a.name)
        calculateSum(sortedArray);
        setFilter(sortedArray);
        setDataUpdated(true);
        setLoading(false)
      } catch (error) {
        console.log("Error:", error);
      }
    };

    const calculateSum = (sortedArray) => {
      const selectedItemsSet = new Set(route?.params?.selectedItemsList);
      const selectedLengths = sortedArray?.filter((length) => selectedItemsSet?.has(length.id));
      const sum = selectedLengths?.reduce((acc, length) => acc + length?.count, 0);
      setSum(sum)
    };

    const unsubscribe = navigation.addListener("focus", async () => {
      await fetchData();
    });

    return unsubscribe;
    
  }, []);

  const selectItem = (item) => {
    const isSelected = selectedItems.includes(item.id);
    if (isSelected) {
      setSelectedItems(selectedItems?.filter((i) => i !== item.id));
      setSum(sum - item.count);
      setSelectedItemsList(selectedItemsList?.filter((itemCount) => itemCount !== item?.name));
    } else {
      setSelectedItems([...selectedItems, item?.id]);
      setSum(sum + item?.count);
      setSelectedItemsList([...selectedItemsList, item?.name]);
    }
  };

  // Reset Filters
  const resetFilter = () => {
    setSelectedItems([]);
    setSelectedItemsList([]);
    setSum(0);
  }

  const filterUnits = async () => {
    await route?.params?.handleItemsList(selectedItemsList, selectedItems);
    gotoBack();
  };

  const renderItem = filter?.map((item, index) => {
    let width = Number((200 / index + 2).toFixed(0));

    return (
      <View key={index}>
      <TouchableOpacity
        onPress={() => {
          selectItem(item);
        }}
        style={[
          styles.item,
          { width: index == 0 ? 300 : width },
          selectedItems.includes(item?.id) && styles.selectedItem,
        ]}
      >
        <Text
          style={[
            styles.filterText,
            selectedItems.includes(item?.id) && {color: Colors.black},
          ]}
        >
          {item?.name >= 65 ? `65 +` : `${item?.name}`}
        </Text>
      </TouchableOpacity>
      </View>
    );
  });
  return (
    <View style={{flex: 1, backgroundColor: Colors.backgroundColor}}>
      <SimpleHeader
        headerLabel={Constant.FilterScreen.title}
        backIcon={true}
        rightText={Constant.FilterScreen.rightText}
        RightIcon={true}
        rightIconOnPress={resetFilter}
        onPress={gotoBack}
      />
      {loading ? <LoadingOverlay /> : (
        <View style={styles.filterScreenContainer}>
          <View style={{ padding: 16 }}>
          <Text style={styles.lengthText}>
          {Constant.FilterScreen.selectLength}
        </Text>
          <ScrollView 
          style={{marginBottom: 100}}
          showsVerticalScrollIndicator={false}
          >
              {renderItem}
          </ScrollView>
        </View>
          <View style={styles.btnOuterContainer}>
        <View
            style={styles.btnInnerContainer}
          >
          <PrimaryButton 
            label={!selectedItems?.length ? "Filter" : `Show ${sum} results`} 
        onPress={filterUnits} 
            disabled = {!selectedItems?.length}
          />
        </View>
      </View>
    </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.inputBackgroundColor,
    width: "100%",
    height: "10%",
    flexDirection: "column",
    flex: 1,
  },
  selected: { backgroundColor: Colors.primaryButtonBackgroundColor },
  filterScreenContainer: { 
    position: "relative", 
    width: "100%", 
    flex: 1, 
    justifyContent: "space-between" 
  },
  lengthText: { 
    color: "white", 
    marginBottom: 15, 
    fontSize: 15 
  },
  btnOuterContainer: { 
    position: "absolute", 
    bottom: 0, 
    width: "100%", 
    flexDirection: "row", 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: Colors.backgroundColor 
  },
  btnInnerContainer: { marginVertical: 20, width: "90%" },
  list: {
    marginTop: 20,
    backgroundColor: "red",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    width: "40%",
  },
  filterText: {
    color: Colors.grayFont,
    fontFamily: "Inter",
    fontSize: 12,
    lineHeight: 14,
  },
  item: {
    flex: 1,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    marginVertical: 10,
    backgroundColor: Colors.inputBackgroundColor,
  },
  selectedItem: {
    backgroundColor: Colors.primaryButtonBackgroundColor,
  },
});
