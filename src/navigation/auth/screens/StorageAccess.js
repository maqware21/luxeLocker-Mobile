import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import Manually from "~components/Manually";
import QRCode from "~components/QRCode";
export default ({ navigation, route }) => {
  const { qr } = route?.params;
  const [SelectQr, setSelectQr] = useState(qr);

  return (
    <View>
      {!SelectQr ? (
        <Manually navigation={navigation} />
      ) : (
        <QRCode navigation={navigation} />
      )}
      <View style={styles.Container}>
        <View style={styles.content}>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  Container: {
    position: "absolute",
    bottom: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    width: "100%",
    paddingLeft: 10,
    paddingRight: 10,
  },
});
