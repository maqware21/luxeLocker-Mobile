import React from 'react';
import { ActivityIndicator, View } from 'react-native';

// Utils
import Colors from '~utils/Colors';
import Styles from '@utils/Style/Styles';


export default (props) => {
  return (
    <View style={{ ...Styles.loadingViewStyle, ...props.containerStyle }}>
      <ActivityIndicator
        size='large'
        color={Colors.primaryButtonBackgroundColor}
        {...props}
      />
    </View>
  );
};
