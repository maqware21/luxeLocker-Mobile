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
import SecondaryButton from "./SecondaryButton";
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
  crossIconPress,
}) => {

    const renderCrossIcon = crossIconPress ? (
      <TouchableOpacity
        style={styles.crossIconContainer}
        onPress={crossIconPress}
      >
        <Text style={styles.crossIcon}>
          &#10006;
        </Text>
      </TouchableOpacity>
    ) : null; 

  const renderTitle = title ? <Text style={styles.title}>{title}</Text> : null;
  const renderDes = des ? <Text style={styles.des}>{des}</Text> : null;

  const renderSecondaryButton = secondaryButtonText ? (
    <SecondaryButton
      label={secondaryButtonText}
      onPress={secondaryButtonOnPress && secondaryButtonOnPress}
    />
  ) : null;

  return (
    <View>
      <Modal isVisible={isVisible}>
        <View style={styles.Container}>
          <View style={styles.content}>
            {renderCrossIcon}
            <Image source={icon} style={styles.iamge} />
            {renderTitle}
            <View style={styles.desContainer}>
              {renderDes}
              {secondaryButtonText === "Yes" && primaryButtonText === "No" ? (
                <View style={[styles.buttonContainer, pimaryButtonColor]}>
                  <View style={{ marginTop: 10 }}>
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
                  </View>
                  {secondaryButtonText ? (
                    <View style={{ marginTop: 10 }}>
                      <SecondaryButton
                        label={primaryButtonText}
                        onPress={onPress && onPress}
                      />
                    </View>
                  ) : null}
                </View>
              ) : (
              <View style={[styles.buttonContainer, pimaryButtonColor]}>
                {renderSecondaryButton}
                <View style={{ marginTop: 10 }}>
                  <TouchableOpacity
                    label={primaryButtonText}
                    style={[
                      Styles.PrimaryButton,
                      pimaryButtonColor
                        ? { backgroundColor: pimaryButtonColor }
                        : null,
                    ]}
                    onPress={onPress && onPress}
                  >
                    <Text style={Styles.primaryButtonText}>
                      {primaryButtonText}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  Container: { flex: 1, alignItems: "center", justifyContent: "center" },
  crossIconContainer: {
    position: "absolute",
    right: 10,
    top: 10,
    marginLeft: 20,
    marginBottom: 20,
    backgroundColor: Colors.primaryButtonBackgroundColor,
    height: 20,
    width: 20,
    borderRadius: 20 / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  crossIcon: {
    color: "black",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 13,
  },
  content: {
    width: "75%",
    padding: 20,
    backgroundColor: Colors.inputBackgroundColor,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  iamge: { width: 90, height: 70 },
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
  desContainer: { marginTop: 10, width: "100%", alignItems: "center" },
  des: {
    color: Colors.grayFont,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    width: 150,
  },
  buttonContainer: { width: "100%", marginTop: 20 },
});
