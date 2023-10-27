import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import Colors from '~utils/Colors';
import Styles from '~utils/Style/Styles';

export default (props) => {
  return (
    <TouchableOpacity
      onPress={props.onPress} disabled={props?.disabled}
      style={[Styles.PrimaryButton, { backgroundColor: (props.error || props?.disabled || props?.custom) ? props?.backgroundColor ? props?.backgroundColor : Colors.inputBackgroundColor : Colors.primaryButtonBackgroundColor }]}>
      <Text style={[Styles.primaryButtonText, { color: (props.error || props?.disabled || props?.custom) ? props?.color ? props?.color : Colors.grayFont : Colors.inputBackgroundColor }]}>{props.label}</Text>
    </TouchableOpacity>

  );
};
