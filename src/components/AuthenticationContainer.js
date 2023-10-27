import React, { useCallback } from 'react';
import {
  Dimensions,
  View,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";

// Components
import LoadingOverlay from "./LoadingOverlay";
import AssetImages from "~assets";
// Utils
import Colors from "~utils/Colors";

const screenWidth = Dimensions.get('window').width;

export default ({ children, style, loading }) => {
  const handlePress = () => {
    Keyboard.dismiss();
  };
  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View
        style={{
          flex: 1,
          width: screenWidth,
          backgroundColor: Colors.backgroundColor,
          ...style,
          alignItems: "center",
        }}
        source={AssetImages.loginBackground}
      >
        {loading && <LoadingOverlay />}
        {children}
      </View>
    </TouchableWithoutFeedback>
  );
};
