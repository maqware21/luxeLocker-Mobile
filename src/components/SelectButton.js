import React from 'react';
import { AntDesign } from '@expo/vector-icons';
import { Button } from 'react-native-elements';
import Colors from '@utils/Colors';
import { StyleSheet } from 'react-native';

export default (props) => {
  return (
    <Button
      icon={
        <AntDesign
          name="down"
          size={20}
          color="white"
          style={styles.antDesignIcon}
        />
      }
      iconRight
      type="outline"
      buttonStyle={{
        borderColor: Colors.tint,
        borderWidth: 1,
        borderRadius: 5,
        justifyContent: 'center',
        paddingVertical: 3,
        paddingRight: 10,
      }}
      {...props}
      titleStyle={{
        color: Colors.white,
        flexWrap: 'wrap',
        flex: 1,
        fontSize: 15,
        ...props.titleStyle,
      }}
    />
  );
};


const styles = StyleSheet.create({
  antDesignIcon: { 
    borderLeftColor: Colors.tint, 
    borderLeftWidth: 1, 
    paddingVertical: 3, 
    paddingLeft: 10, 
    marginLeft: 10 
  },
})