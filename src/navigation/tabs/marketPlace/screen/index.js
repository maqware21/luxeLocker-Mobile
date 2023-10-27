import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Text,
  Alert,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  BackHandler
} from "react-native";
import validator from "validator";
import { ScrollView, PinchGestureHandler, State, TapGestureHandler } from "react-native-gesture-handler";
import SimpleHeader from "~components/SimpleHeader";
import Colors from "~utils/Colors";
import TextInput from "~components/TextInput";
import CustomModal from "~components/CustomModal";
import GetLocation from "react-native-get-location";
import AssetImages from "~assets";
import Styles from "~utils/Style/Styles";
import PrimaryButton from "~components/PrimaryButton";
import Separator from "~components/Separator";
import CountryFlag from "react-native-country-flag";
import CountryPicker, { DARK_THEME } from "react-native-country-picker-modal";
import { updateObject, onChangePhoneNo } from "~utils/Helpers";

import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  availableUnitCall,
  addWaitingListCall,
  addWaitingListCallForRegisterUser,
} from "~utils/Network/api";
import Unit from "~components/Unit";
import LoadingOverlay from "~components/LoadingOverlay";
import InternetModal from "~components/InternetModal";
import NetInfo from "@react-native-community/netinfo";
import Orientation from "react-native-orientation-locker";
import { useSelector } from "react-redux";

export default ({ navigation, route }) => {
  const [countryFlag, setCountryFlag] = useState("US");
  const [countryCode, setCountryCode] = useState("+1");
  const [network, setNetwork] = useState(false);
  const scroll = useRef();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [leaseSearch, setLeaseSearch] = useState("");
  const [showWaitListModal, setWailListModal] = useState(false);
  const [selectedBuyUnit, setSelectedBuyUnit] = useState(route?.params?.buyUnit);
  const [extendMap, setExtendMap] = useState(false);
  const [visibleCountryModal, setVisibleCountryModal] = useState(false);
  const [callApi, setCallApi] = useState();

  const [form, setForm] = useState({
    email: "",
    phone: "",
    name: "",
  });
  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const emailRef = useRef();
  const phoneRef = useRef();

  const [myUnits, setUnits] = useState([]);
  const [mapUnits, setMapUnits] = useState([]);
  const [leaseUnit, setLeaseUnit] = useState();
  const [leaseUnitFilterData, setLeaseUnitFilterData] = useState([]);
  const [myUnitFilterData, setMyUnitFilterData] = useState([]);
  const [serverError, setServerError] = useState(false);
  const [unitByD, setUnitByD] = useState([]);
  const [unitByDLease, setUnitByDLease] = useState([]);
  const [itemsList, setItemsList] = useState([]);
  const [selectedItemsList, setSelectedItemsList] = useState([]);

  const scale = new Animated.Value(1)

  const onPinchEvent = Animated.event(
      [{ nativeEvent: { scale: scale } }],
      {
        useNativeDriver: true
      }
    )

  const onPinchStateChange = event => {
    const mapScale = Math.floor(event.nativeEvent.scale)
    if (event.nativeEvent.oldState === State.ACTIVE) {
      if (mapScale < 1 ) {
        Animated.timing(scale, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      }
    }
  }

  const onDoubleTap = event => {
    if (event.nativeEvent.state === State.ACTIVE) {
      Animated.timing(scale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const user = useSelector((state) => state?.authUser?.authUser);
  const gotoBack = () => {
    setItemsList([]);
    setSelectedItemsList([]);
    navigation.navigate("browsMarketPlace");
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", gotoBack);
    return () => {
      BackHandler.removeEventListener("hardwareBackPress", gotoBack);
    };
  }, []);

  const searchFilterFunction = (text) => {
    if (text) {
      const newData = myUnits?.filter(function (item) {
        const itemData = item?.unit_number
          ? item?.unit_number.toUpperCase()
          : "".toUpperCase();
        const textData = text.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });
      setMyUnitFilterData(newData);
      setSearch(text);
    } else {
      setMyUnitFilterData(myUnits);
      setSearch(text);
    }
  };

  const searchLeaseFilterFunction = (text) => {
    if (text) {
      const newData = leaseUnit?.filter(function (item) {
        const itemData = item?.unit_number
          ? item?.unit_number.toUpperCase()
          : "".toUpperCase();
        const textData = text.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });
      setLeaseUnitFilterData(newData);
      setLeaseSearch(text);
    } else {
      setLeaseUnitFilterData(leaseUnit);
      setLeaseSearch(text);
    }
  };

  const onChangeTxtPhoneNo = (value) => {
    setForm({ ...form, phone: value });
    if (!onChangePhoneNo(countryCode + value))
      updateObject("Phone number is invalid", "phone", setFormErrors);
    else updateObject("", "phone", setFormErrors);
  };

  const handleItemsList = (list, items, buyUnit) => {
    setItemsList(list);
    setSelectedItemsList(items);
    setSelectedBuyUnit(buyUnit)
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      setSelectedBuyUnit(route?.params?.buyUnit)
      setUnits([]);
      setMyUnitFilterData([]);
      setMapUnits([]);
      setLeaseUnitFilterData([]);
      setFormErrors({
        name: "",
        email: "",
        phone: "",
      });
      setForm({
        name: "",
        email: "",
        phone: "",
      });
      if (
        route?.params?.campus?.id
      ) {
        setShowModal(false);
        if (itemsList?.length > 0)
          getAllAvaibaleUnits(route.params.campus.id, itemsList);
        else getAllAvaibaleUnits(route.params.campus.id);
      } else {
        setShowModal(true);
      }
    });
    return unsubscribe;
  }, [navigation, route?.params, itemsList]);

  const reTry = () => {
    setNetwork(false);
    if (callApi === "getAllAvaibaleUnits") {
      getAllAvaibaleUnits(route?.params?.campus?.id);
    }
    if (callApi === "waitlistApiForUnregister") {
      handleNext();
    }
    if (callApi === "waitlistforRegister") {
      waitlistForRegister();
    }
  };

  const getAllAvaibaleUnits = (unitId, length) => {
    if (unitId) {
      NetInfo.fetch().then((state) => {
        if (state.isConnected) {
          setNetwork(false);
          let tempBuyUnitArray = [];
          let tempBuyLeaseArray = [];
          let unitsByA = [];
          let unitsByB = [];
          let unitsByC = [];
          let unitsByD = [];
          let unitsByDLease = [];
          let commaSeparatedLength = length && length.join(",");

          setLoading(true);
          availableUnitCall(unitId, commaSeparatedLength)
            .then((res) => {
              setLoading(false);
              if (res?.data) {
                res.data?.data?.forEach((category) => {
                  category?.buildings.forEach((building) => {
                    building?.units.forEach((unit) => {
                      let firstChar = unit.unit_number.charAt(0);
                      if (firstChar === "A") {
                        unitsByA.push(unit);
                      } else if (firstChar === "B") {
                        unitsByB.push(unit);
                      } else if (firstChar === "C") {
                        unitsByC.push(unit);
                      } else if (firstChar === "D") {
                        if (unit.buy_rate) unitsByD.push(unit);
                        else unitsByDLease.push(unit);
                      }
                    });
                  });
                });

                React.Children.toArray(res?.data?.data.map((item, index) => {
                  React.Children.toArray(item?.buildings.map((item, index) => {
                    if (item?.units)
                      React.Children.toArray(item.units.map((item, index) => {
                        item.maintenance_fee =
                          route?.params?.campus?.maintenance_fee;
                        if (item?.is_available) {
                          if (item?.buy_rate) {
                            tempBuyUnitArray.push(item);
                          } else {
                            tempBuyLeaseArray.push(item);
                          }
                        }
                      }));
                  }));
                }))

                if (
                  tempBuyUnitArray.some((item) => item?.is_available === true)
                ) {
                  setUnits(tempBuyUnitArray);
                  setMyUnitFilterData(tempBuyUnitArray);
                }
                if (
                  tempBuyLeaseArray.some((item) => item?.is_available == true)
                ) {
                  setLeaseUnit(tempBuyLeaseArray);
                  setLeaseUnitFilterData(tempBuyLeaseArray);
                }
              }
              if (unitsByD.length > 0) {
                setUnitByD([
                  {
                    name: "Building A",
                    numberOfRows: 1,
                    units: unitsByD.sort(function (a, b) {
                      let unitA = a?.unit_number.toUpperCase(); // ignore upper and lowercase
                      let unitB = b?.unit_number.toUpperCase(); // ignore upper and lowercase
                      if (unitA > unitB) {
                        return -1;
                      }
                      if (unitA < unitB) {
                        return 1;
                      }
                      return 0; // units are equal
                    }),
                  },
                ]);
                setUnitByDLease([
                  {
                    name: "Building A",
                    numberOfRows: 1,
                    units: unitsByDLease.sort(function (a, b) {
                      let unitA = a?.unit_number.toUpperCase(); // ignore upper and lowercase
                      let unitB = b?.unit_number.toUpperCase(); // ignore upper and lowercase
                      if (unitA > unitB) {
                        return -1;
                      }
                      if (unitA < unitB) {
                        return 1;
                      }
                      return 0; // units are equal
                    }),
                  },
                ]);
              }
              setMapUnits([
                {
                  name: "BUILDING C",
                  numberOfRows: 1,
                  units: unitsByC.sort(function (a, b) {
                    let unitA = a?.unit_number.toUpperCase(); // ignore upper and lowercase
                    let unitB = b?.unit_number.toUpperCase(); // ignore upper and lowercase
                    if (unitA < unitB) {
                      return -1;
                    }
                    if (unitA > unitB) {
                      return 1;
                    }
                    return 0; // units are equal
                  }),
                },
                {
                  name: "BUILDING B STANDARD/SUPER LUXE LITE",
                  numberOfRows: 2,
                  units: unitsByB.sort(function (a, b) {
                    let unitA = a?.unit_number.toUpperCase(); // ignore upper and lowercase
                    let unitB = b?.unit_number.toUpperCase(); // ignore upper and lowercase
                    if (unitA < unitB) {
                      return -1;
                    }
                    if (unitA > unitB) {
                      return 1;
                    }
                    return 0; // units are equal
                  }),
                },
                {
                  name: "BUILDING A LUXE",
                  numberOfRows: 1,
                  units: unitsByA.sort(function (a, b) {
                    let unitA = a?.unit_number.toUpperCase(); // ignore upper and lowercase
                    let unitB = b?.unit_number.toUpperCase(); // ignore upper and lowercase
                    if (unitA < unitB) {
                      return -1;
                    }
                    if (unitA > unitB) {
                      return 1;
                    }
                    return 0; // units are equal
                  }),
                },
              ]);
            })
            .catch((error) => {
              setLoading(false);
              if (
                error?.response?.status == 404 ||
                error?.response?.status == 400 ||
                error?.response?.status == 502
              ) {
                // setNetwork(true);
                setServerError(true);
              }
            });
        } else {
          setCallApi("getAllAvaibaleUnits");
          setNetwork(true);
          setServerError(false);
        }
      });
    }
  };
  const waitlistForRegister = () => {
    NetInfo.fetch().then((state) => {
      if (state.isConnected) {
        setNetwork(false);
        setLoading(true);
        addWaitingListCallForRegisterUser(
          wailListPayload(),
          user?.token?.access
        )
          .then((res) => {
            setLoading(false);
            if (res?.data) setWailListModal(true);
          })
          .catch((error) => {
            setLoading(false);

            if (
              error?.response?.status == 404 ||
              error?.response?.status == 502
            ) {
              setNetwork(true);
              setServerError(true);
            }
            if (error?.response?.status == 400) {
              Alert.alert(
                "Error",
                "Wait List Against this email Already Exist"
              );
            }
          });
      } else {
        setCallApi("waitlistforRegister");
        setNetwork(true);
        setServerError(false);
      }
    });
  };
  const handleNext = useCallback(async () => {
    NetInfo.fetch().then(async (state) => {
      if (state.isConnected) {
        setFormErrors({
          name: "",
          email: "",
          phone: "",
        });

        updateObject("", "", setFormErrors);
        let hasErrors = false;
        if (validator.isEmpty(form.name)) {
          updateObject("Name cannot be empty.", "name", setFormErrors);
          hasErrors = true;
        }
        if (!/^[a-zA-Z\s]*$/.test(form.name)) {
          updateObject("Invalid Name.", "name", setFormErrors);
          hasErrors = true;
        }

        if (validator.isEmpty(form.email)) {
          updateObject("Email cannot be empty.", "email", setFormErrors);
          hasErrors = true;
        }

        if (!onChangePhoneNo(countryCode + form.phone)) {
          updateObject("Invalid Phone Number", "phone", setFormErrors);
          hasErrors = true;
        }

        if (validator.isEmpty(form.phone)) {
          updateObject("Phone cannot be empty.", "phone", setFormErrors);
          hasErrors = true;
        }
        if (!validator.isEmail(form.email) && form.email.length > 0) {
          updateObject("Invalid Email.", "email", setFormErrors);
          hasErrors = true;
        }

        if (hasErrors) {
          setLoading(false);
          return;
        }
        setLoading(true);
        await addWaitingListCall(createPayload())
          .then((res) => {
            setLoading(false);
            setForm({
              name: "",
              email: "",
              phone: "",
            });
            if (res?.data) setWailListModal(true);
          })
          .catch((error) => {
            setLoading(false);
            if (
              error?.response?.status == 404 ||
              error?.response?.status == 502
            ) {
              setNetwork(true);
              setServerError(true);
            }
            if (error?.response?.status == 400) {
              Alert.alert(
                "Error",
                "Wait List Against this email Already Exist"
              );
            }
          });
      } else {
        setCallApi("waitlistApiForUnregister");
        setNetwork(true);
        setServerError(false);
      }
    });

  }, [form, formErrors]);

  const getCurrentLocation = () => {
    setShowModal(false);
    navigation.navigate("browsMarketPlace");
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
    })
      .then((location) => {
        setShowModal(false);
      })
      .catch((error) => {
        const { code, message } = error;
        if (code == "UNAUTHORIZED")
          alert(
            "Turn on Location Services to Allow your location even you are not using app"
          );
      });
  };

  const goToBrowsMarketPlaceScreen = () => {
    setShowModal(false);
    navigation.navigate("browsMarketPlace");
  };

  const gotoFilerScreen = () => {
    navigation.navigate("filterUnitsScreen", {
      campus: route?.params?.campus,
      handleItemsList: handleItemsList,
      itemsList: itemsList,
      selectedItemsList: selectedItemsList,
      selectedBuyUnit: selectedBuyUnit,
    });
  };

  function checkLocked() {
    Orientation.getOrientation((orientation) => {
      if (orientation === "PORTRAIT"){
        setExtendMap(true);
      } else {
        setExtendMap(false);
      }
    });
  }

  const onSelectCountry = (value) => {
    if (value.callingCode[0]) {
      setCountryFlag(value.cca2);
      setCountryCode(`+${value.callingCode[0]}`);
    }
  };
  const goToUnitDetailScreen = (item) => {
    setExtendMap(false);
    navigation.navigate("unitDetailScreen", {
      unit: item,
      buyUnit: selectedBuyUnit,
    });
  };

  const setExpendUnit = () => {
    setExtendMap(false);
  };

  const crossIconPress = () => {
    setShowModal(false);
    if (user) {
      navigation.navigate("tabs", { screen: "MyUnits" });
    } else {
      navigation.navigate("map");
    }
  };

  const createPayload = () => {
    let payload = {
      facility: route?.params?.campus?.id,
      email: form?.email,
      phone_no: countryCode + form?.phone,
      first_name: form?.name,
      last_name: form?.name,
      is_lease: selectedBuyUnit ? false : true,
    };
    return payload;
  };
  const wailListPayload = () => {
    let payload = {
      facility: route?.params?.campus?.id,
      is_lease: selectedBuyUnit ? false : true,
    };
    return payload;
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.backgroundColor }}>
      {extendMap && mapUnits?.length > 0 ? (
        <TapGestureHandler numberOfTaps={2} onHandlerStateChange={onDoubleTap}>
          <View
            style={styles.extandMapContainer}
          >
            <PinchGestureHandler
              onGestureEvent={onPinchEvent}
              onHandlerStateChange={onPinchStateChange}
            >
       
          <Animated.View 
          style={{ 
            flexDirection: "row", 
            flex: 1,
            overflow: "scroll",
            transform: [{ scale: scale }],
            }}
            >
            <ScrollView
              horizontal
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={styles.unitLengthOuterContainer}
              >
                {unitByD.length > 0 ? (
                  <View
                    style={[styles.unitLengthInnerContainer, { marginLeft: 20 }]}
                  >
                    <Text
                      style={styles.manical}
                    >
                      MANICAL ROOM
                    </Text>

                    <Text
                      style={styles.wash}
                    >
                      {` WASH\nSTATION`}
                    </Text>

                    <View
                      style={styles.dottedBorder}
                    />
                    <TouchableOpacity
                      style={styles.touchOpacity}
                    ></TouchableOpacity>

                    <FlatList
                      showsVerticalScrollIndicator={false}
                      showsHorizontalScrollIndicator={false}
                      data={
                        selectedBuyUnit
                          ? unitByD.reverse()
                          : unitByDLease.reverse()
                      }
                      pagingEnabled={true}
                      renderItem={({ item, index }) =>
                        item?.units.map((item, index) => (
                          <View
                            key={`${index}`}
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <TouchableOpacity
                              style={{
                                backgroundColor: item.is_available
                                  ? Colors.primaryButtonBackgroundColor
                                  : Colors.grayFont,
                                width: item.length,
                                height: item.width,
                                alignItems: "center",
                                justifyContent: "center",
                                marginTop: 2,
                                marginLeft: 12,
                              }}
                              onPress={() =>
                                item.is_available
                                  ? goToUnitDetailScreen(item)
                                  : Alert.alert("Sorry Unit is not available")
                              }
                            >
                              <Text
                                style={[styles.dimension, {fontSize: 7}]}
                              >
                                {`${item?.width}${"X"}${item?.length}`}
                              </Text>
                            </TouchableOpacity>
                            <Text
                              style={styles.unitNumber}
                            >
                              {`  ${item?.unit_number}`}
                            </Text>
                          </View>
                        ))
                      }
                      keyExtractor={(item, index) => `${index}`}
                    />
                    <View
                      style={styles.singleView}
                    />
                  </View>
                ) : null}

                <View
                  style={[styles.unitsContainer, { marginTop: 40 }]}
                >
                  <FlatList
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    style={{ marginTop: 10 }}
                    data={mapUnits}
                    pagingEnabled={true}
                    renderItem={({ item, index }) => (
                      <Unit
                        item={item}
                        index={`${index}`}
                        navigation={navigation}
                        buyUnit={selectedBuyUnit}
                        setExpendUnit={setExpendUnit}
                      />
                    )}
                    renderSectionHeader={({ name: { name } }) => (
                      <Text style={{ color: "white" }}>{name}</Text>
                    )}
                    keyExtractor={(item, index) => `${index}`}
                  />
                </View>
                <Text
                  style={{
                    color: Colors.grayFont,
                    transform: [{ rotate: "90deg" }],
                  }}
                >
                  W BETHANY HOME RD
                </Text>
              </View>
            </ScrollView>
          </Animated.View>
            </PinchGestureHandler>
          <Text
            style={styles.nthEve}
          >
            N 55th AVE
          </Text>
          <View style={[styles.bottomContainer]}>
            <TouchableOpacity
              onPress={() => {
                checkLocked();
                Orientation.lockToPortrait();
              }}
              style={styles.extendButton}
            >
              <Image
                source={AssetImages.compress}
                style={[Styles.icon, { width: 16, height: 16, left: 0 }]}
              />
            </TouchableOpacity>
            <View
              style={styles.availableContainer}
            >
              <View
                style={[
                  styles.statusButton,
                  { backgroundColor: Colors.primaryButtonBackgroundColor },
                ]}
              />
              <Text style={styles.unitStatus}>Available</Text>
              <View
                style={[
                  styles.statusButton,
                  { backgroundColor: Colors.grayFont },
                ]}
              />
              <Text style={styles.unitStatus}>Unavailable</Text>
            </View>
          </View>
       
        </View>
        </TapGestureHandler>
      ) : (
        <View style={{ flex: 1, height: "100%" }}>
          <SimpleHeader
            headerLabel={"Marketplace"}
            backgroundColor={Colors.inputBackgroundColor}
            backIcon={true}
            onPress={gotoBack}
          />
          <View style={{ flex: 1, height: Dimensions.get("window").height - 100 }}>
            <KeyboardAwareScrollView
              ref={scroll}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              enableOnAndroid={true}
              extraHeight={130}
              extraScrollHeight={130}
            >
              <View
                style={{
                  backgroundColor: Colors.inputBackgroundColor,
                  flex: 1,
                }}
              >
                <View style={styles.pagerContainer}>
                  <View style={styles.pagerContent}>
                    <TouchableOpacity
                      onPress={() => setSelectedBuyUnit(true)}
                      style={[
                        styles.leaseUnit,
                        selectedBuyUnit
                          ? {
                            backgroundColor:
                              Colors.primaryButtonBackgroundColor,
                          }
                          : null,
                      ]}
                    >
                      <Text
                        style={[
                          styles.unitText,
                          {
                            color: selectedBuyUnit
                              ? Colors.backgroundColor
                              : Colors.grayFont,
                          },
                        ]}
                      >
                        {"Buy Unit"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setSelectedBuyUnit(false)}
                      style={[
                        styles.leaseUnit,
                        !selectedBuyUnit
                          ? {
                            backgroundColor:
                              Colors.primaryButtonBackgroundColor,
                          }
                          : null,
                      ]}
                    >
                      <Text
                        style={[
                          styles.unitText,
                          {
                            color: !selectedBuyUnit
                              ? Colors.backgroundColor
                              : Colors.grayFont,
                          },
                        ]}
                      >
                        {"Lease Unit"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                  <TapGestureHandler numberOfTaps={2} onHandlerStateChange={onDoubleTap}>
                    <View style={{ overflow: "scroll" }}>
                    <PinchGestureHandler
                      onGestureEvent={onPinchEvent}
                      onHandlerStateChange={onPinchStateChange}
                      >
                        <Animated.ScrollView
                        horizontal
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                        style={{
                          transform: [{ scale: scale }],
                        }}
                        >
                    {unitByD && unitByD?.length > 0 ? (
                      <View
                        style={styles.unitLengthInnerContainer}
                      >
                        <Text
                          style={styles.manical}
                        >
                          MANICAL ROOM
                        </Text>

                        <Text
                          style={styles.wash}
                        >
                          {` WASH\nSTATION`}
                        </Text>
                        <View
                          style={styles.dottedBorder}
                        />
                        <TouchableOpacity
                          style={styles.touchOpacity}
                        ></TouchableOpacity>
                        <FlatList
                          showsVerticalScrollIndicator={false}
                          showsHorizontalScrollIndicator={false}
                          data={
                            selectedBuyUnit
                              ? unitByD.reverse()
                              : unitByDLease.reverse()
                          }
                          pagingEnabled={true}
                          renderItem={({ item, index }) =>
                            item?.units?.map((item, index) => (
                              <View
                                key={`${index}`}
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                }}
                              >
                                <TouchableOpacity
                                  style={{
                                    backgroundColor: item.is_available
                                      ? Colors.primaryButtonBackgroundColor
                                      : Colors.grayFont,
                                    width: item?.length,
                                    height: item?.width,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginTop: 2,
                                    marginLeft: 12,
                                  }}
                                  onPress={() =>
                                    item?.is_available
                                      ? goToUnitDetailScreen(item)
                                      : Alert.alert(
                                        "Sorry Unit is not available "
                                      )
                                  }
                                >
                                  <Text
                                    style={[styles.dimension, { fontSize: 7 }]}
                                  >
                                    {`${item?.width}${"X"}${item?.length}`}
                                  </Text>
                                </TouchableOpacity>
                                <Text
                                  style={[styles.dimension, { fontSize: 5 }]}
                                >
                                  {`  ${item?.unit_number}`}
                                </Text>
                              </View>
                            ))
                          }
                          keyExtractor={(item, index) => `${index}`}
                        />

                        <View
                          style={styles.singleView}
                        />
                      </View>
                    ) : null}

                    <View
                      style={[styles.unitsContainer, { flexDirection: "row", marginTop: 60 }]}
                    >
                      <FlatList
                        keyExtractor={(item, index) => `${index}`}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        style={{ marginTop: 10 }}
                        data={mapUnits}
                        pagingEnabled={true}
                        renderItem={({ item, index }) => (
                          <Unit
                            key={`${index}`}
                            item={item}
                            index={index}
                            navigation={navigation}
                            buyUnit={selectedBuyUnit}
                            setExpendUnit={setExpendUnit}
                          />
                        )}
                        renderSectionHeader={({ name: { name } }) => (
                          <Text style={{ color: "white" }}>{name}</Text>
                        )}
                      />
                      <Text
                        style={{
                          color: Colors.grayFont,
                          transform: [{ rotate: "90deg" }],
                        }}
                      >
                        W BETHANY HOME RD
                      </Text>
                    </View>
                      </Animated.ScrollView>
                    </PinchGestureHandler>
                    </View>
                  </TapGestureHandler>
                <Text
                  style={styles.nthEve}
                >
                  N 55th AVE
                </Text>

                <View style={[styles.bottomContainer]}>
                  <TouchableOpacity
                    style={styles.extendButton}
                    onPress={() => {
                      checkLocked();
                      Orientation.lockToLandscape();
                    }}
                  >
                    <Image
                      source={AssetImages.extand}
                      style={[Styles.icon, { width: 16, height: 16, left: 0 }]}
                    />
                  </TouchableOpacity>
                  <View
                    style={styles.availableContainer}
                  >
                    <View
                      style={[
                        styles.statusButton,
                        {
                          backgroundColor: Colors.primaryButtonBackgroundColor,
                        },
                      ]}
                    />
                    <Text style={styles.unitStatus}>Available</Text>
                    <View
                      style={[
                        styles.statusButton,
                        { backgroundColor: Colors.grayFont },
                      ]}
                    />
                    <Text style={styles.unitStatus}>Unavailable</Text>
                  </View>
                </View>
              </View>

              <View style={{ flex: 1 }}>
                {(myUnits?.length < 1 && selectedBuyUnit) ||
                  (!selectedBuyUnit && leaseUnitFilterData?.length < 1) ? (
                    search === "" && leaseSearch === "" && !selectedItemsList?.length ? (
                  user?.first_login == null ? (
                    <View style={{ padding: 10 }}>
                      <Text style={styles.waitListHeading}>
                        {
                          "There are no available units for rent at the moment. You can join the waiting list."
                        }
                      </Text>
                      {!user ? (
                        <View>
                          <View style={{ width: "100%" }}>
                            <TextInput
                              errorMessage={formErrors?.name}
                              onChangeText={(value) =>
                                updateObject(value, "name", setForm)
                              }
                              autoCapitalize="none"
                              label="Name*"
                              searchInput
                              value={form?.name}
                              onSubmitEditing={() => {
                                emailRef?.current?.focus();
                              }}
                            />
                              {formErrors?.name ? (
                              <Text style={Styles.errorText}>
                                {formErrors.name}
                              </Text>
                            ) : null}
                          </View>
                          <Separator height={10} />

                          <View style={{ width: "100%" }}>
                            <TextInput
                              errorMessage={formErrors?.email}
                              onChangeText={(value) =>
                                updateObject(value, "email", setForm)
                              }
                              autoCapitalize="none"
                              label="Email*"
                              value={form?.email}
                              inputRef={emailRef}
                              onSubmitEditing={() => {
                                phoneRef?.current?.focus();
                              }}
                            />
                            {formErrors?.email ? (
                              <Text style={Styles.errorText}>
                                {formErrors.email}
                              </Text>
                            ) : null}
                          </View>
                          <Separator height={10} />
                          <View style={styles.textInputContainerRow}>
                            <View style={{ width: "32%" }}>
                              <Text style={Styles.inputLabel}>Phone*</Text>
                              <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => setVisibleCountryModal(true)}
                                style={[
                                  Styles.textInputStyle,
                                  styles.contryButtonContainer,
                                ]}
                              >
                                <CountryFlag
                                  style={styles.contryFlag}
                                  isoCode={countryFlag}
                                />
                                <Text style={[Styles.inputLabel, {marginBottom: 0}]}>
                                  {countryCode}
                                </Text>
                                <Image
                                  style={Styles.icon}
                                  source={AssetImages.down}
                                />
                              </TouchableOpacity>
                              <CountryPicker
                                theme={DARK_THEME}
                                onSelect={onSelectCountry}
                                visible={visibleCountryModal}
                                containerButtonStyle={{ display: "none" }}
                                onClose={() => setVisibleCountryModal(false)}
                              />
                            </View>
                            <View style={{ width: "63%" }}>
                              <TextInput
                                errorMessage={formErrors?.phone}
                                onChangeText={(value) =>
                                  onChangeTxtPhoneNo(value)
                                }
                                keyboardType={"numeric"}
                                autoCapitalize="none"
                                    label=" "
                                value={form.phone}
                                inputRef={phoneRef}
                              />
                              {formErrors?.phone ? (
                                <Text style={Styles.errorText}>
                                  {formErrors.phone}
                                </Text>
                              ) : null}
                            </View>
                          </View>
                        </View>
                      ) : null}
                      <Separator height={20} />
                      <PrimaryButton
                        label={"Join Waitlist"}
                        onPress={() => {
                          user ? waitlistForRegister() : handleNext();
                        }}
                      />
                    </View>
                  ) : null
                  ) : (
                          <View
                            style={styles.filterWrapper}
                          >
                            <TouchableOpacity
                              style={styles.filterBtn}
                              onPress={() => gotoFilerScreen()}
                            >
                              <Image
                                source={AssetImages.filter}
                                style={styles.filterImg}
                              />
                              <Text
                                style={{ color: Colors.primaryButtonBackgroundColor }}
                              >
                                {"Filters"}
                              </Text>
                            </TouchableOpacity>
                            <View style={{ width: "70%" }}>
                              {selectedBuyUnit ? (
                                <TextInput
                                  onChangeText={(text) => searchFilterFunction(text)}
                                  value={search}
                                  underlineColorAndroid="transparent"

                                  placeholder="Search"
                                  leftIcon={AssetImages.search}
                                />
                              ) : (
                                <TextInput
                                  onChangeText={(text) =>
                                    searchLeaseFilterFunction(text)
                                  }
                                  value={leaseSearch}
                                  underlineColorAndroid="transparent"
                                  placeholder="Search"
                                  leftIcon={AssetImages.search}
                                />
                              )}
                            </View>
                          </View>
                  )
                  ) : (
                    <View
                      style={styles.filterWrapper}
                    >
                      <TouchableOpacity
                        style={styles.filterBtn}
                        onPress={gotoFilerScreen}
                      >
                        <Image
                          source={AssetImages.filter}
                          style={styles.filterImg}
                        />
                        <Text
                          style={{ color: Colors.primaryButtonBackgroundColor }}
                        >
                          {"Filters"}
                        </Text>
                      </TouchableOpacity>
                      <View style={{ width: "70%" }}>
                        {selectedBuyUnit ? (
                          <TextInput
                            onChangeText={(text) => searchFilterFunction(text)}
                            value={search}
                            underlineColorAndroid="transparent"
                            
                            placeholder="Search"
                            leftIcon={AssetImages.search}
                          />
                        ) : (
                          <TextInput
                            onChangeText={(text) =>
                              searchLeaseFilterFunction(text)
                            }
                            value={leaseSearch}
                            underlineColorAndroid="transparent"
                            placeholder="Search"
                            leftIcon={AssetImages.search}
                          />
                        )}
                      </View>
                    </View>
                )}
                {selectedBuyUnit ? (
                  <View>
                    {myUnitFilterData?.length ? (
                      myUnitFilterData.map((item, index) => (
                        // unit box design.....//////
                        <TouchableOpacity
                          key={`${index}`}
                          onPress={() => goToUnitDetailScreen(item)}
                        >
                          <View
                            style={[styles.filterWrapper, { width: "100%", paddingVertical: 0 }]}
                          >
                            <View
                              style={styles.unitSectionContainer}
                            >
                              <View
                                style={{
                                  justifyContent: "center",
                                  flexDirection: "row",
                                  alignItems: "center",
                                }}
                              >
                                <View
                                  style={{
                                    backgroundColor:
                                      Colors.primaryButtonBackgroundColor,
                                    width: 60,
                                    height: 60,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: 8,
                                  }}
                                >
                                  <Text
                                    style={{
                                      color: Colors.black,
                                      fontSize: 12,
                                    }}
                                  >
                                    {item?.unit_number}
                                  </Text>
                                </View>
                                {/* {unit detail view....} */}
                                <View style={{ padding: 10 }}>
                                  <Text
                                    style={{
                                      fontSize: 13,
                                      color: Colors.white,
                                      fontWeight: "500",
                                    }}
                                  >
                                    {`Unit ${item?.unit_number}`}
                                  </Text>
                                  <Text
                                    style={{
                                      fontSize: 17,
                                      color: Colors.grayFont,
                                    }}
                                  >
                                    {`Dimension: ${item?.length} ft. x ${item?.width} ft.`}
                                  </Text>
                                  <Text
                                    style={{
                                      fontSize: 17,
                                      color: Colors.grayFont,
                                    }}
                                  >
                                    {item?.lease_rate
                                      ? `Lease Rate: ${item?.lease_rate}`
                                      : `Purchase Amount: ${item?.buy_rate}`}
                                  </Text>
                                </View>
                              </View>
                              <Image
                                source={AssetImages.forward}
                                style={{
                                  height: 20,
                                  width: 20,
                                  tintColor: Colors.grayFont,
                                }}
                              />
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))) : null }
                  </View>
                ) : (
                  <View>
                    {leaseUnitFilterData?.length ? (
                      leaseUnitFilterData?.map((item, index) => (
                        // unit box design.....//////
                        <TouchableOpacity
                          key={`${index}`}
                          onPress={() => goToUnitDetailScreen(item)}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              width: "100%",
                              justifyContent: "space-between",
                              alignItems: "center",
                              paddingHorizontal: 16,
                              paddingVertical: 0
                            }}
                          >
                            <View
                              style={styles.unitSectionContainer}
                            >
                              <View
                                style={{
                                  justifyContent: "center",
                                  flexDirection: "row",
                                  alignItems: "center",
                                }}
                              >
                                <View
                                  style={{
                                    backgroundColor:
                                    Colors.primaryButtonBackgroundColor,
                                    width: 60,
                                    height: 60,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: 8,
                                  }}
                                >
                                  <Text
                                    style={{
                                      color: Colors.black,
                                      fontSize: 12,
                                    }}
                                  >
                                    {item?.unit_number}
                                  </Text>
                                </View>
                                {/* {unit detail view....} */}
                                <View style={{ padding: 10 }}>
                                  <Text
                                    style={{
                                      fontSize: 13,
                                      color: Colors.white,
                                      fontWeight: "500",
                                    }}
                                  >
                                    {`Unit ${item?.unit_number}`}
                                  </Text>
                                  <Text
                                    style={styles.leaseRate}
                                  >
                                    {`Dimension: ${item?.length} ft. x ${item?.width} ft.`}
                                  </Text>
                                  <Text
                                    style={styles.leaseRate}
                                  >
                                    {item?.lease_rate
                                      ? `Lease Rate: ${item?.lease_rate}`
                                      : `Purchase Amount: ${item?.buy_rate}`}
                                  </Text>
                                </View>
                              </View>
                              <Image
                                source={AssetImages.forward}
                                style={{
                                  height: 20,
                                  width: 20,
                                  tintColor: Colors.grayFont,
                                }}
                              />
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))) : null}
                  </View>
                )}
                {(myUnitFilterData?.length === 0 && selectedBuyUnit && search) || (myUnitFilterData?.length === 0 && selectedBuyUnit && selectedItemsList?.length) ? (
                  <View
                    style={styles.unitNotFound}
                  >
                    <Text style={{ color: Colors.white }}>
                      {"Unit Not Found"}
                    </Text>
                  </View>
                  ) : null}
                {(leaseUnitFilterData?.length == 0 && !selectedBuyUnit && leaseSearch) || (leaseUnitFilterData?.length == 0 && !selectedBuyUnit && selectedItemsList?.length) ? (
                  <View
                    style={styles.unitNotFound}
                  >
                    <Text style={{ color: Colors.white }}>
                      {"Unit Not Found"}
                    </Text>
                  </View>
                ) : null}
              </View>
            </KeyboardAwareScrollView>
          </View>
        </View>
      )}
      <CustomModal
        isVisible={showModal}
        icon={AssetImages.location}
        secondaryButtonText={"Campus Near Me"}
        primaryButtonText={"Search Available Campuses"}
        secondaryButtonOnPress={getCurrentLocation}
        onPress={goToBrowsMarketPlaceScreen}
        crossIconPress={crossIconPress}
      />
      <CustomModal
        isVisible={showWaitListModal}
        icon={AssetImages.completed}
        primaryButtonText={"Continue"}
        title={"You have successfully Joined the Waitlist"}
        onPress={() => setWailListModal(false)}
      />
      <InternetModal
        isVisible={network}
        icon={AssetImages.internet}
        title={serverError ? "Server Error" : "Internet Connection Issue"}
        des={
          serverError
            ? "Went some thing Wrong"
            : "Please check your internet connection"
        }
        secondaryButtonText={"Retry"}
        primaryButtonText={"Close"}
        secondaryButtonOnPress={() => reTry()}
        onPress={() => setNetwork(false)}
      />
      {loading ? <LoadingOverlay /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.inputBackgroundColor,
    width: "100%",
    height: "100%",
    borderColor: "red",
    borderWidth: 1,
    flexDirection: "column",
  },
  unitNotFound: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  extandMapContainer: {
    flex: 1,
    marginTop: 10,
    height: "100%",
    alignItems: "center",
    backgroundColor: Colors.inputBackgroundColor,
    padding: 20,
    overflow: "scroll"
  },
  unitLengthOuterContainer: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
  },
  unitLengthInnerContainer: {
    flex: 0.3,
    marginTop: 10,
    alignItems: "center",
  },
  manical: {
    color: "white",
    marginBottom: 10,
    fontSize: 13,
  },
  dottedBorder: {
    borderStyle: "dotted",
    height: "2%",
    bottom: 0,
    borderWidth: 1,
    borderRadius: 1,
    borderColor: "grey",
  },
  touchOpacity: {
    backgroundColor: "#2D8DC4",
    width: 48,
    height: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  dimension: {
    color: "white",
    textAlign: "center",
  },
  leaseRate: {
    color: Colors.black,
    fontSize: 17,
    color: Colors.grayFont,
  },
  singleView: {
    height: 10,
    width: 10,
    position: "absolute",
    top: 5,
    right: 0,
    backgroundColor: Colors.grayFont,
  },
  unitsContainer: {
    flex: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },
  unitSectionContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: Colors.inputBackgroundColor,
    alignItems: "center",
    width: "100%",
    justifyContent: "space-between",
  },
  nthEve: {
    color: Colors.grayFont,
    width: "100%",
    alignItems: "center",
    textAlign: "center",
  },
  filterWrapper: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: 16,
  paddingVertical: 16,
},
  filterBtn: {
    width: 100,
    height: 40,
    backgroundColor: Colors.inputBackgroundColor,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  filterImg: {
    height: 20,
    width: 20,
    marginRight: 5,
    tintColor: Colors.primaryButtonBackgroundColor,
  },
  pagerContainer: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 16,
    backgroundColor: Colors.inputBackgroundColor,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  wash: {
    color: "white",
    fontSize: 11,
  },
  unitNumber: {
    color: "white",
    fontSize: 5,
    textAlign: "center",
  },
  availableContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  pagerContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundColor,
    width: "100%",
    borderRadius: 8,
  },
  bottomContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    backgroundColor: Colors.inputBackgroundColor,
    paddingHorizontal: 16,
    paddingVertical: 5,
  },
  extendButton: {
    height: 28,
    width: 28,
    borderRadius: 8,
    backgroundColor: Colors.backgroundColor,
    alignItems: "center",
    justifyContent: "center",
  },
  unitStatus: {
    marginLeft: 6,
    fontSize: 11,
    fontFamily: "Inter",
    color: Colors.grayFont,
  },
  statusButton: {
    height: 8,
    width: 8,
    borderRadius: 8 / 2,
    backgroundColor: Colors.backgroundColor,
    alignItems: "center",
    marginLeft: 20,
  },
  boxContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    marginLeft: 10,
  },
  leaseUnit: {
    backgroundColor: Colors.backgroundColor,
    padding: 10,
    width: "50%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  unitText: {
    fontFamily: "Inter",
    fontSize: 11,
    fontWeight: "500",
    lineHeight: 14,
  },
  waitListHeading: {
    fontWeight: "500",
    fontFamily: "Inter",
    color: Colors.white,
    lineHeight: 24,
    textAlign: "center",
    padding: 10,
  },
  contryFlag: { borderRadius: 11, height: 22, width: 22 },
  contryButtonContainer: {
    height: 40,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: Colors.inputBackgroundColor,
  },

  textInputContainerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  joinWaiterListContainerForm: {
    width: "100%",
    backgroundColor: Colors.backgroundColor,
  },
});