import React, { useState, useEffect } from "react";
import {
  Text,
  Alert,
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import Colors from "~utils/Colors";

export default ({
  navigation,
  item,
  index,
  buyUnit,
}) => {
  const [leaseUnits, setLeaseUnit] = useState([]);
  const [buyUnits, setBuyUnit] = useState([]);

  const goToUnitDetailScreen = (item) => {
    navigation.navigate("unitDetailScreen", {
      unit: item,
      buyUnit: buyUnit,
    });
  };

  useEffect(() => {
    if (item?.units?.length > 0 && !buyUnit) {
      const leaseUnits = item?.units?.filter((unit) => !unit?.buy_rate);
      setLeaseUnit(leaseUnits);
    }
    if (item?.units?.length > 0 && buyUnit) {
      const BuyUnits = item?.units?.filter((unit) => unit?.buy_rate);
      setBuyUnit(BuyUnits);
    }
  }, [buyUnit]);

  const renderLeaseUnit = !buyUnit &&
    leaseUnits?.map((item, index) => {
      const gotoLeaseUnitDetail = () => {
        if(item?.is_available){
          goToUnitDetailScreen(item)
        } else {
          Alert.alert("Sorry Unit is not available ")
        }
      }
      return (
      <View key={`${index}`} style={{ alignItems: "center" }}>
        <TouchableOpacity
            onPress={gotoLeaseUnitDetail}
          style={[
            styles.boxContainer,
            {
              backgroundColor: item.is_available
                ? Colors.primaryButtonBackgroundColor
                : Colors.grayFont,
              width: item.width + 5,
              height: item.length,
              alignItems: "center",
              justifyContent: "center",
            },
          ]}
        >
          <View>
            <Text
              style={styles.unitNumber}
            >
                {`${item?.width}\n${"X"}\n${item?.length}`}
            </Text>
          </View>
        </TouchableOpacity>
        <Text
          style={styles.itemNumber}
        >
            {item?.unit_number}
        </Text>
      </View>
      )
})

  const renderBuyunit = buyUnit &&
    buyUnits?.map((item, index) => {
      const gotoBuyUnitDetail = () => {
        if (item?.is_available) {
          goToUnitDetailScreen(item)
        } else {
          Alert.alert("Sorry Unit is not available ")
        }
      }

      return (
      <View style={{ alignItems: "center" }} key={`${index}`}>
        <TouchableOpacity
            onPress={gotoBuyUnitDetail}
          style={[
            styles.boxContainer,
            {
              backgroundColor: item.is_available
                ? Colors.primaryButtonBackgroundColor
                : Colors.grayFont,
              width: item.width + 5,
              height: item.length,
              alignItems: "center",
              justifyContent: "center",
            },
          ]}
        >
          <View>
            <Text
              style={styles.unitNumber}
            >
                {`${item?.width}\n${"X"}\n${item?.length}`}
            </Text>
          </View>
        </TouchableOpacity>
        <Text
          style={styles.itemNumber}
        >
            {item?.unit_number}
        </Text>
      </View>
      )
    });

  const goToUnitDetail = () => {
    if (item?.is_available) {
      goToUnitDetailScreen(item);
    } else {
      Alert.alert('Sorry Unit is not available');
    }
  };


  return (
    <View>
      {index == 0 ? (
        <View style={styles.indexZero}>
          <ScrollView
            style={{ marginBottom: 10 }}
            scrollEnabled={false}
            horizontal={item?.numberOfRows === 1 ? true : false}
            showsHorizontalScrollIndicator={false}
          >
            {renderLeaseUnit}
            {renderBuyunit}
          </ScrollView>
          <Text
            numberOfLines={2}
            style={styles.buildingCText}
          >
            {"BUILDING C STANDARD"}
          </Text>
          <Text
            style={styles.exitText}
          >
            EXIT ONLY
          </Text>
        </View>
      ) : index == 1 ? (
        <View style={styles.indexOne}>
          <ScrollView
            style={{ marginBottom: 10 }}
            contentContainerStyle={{ alignItems: "center" }}
            horizontal={true}
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
          >
            <View style={styles.unitDetailContainer}>
              <TouchableOpacity
                style={[
                  styles.boxContainer,
                  styles.unitDetailBtn,
                ]}
                onPress={goToUnitDetail}
              >
                <Text
                    style={styles.unitNumber}
                >
                  {buyUnit
                    ? buyUnits[0]?.unit_number
                    : leaseUnits[0]?.unit_number}
                </Text>
              </TouchableOpacity>
            </View>

              <View style={styles.unitDetailContainer}>
              <TouchableOpacity
                style={[
                  styles.boxContainer,
                  styles.unitNumBtn,
                ]}
              >
                <Text
                    style={styles.unitNumber}
                >
                  {buyUnit
                    ? buyUnits[1]?.unit_number
                    : leaseUnits[1]?.unit_number}
                </Text>
              </TouchableOpacity>
            </View>
              {buyUnits?.length > 0 ? (
              <FlatList
                keyExtractor={(item, index) => `${index}`}
                horizontal={true}
                scrollEnabled={false}
                data={buyUnits}
                renderItem={({ item, index }) => (
                  <View>
                    {index !== 0 &&
                      index !== 1 &&
                      item?.unit_number !== "B 52" &&
                      item?.unit_number !== "B 53" ? (
                      <View style={{ alignItems: "center" }}>
                        <Text
                          style={styles.unitNumber}
                        >
                            {item?.unit_number}
                        </Text>
                        <TouchableOpacity
                          onPress={() =>
                              item?.is_available
                              ? goToUnitDetailScreen(item)
                              : Alert.alert("Sorry Unit is not available ")
                          }
                          style={[
                            styles.boxContainer,
                            {
                              backgroundColor: item.is_available
                                ? Colors.primaryButtonBackgroundColor
                                : Colors.grayFont,
                              width: item.width + 5,
                              height: item.length,
                              alignItems: "center",
                              justifyContent: "center",
                            },
                          ]}
                        >
                          <Text
                              style={styles.unitNumber}
                          >
                              {`${item?.width}\n${"X"}\n${item?.length}`}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : null}

                    {item?.topRight ? (
                      <View
                        style={[styles.itemTop, { top: 5 }]}
                      />
                    ) : null}
                    {item?.bottomRight ? (
                      <View
                        style={[styles.itemTop, { bottom: 0 }]}
                      />
                    ) : null}
                  </View>
                )}
              />
            ) : !buyUnit && leaseUnits.length > 0 ? (
              <FlatList
                keyExtractor={(item, index) => `${index}`}
                horizontal={true}
                scrollEnabled={false}
                data={leaseUnits}
                renderItem={({ item, index }) => (
                  <View>
                    {index !== 0 &&
                      index !== 1 &&
                      item?.unit_number !== "B 52" &&
                      item?.unit_number !== "B 53" ? (
                      <View style={{ alignItems: "center" }}>
                        <Text
                            style={styles.unitNumber}
                        >
                            {item?.unit_number}
                        </Text>
                        <TouchableOpacity
                          onPress={() =>
                              item?.is_available
                              ? goToUnitDetailScreen(item)
                              : Alert.alert("Sorry Unit is not available ")
                          }
                          style={[
                            styles.boxContainer,
                            {
                              backgroundColor: item?.is_available
                                ? Colors.primaryButtonBackgroundColor
                                : Colors.grayFont,
                              width: item?.width + 5,
                              height: item?.length,
                              alignItems: "center",
                              justifyContent: "center",
                            },
                          ]}
                        >
                          <Text
                              style={styles.unitNumber}
                          >
                            {`${item?.width}\n${"X"}\n${item?.length}`}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : null}

                    {item?.topRight ? (
                      <View
                        style={[styles.itemTop, { top: 5 }]}
                      />
                    ) : null}
                    {item?.bottomRight ? (
                      <View
                        style={[styles.itemTop, { bottom: 0 }]}
                      />
                    ) : null}
                  </View>
                )}
              />
            ) : null}
          </ScrollView>
          <Text
            style={[styles.itemName, {padding: 10}]}
          >
              {item?.name}
          </Text>
        </View>
      ) : index == 2 ? (
        <View style={styles.indexTwo}>
          <ScrollView
            style={{ marginBottom: 10, width: "100%" }}
                horizontal={item?.numberOfRows === 1 ? true : false}
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
          >
            {renderLeaseUnit}
            {renderBuyunit}
          </ScrollView>

          <Text
            numberOfLines={2}
                style={[styles.itemName, { padding: 7 }]}
          >
                {item?.name}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  boxContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    marginLeft: 1,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  buildingCText: {
    color: "white",
    fontSize: 13,
    width: "100%",
    textAlign: "center",
    padding: 7,
  },
  exitText: {
    color: "white",
    textAlign: "right",
    width: "95%",
    marginBottom: 20,
    fontSize: 13,
  },
  indexZero: { marginLeft: "3%", width: "100%" },
  indexOne: { marginLeft: "8%", justifyContent: "center" },
  indexTwo: { marginLeft: 20, width: "100%" },
  unitDetailContainer: { flexDirection: "row", alignItems: "center" },
  unitDetailBtn: {
    backgroundColor: Colors.primaryButtonBackgroundColor,
    width: 15 + 2,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  unitNumBtn: {
    backgroundColor: Colors.primaryButtonBackgroundColor,
    width: 15 + 2,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  unitNumber: {
    color: "white",
    fontSize: 7,
    width: "100%",
    textAlign: "center",
  },
  itemTop: {
    height: 10,
    width: 10,
    position: "absolute",
    right: 0,
    backgroundColor: Colors.grayFont,
  },
  itemName: {
    color: "white",
    fontSize: 13,
    width: "100%",
    textAlign: "center",
  },
  itemNumber: {
    color: "white",
    fontSize: 7,
    width: "100%",
    textAlign: "center",
    marginTop: 5,
  },
});