import React from "react";
import { TextInput, Text, View, Image, StyleSheet } from "react-native";
import Styles from "~utils/Style/Styles";

// Utils
import Colors from "@utils/Colors";
import { TouchableOpacity } from "react-native-gesture-handler";

export default (props) => {
  return (
    <View>
      {props?.label && <Text style={[Styles.inputLabel, props?.labelStyle && props?.labelStyle]}>{props?.label}</Text>}
      <View
        style={[
          Styles.textInputContainer,
          props?.errorMessage ? { borderWidth: 0.5, borderColor: "red" } : null,
        ]}
      >
        {props.leftIcon ? (
          <Image
            source={props?.leftIcon}
            style={styles.icon}
          />
        ) : null}

        <TextInput
          style={[
            Styles.textInputStyle,
            { width: props?.rightIcon || props?.password ? "90%" : "99%" },
          ]}
          selectionColor={Colors.tint}
          {...props}
          placeholderTextColor={"#85878D"}
          ref={props?.inputRef}
          returnKeyType={
            props?.onSubmitEditing && props?.keyboardType === "numeric"
              ? "done"
              : props?.onSubmitEditing
              ? "next"
              : "done"
          }
          onSubmitEditing={props?.onSubmitEditing}
          rightIcon={
            <Image
              source={props?.passwordIcon}
              style={styles.passwordIcon}
            />
          }
        />
        {props?.error}

        {props.rightIcon ? (
          <TouchableOpacity
            onPress={() =>
              props?.rightIconPress ? props?.rightIconPress(props.name) : null
            }
          >
            <Image
              source={props?.rightIcon}
              style={styles.icon}
            />
          </TouchableOpacity>
        ) : null}
        {props?.password ? (
          <TouchableOpacity onPress={props?.passwordVisiabl}>
            <Image
              source={props?.passwordIcon}
              style={styles.passwordIcon}
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  icon: {
    height: 20,
    width: 20,
    paddingLeft: 10,
    marginLeft: 10,
    tintColor: "#85878D",
  },
  passwordIcon: {
    height: 20,
    width: 20,
    marginRight: 100,
    tintColor: "#85878D",
  },
})