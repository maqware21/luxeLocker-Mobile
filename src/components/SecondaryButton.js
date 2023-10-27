import React from "react";
import { TouchableOpacity, Text } from "react-native";
import Colors from "~utils/Colors";
import Styles from "~utils/Style/Styles";

export default (props) => {
  return (
    <TouchableOpacity
      onPress={props?.onPress}
      style={[
        Styles.secondaryButton,
        props?.error ? { borderColor: Colors.inputBackgroundColor } : null,
      ]}
      disabled={props?.error ? true : false}
    >
      <Text
        style={[
          Styles.secondaryButtonText,
          props?.error ? { color: Colors.grayFont } : null,
        ]}
      >
        {props?.label}
      </Text>
    </TouchableOpacity>
  );
};
