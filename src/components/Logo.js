import React from 'react';
import { Image } from 'react-native';
import AssetImages from '~assets';



const Logo = ({ style }) => {
  return (
    <Image
      style={{
        height: 200,
        width: 200,
        ...style,
      }}
      resizeMode="contain"
      source={AssetImages.luxeLogo}
    />
  );
};

Logo.defaultProps = {
  style: {},
};

export default Logo;
