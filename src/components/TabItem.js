import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import Colors from "~utils/Colors";

export default TabItem = React.memo(({ label, isSelected, onPress }) => {
    return(
        <TouchableOpacity
          style={isSelected ? styles.buttonStyle : styles.unSelectedButton}
          onPress={onPress}
        >
          <Text style={isSelected ? styles.heading : styles.selectedHeading}>
            {label}
          </Text>
        </TouchableOpacity>
    )
});

const styles = StyleSheet.create({
    buttonStyle: {
        backgroundColor: Colors.primaryButtonBackgroundColor,
        width: "25%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
    },
    unSelectedButton: {
        width: "25%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
    },
    heading: {
        color: Colors.inputBackgroundColor,
        fontFamily: "Inter",
        fontSize: 13,
        lineHeight: 20,
    },
    selectedHeading: {
        color: Colors.grayFont,
        fontFamily: "Inter",
        fontSize: 13,
        lineHeight: 20,
    },
});