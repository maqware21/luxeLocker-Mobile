import React from "react";
import {
  Text,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Colors from "~utils/Colors";
import Modal from "react-native-modal";
import Styles from "~utils/Style/Styles";

export default ({
  icon,
  isVisible,
  title,
  onPress,
  des,
  primaryButtonText,
  secondaryButtonText,
  secondaryButtonOnPress,
  pimaryButtonColor,
}) => {

  // Title
  const renderTitle = title ? <Text style={styles.title}>{title}</Text> : null;
  // Description
  const renderDes = des ? <Text style={styles.des}>{des}</Text> : null

  // Secondary Button
  const renderSecondaryButton = secondaryButtonText ? (
    <TouchableOpacity
      label={primaryButtonText}
      style={[
        Styles.PrimaryButton,
        pimaryButtonColor
          ? { backgroundColor: pimaryButtonColor }
          : null,
      ]}
      onPress={secondaryButtonOnPress && secondaryButtonOnPress}
    >
      <Text style={Styles.primaryButtonText}>
        {secondaryButtonText}
      </Text>
    </TouchableOpacity>
  ) : null;

  return (
    <View>
      <Modal isVisible={isVisible}>
        <View style={styles.Container}>
          <View style={styles.content}>
            <Image source={icon} style={styles.iamge} />
            {renderTitle}
            <View style={styles.desContainer}>
              {renderDes}
              <View style={[styles.buttonContainer, pimaryButtonColor]}>
                {renderSecondaryButton}
                <View style={{ marginTop: 10 }}>
                  <TouchableOpacity
                    label={primaryButtonText}
                    style={[
                      Styles.PrimaryButton,
                      { backgroundColor: pimaryButtonColor },
                    ]}
                    onPress={onPress && onPress}
                  >
                    <Text
                      style={[
                        Styles.primaryButtonText,
                        {
                          color: Colors.primaryButtonBackgroundColor,
                          fontWeight: "600",
                        },
                      ]}
                    >
                      {primaryButtonText}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  Container: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: {
    height: 320,
    width: 260,
    backgroundColor: Colors.inputBackgroundColor,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  iamge: { width: 90, height: 80 },
  title: {
    color: Colors.white,
    marginTop: 10,
    fontSize: 17,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 20,
    marginLeft: 20,
    marginRight: 20,
  },
  desContainer: { marginTop: 10, width: "80%", alignItems: "center" },
  des: {
    color: Colors.grayFont,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    width: 150,
  },
  buttonContainer: { width: "100%", marginTop: 20 },
});
