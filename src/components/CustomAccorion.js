import React, { Component } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  Linking,
  Image,
  Dimensions,
} from "react-native";
import Colors from "~utils/Colors";
import * as Animatable from "react-native-animatable";
import Accordion from "react-native-collapsible/Accordion";
import AssetImages from "~assets";
import RenderHtml, {
  HTMLContentModel,
  defaultHTMLElementModels,
} from "react-native-render-html";

const renderersProps = {
  a: {
    onPress: onPress,
  },
};

function onPress(event, href) {
  Linking.canOpenURL(href)
    .then((supported) => {
      if (supported) {
        Linking.openURL(href);
      }
    })
    .catch((err) => {
      console.log("err", err);
    });
}

const customHTMLElementModels = {
  img: defaultHTMLElementModels.img.extend({
    contentModel: HTMLContentModel.mixed,
  }),
};

const tagsStyles = {
  body: {
    whiteSpace: "normal",
    color: Colors.grayFont,
    fontFamily: "Inter",
    fontSize: 11,
    width: "93%"
  },
  a: {
    color: "blue",
  },
  p: {
    whiteSpace: "normal",
    color: Colors.grayFont,
    fontFamily: "Inter",
    fontSize: 11,
  },
  u: {
    whiteSpace: "normal",
    color: Colors.grayFont,
    fontFamily: "Inter",
    fontSize: 11,
  },
};

const screenWidth = Dimensions.get('window').width;
const animatableDuration = 400;
const borderBottomRadiusValue = 10;

export default class CustomeAccorian extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: props?.data,
      expanded: props?.data?.expanded,
      childExtend: props?.data?.expanded,
      activeSections: [],
      contentWidth: screenWidth,
    };
    if (Platform.OS === "android") {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }

  render() {
    const { data, expanded, activeSections } = this.state;
    return (
      <View style={styles.faqItem}>
        <TouchableOpacity
          style={styles.row}
          onPress={this.toggleExpand}
        >
          <Text style={[styles.title]}>{data?.name}</Text>
          <Image
            source={expanded ? AssetImages.up : AssetImages.down}
            style={styles.downImage}
          />
        </TouchableOpacity>
        <View style={styles.faqNestedItem}>
          {expanded && (
            <Accordion
              activeSections={activeSections}
              sections={data?.faqs}
              touchableComponent={TouchableOpacity}
              expandMultiple={false}
              renderHeader={this.renderHeader}
              renderContent={this.renderContent}
              duration={animatableDuration}
              onChange={this.setSections}
            />
          )}
        </View>
      </View>
    );
  }

  setSections = (sections) => {
    //setting up a active section state
    this.setState({
      activeSections: sections.includes(undefined) ? [] : sections,
    });
  };
  renderHeader = (section, _, isActive) => {
    //Accordion Header view
    return (
      <View style={styles.contentConatiner}>
        <Animatable.View
          duration={animatableDuration}
          style={[
            styles.collapsedContainer,
            !isActive
              ? {
                borderBottomWidth: 1,
                borderBottomColor: Colors.borderBottomColor,
                borderRadius: borderBottomRadiusValue,
              }
              : { borderTopRightRadius: borderBottomRadiusValue, borderTopLeftRadius: borderBottomRadiusValue },
          ]}
          transition="backgroundColor"
        >
          <Text style={styles.title}>{section?.question}</Text>
          <Image
            source={isActive ? AssetImages.up : AssetImages.down}
            style={styles.downImage}
          />
        </Animatable.View>
      </View>
    );
  };
  renderContent = (section, _, isActive) => {

    const source = {
      html: section?.image_name !== null ?
        `${section?.answer}`
        : `${section?.answer}`,
    };
    return (
      <View style={styles.contentConatiner}>
        <Animatable.View
          duration={animatableDuration}
          transition="backgroundColor"
          style={styles.contentAnimatedView}
        >
          <View style={styles.contentInnerContainer}>
            <RenderHtml
              source={source}
              tagsStyles={tagsStyles}
              customHTMLElementModels={customHTMLElementModels}
              renderersProps={renderersProps}
              contentWidth={this.state.contentWidth}
            />
          </View>
          <Image
            style={styles.faqImage}
            source={{
              uri: `${section?.image_url}/${section?.image_name}`,
            }}
            resizeMode="contain"
          />
        </Animatable.View>
      </View>
    );
  };
  toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    this.setState({ expanded: !this.state.expanded });
  };
  toggleChildExpend = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    this.setState({ childExtend: !this.state.childExtend });
  };
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  contentConatiner: { justifyContent: "center", alignItems: "flex-end" },
  contentAnimatedView: {
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: Colors.inputBackgroundColor,
    borderBottomRightRadius: borderBottomRadiusValue,
    borderBottomLeftRadius: borderBottomRadiusValue,
    width: "93%",
    paddingHorizontal: 10,
  },
  contentInnerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomRightRadius: borderBottomRadiusValue,
    borderBottomLeftRadius: borderBottomRadiusValue,
    width: "100%",
  },
  faqImage:{
    width: "100%",
    height: 250,
  },
  faqItem: {
    flexDirection: "column",
    alignItems: "center",
  },
  faqNestedItem: {
    width: "100%",
  },
  title: {
    color: Colors.white,
    fontFamily: "Inter-Medium",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 20,
    width: "95%",
    marginRight: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: Colors.inputBackgroundColor,
    borderRadius: 10,
    marginTop: 10,
    width: "100%"
  },
  collapsedContainer: {
    width: "93%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: Colors.inputBackgroundColor,
    marginTop: 10,
  },
  downImage: {
    height: 14,
    width: 14,
    padding: 8,
    tintColor: Colors.grayFont,
  },
});
