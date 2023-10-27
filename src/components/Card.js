import React, { useEffect, useState, useMemo } from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Image,
  Animated,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Colors from "~utils/Colors";
import AssetImages from "~assets";
import { deleteCardCall } from "~utils/Network/api";
import { useSelector } from "react-redux";
import CustomModal from "~components/CustomModal";

export default ({ card, getAllCardsHandler, listHeader }) => {
  const [cards, setCards] = useState([]);
  const user = useSelector((state) => state?.authUser?.authUser);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(false);

  useEffect(() => {
    if (card?.length > 0) setCards(card);
  }, []);

  const ItemView = cards.map(( item, index ) => (
      <Swipeable
        renderRightActions={(progress, dragX) =>
          !item.is_default
            ? RightActions(progress, dragX, item.card_id, item.id)
            : null
        }
        key={index}
      >
        <TouchableOpacity
          style={styles.cardItem}
        >
          <View
            style={styles.cardItemInternal}
          >
            <View style={styles.cardContainer}>
              <Image
                source={
                  item?.brand === "JCB"
                    ? AssetImages.jcb
                    : item.brand === "Visa"
                    ? AssetImages.visa
                    : item.brand === "MasterCard"
                    ? AssetImages.master
                    : item.brand === "UnionPay"
                    ? AssetImages.unionPay
                    : item.brand === "American Express"
                    ? AssetImages.amxp
                    : AssetImages.card
                }
                style={styles.image}
              />
              <View style={styles.cardText}>
                <Text
                  style={styles.cardNum}
                >
                  {`**** ${item?.card_number}`}
                </Text>
                <Text
                  style={styles.cardExp}
                >
                  {`${item?.exp_month}/${item?.exp_year}`}
                </Text>
              </View>
            </View>
            {item?.is_default ? (
              <TouchableOpacity
                style={styles.tickContainer}
              >
                <View style={styles.tick}></View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() =>
                  cards.length > 1
                    ? deleteCardAndDefaultHandler("default", item?.id)
                    : null
                }
              >
                <Text
                  style={styles.default}
                >
                  Make Default
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Swipeable>
    ));

  const deleteCardAndDefaultHandler = (key, id) => {
    deleteCardCall(deletePayLoad(key, id), user?.token?.access)
      .then((res) => {
        setShowModal(false);
        getAllCardsHandler();
      })
      .catch((error) => {
        getAllCardsHandler();
      });
  };

  const deletePayLoad = (key, id) => {
    let payload = {
      operation_type: key,
      card_id: id,
    };
    return payload;
  };

  const deleteItemHandler = (id) => {
      setShowModal(true);
      setSelectedId(id);
    };

  const RightActions = (progress, dragX, card_id, id) => {
    const scale = dragX.interpolate({
      inputRange: [-50, 0],
      outputRange: [0.7, 0],
    });


    return (
      <>
      {!cards.length > 1 ? null : (
        <TouchableOpacity onPress={() => deleteItemHandler(id)}>
          <View style={styles.deleteImageContainer} >
            <Animated.Image
              style={styles.deleteImage}
              source={AssetImages.trash}
              resizeMode={"contain"}
            ></Animated.Image>
          </View>
        </TouchableOpacity>
      )}
      </>
    );
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        <View style={{ marginTop: 20 }}>
          <Text style={styles.listHeader}>{listHeader}</Text>
          {cards.length > 0 ? (
            <View style={{ marginTop: 10 }}>
            { ItemView }
            </View>
          ) : (
              <View style={ styles.noCard }>
              <Text style={[styles.listHeader, { color: Colors.grayFont }]}>
                {"No Card Found"}
              </Text>
            </View>
          )}
          <CustomModal
            isVisible={showModal}
            icon={AssetImages.questionMarkIcon}
            secondaryButtonText={"Cancel"}
            title={"Delete Card?"}
            des={"The card will be removed from your payment methods"}
            primaryButtonText={"Delete"}
            secondaryButtonOnPress={() => setShowModal(false)}
            onPress={() => deleteCardAndDefaultHandler("delete", selectedId)}
          />
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  cardItemInternal: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  cardItem: {
    paddingVertical: 20,
    backgroundColor: Colors.inputBackgroundColor,
    marginTop: 1,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  cardContainer: { flexDirection: "row", alignItems: "center" },
  cardNum: {
    fontSize: 13,
    fontFamily: "Inter",
    color: Colors.white,
  },
  cardText: { flexDirection: "column", marginLeft: 12 },
  cardExp: {
    fontSize: 11,
    fontFamily: "Inter",
    color: Colors.grayFont,
  },
  tickContainer: {
    height: 20,
    width: 20,
    backgroundColor: Colors.primaryButtonBackgroundColor,
    borderRadius: (20 / 2),
    alignItems: "center",
    justifyContent: "center",
  },
  tick: { 
    width: 8, 
    height: 5, 
    borderBottomWidth: 1.5, 
    borderLeftWidth: 1.5, 
    borderColor: "black", 
    transform: [
      { rotate: "310deg" }, 
      { translateY: -1 }, 
      { translateX: 0.5 }
    ]},
  image: { height: 38, width: 38 },
  default: {
    color: Colors.grayFont,
    textDecorationLine: "underline",
    fontFamily: "Inter",
    fontSize: 11,
  },
  deleteImageContainer: {
    flex: 1,
    backgroundColor: "red",
    justifyContent: "center",
    borderBottomRightRadius: 8,
    marginTop: 1,
    paddingHorizontal: 25,
  },
  deleteImage: {
    height: 15,
    width: 15,
    tintColor: Colors.white,
    paddingHorizontal: 10,
  },
  noCard: {
    width: "100%", 
    alignItems: "center" 
  },
  listHeader: {
    color: Colors.white,
    fontFamily: "Inter",
    fontSize: 15,
    fontWeight: "500",
  },
});
