import React from "react";
import { Text, View, Image } from "react-native";
import Styles from "~utils/Style/Styles";

// Utils
import Colors from "@utils/Colors";
import { TextInputMask } from "react-native-masked-text";

export default (props) => {

  const { leftIcon, label, errorMessage } = props;

  const renderLeftIcon = leftIcon ? (
    <Image
      source={leftIcon}
      style={{
        height: 20,
        width: 20,
        paddingLeft: 10,
        marginLeft: 10,
        tintColor: "#85878D",
      }}
    />
  ) : null;

  const renderErrorMessage = errorMessage ? (
    <Text style={{ color: Colors.red, marginTop: 10 }}>
      {errorMessage}
    </Text>
  ) : null;

  return (
    <View>
      <Text style={Styles.inputLabel}>{label}</Text>
      <View
        style={[
          Styles.textInputContainer,
          errorMessage ? { borderWidth: 0.5, borderColor: "red" } : null,
        ]}
      >
        {renderLeftIcon}
        <TextInputMask
          renderErrorMessage={false}
          label={null}
          style={Styles.textInputStyle}
          maxLength={100}
          selectionColor={Colors.tint}
          placeholderTextColor={"#85878D"}
          {...props}
        />
      </View>
      {renderErrorMessage}
    </View>
  );
};
