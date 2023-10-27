import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TextInputMask } from 'react-native-masked-text';

// Utils
import Colors from '@utils/Colors';


export default (props) => {
  return (
    <View>
      <TextInputMask
        renderErrorMessage={false}
        label={null}
        style={styles.inputMask}
        maxLength={100}
        selectionColor={Colors.tint}
        {...props}
      />
      <Text style={styles.errorMsg}>
        {props?.errorMessage}
      </Text>
    </View>
  );
};


const styles = StyleSheet.create({
  inputMask: {
    fontSize: 16,
    color: Colors.fontColor,
    borderBottomWidth: 1,
    borderBottomColor: Colors.underline,
    marginHorizontal: 10,
    paddingBottom: 5,
  },
  errorMsg: { 
    paddingLeft: 15, 
    color: '#fd211f', 
    fontSize: 12, 
    fontFamily: "Inter" 
  },
})