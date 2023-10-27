import { StyleSheet, Dimensions, Platform } from "react-native";

// Utils
import Colors from "../Colors";

export default StyleSheet.create({
  headerTitleStyle: {
    fontWeight: "bold",
    fontSize: 36,
    color: Colors.fontColor,
    textAlignVertical: "bottom",
  },
  darkOverlayStyle: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.pointEightyFiveBlack,
  },
  overlayStyle: {
    height: Dimensions.get("window").height * 0.4,
    width: Dimensions.get("window").width * 0.8,
    overflow: "hidden",
  },
  loadingViewStyle: {
    flexDirection: "row",
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    backgroundColor: Colors.pointEightyFiveBlack,
  },
  faqChoiceBlockStyle: {
    width: "47.5%",
    paddingVertical: 10,
    backgroundColor: Colors.pointFiveBlack,
    borderWidth: 1,
    borderColor: Colors.pointFiveBlack,
    borderRadius: 10,
  },
  textInputStyle: {
    fontSize: 16,
    color: Colors.fontColor,
    borderRadius: 8,
    paddingVertical: Platform.OS == "ios" ? 12 : 0,
    paddingHorizontal: Platform.OS == "ios" ? 12 : 10,
    width: "99%",
    height: 40,
  },

  textInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.inputBackgroundColor,
    borderRadius: 8,
  },
  contryFlagContainer: { borderRadius: 11, height: 22, width: 22 },
  primaryButtonText: {
    fontFamily: "Inter-Medium",
    fontSize: 13,
    textAlign: "center",
    color: Colors.primaryButtonTextColor,
  },
  contryText: {
    color: Colors.white,
    fontFamily: "Inter-Regular",
    marginLeft: 15,
  },
  icon: {
    tintColor: Colors.grayFont,
    height: 20,
    width: 20,
  },
  secondaryButtonText: {
    fontFamily: "Inter-Medium",
    fontSize: 13,
    textAlign: "center",
    color: Colors.primaryButtonBackgroundColor,
  },

  PrimaryButton: {
    backgroundColor: Colors.primaryButtonBackgroundColor,
    padding: Platform.OS == "ios" ? 15 : 12,
    borderRadius: 8,
    alignItems: "center",
    fontWeight: "500",
    justifyContent: "center",
    width: "100%",
  },
  secondaryButton: {
    backgroundColor: Colors.backgroundColor,
    padding: Platform.OS == "ios" ? 15 : 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.primaryButtonBackgroundColor,
  },
  headingStyle: {
    color: Colors.white,
    fontFamily: "Inter",
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 0,
    lineHeight: 24,
  },
  nameHeader: {
    color: Colors.white,
    fontFamily: "Inter-Medium",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 20,
  },
  purposeNameHeader: {
    color: Colors.white,
    fontFamily: "Inter-Medium",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 20,
    width: "20%"
  },
  description: {
    color: Colors.grayFont,
    fontFamily: "Inter",
    fontSize: 13,
    fontWeight: "500",
  },
  purposeDescription: {
    color: Colors.grayFont,
    fontFamily: "Inter",
    fontSize: 13,
    fontWeight: "500",
    textAlign: "left"
  },

  inputLabel: { color: Colors.white, fontFamily: "Inter-Regular", marginBottom: 6 },
  doneBtn: { color: Colors.white, fontFamily: "Inter-Bold" },
  errorText: { color: Colors.red, marginTop: 10 },
});
