import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Colors from "~utils/Colors";

export default ({
  selectedBuyUnited,
  SelectedOwenTab,
  SelectedLeaseTab,
  leaseTitle,
  buyTitle,
  fromManage
}) => {
  return (
    <View
      style={{
        backgroundColor: fromManage ? Colors.backgroundColor : Colors.inputBackgroundColor,
        marginTop: 10,
      }}
    >
      <View style={[styles.pagerContainer, { backgroundColor: fromManage ? Colors.backgroundColor : Colors.inputBackgroundColor }]}>
        <View style={[styles.pagerContent, { backgroundColor: fromManage ? Colors.backgroundColor : Colors.inputBackgroundColor, width: fromManage ? "100%" : "90%" }]}>
          <TouchableOpacity
            onPress={SelectedOwenTab && SelectedOwenTab}
            style={[
              styles.leaseUnit, { backgroundColor: fromManage ? Colors.inputBackgroundColor : Colors.backgroundColor },
              { height: fromManage ? 40 : 30 },
              selectedBuyUnited
                ? {
                  backgroundColor: Colors.primaryButtonBackgroundColor,
                }
                : null,
            ]}
          >
            <Text
              style={[
                styles.unitText, { color: fromManage ? Colors.grayFont : Colors.backgroundColor },
                {
                  color: selectedBuyUnited
                    ? Colors.backgroundColor
                    : Colors.grayFont,
                },
              ]}
            >
              {buyTitle}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={SelectedLeaseTab && SelectedLeaseTab}
            style={[
              styles.leaseUnit, { backgroundColor: fromManage ? Colors.inputBackgroundColor : Colors.backgroundColor },
              { height: fromManage ? 40 : 30 },
              !selectedBuyUnited
                ? {
                  backgroundColor: Colors.primaryButtonBackgroundColor,
                }
                : null,
            ]}
          >
            <Text
              style={[
                styles.unitText, { color: fromManage ? Colors.grayFont : Colors.backgroundColor },
                {
                  color: !selectedBuyUnited
                    ? Colors.backgroundColor
                    : Colors.grayFont,
                },
              ]}
            >
              {leaseTitle}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.inputBackgroundColor,
    width: "100%",
    height: "100%",
    flexDirection: "column",
  },
  pagerContainer: {
    flexDirection: "row",
    width: "100%",
    backgroundColor: Colors.inputBackgroundColor,
    alignItems: "center",
    justifyContent: "center",
  },
  pagerContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundColor,
    width: "90%",
    borderRadius: 8,
  },
  leaseUnit: {
    backgroundColor: Colors.backgroundColor,
    width: "50%",
    height: 30,
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
});
