import { CommonActions } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import { BackHandler, View, StyleSheet } from "react-native";
import AuthenticationContainer from "~components/AuthenticationContainer";
import SimpleHeader from "~components/SimpleHeader";
import Colors from "~utils/Colors";
import CustomeAccorian from "~components/CustomAccorion";
import { fetFaqCategories } from "~utils/Network/api";
import { useSelector } from "react-redux";
import { ScrollView } from "react-native-gesture-handler";
import LoadingOverlay from "~components/LoadingOverlay";
export default ({ navigation }) => {
  const user = useSelector((state) => state?.authUser?.authUser);
  const [loading, setLoading] = useState(false);
  const [faq, setFaq] = useState([]);

  const gotoBack = () => {
    navigation.dispatch(CommonActions.goBack());
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", gotoBack);
    return () => {
      BackHandler.removeEventListener("hardwareBackPress", gotoBack);
    };
  }, []);

  useEffect(() => {
    fetchfaqCategoriesHandler();
  }, []);
  fetchfaqCategoriesHandler = async () => {
    setLoading(true)
    await fetFaqCategories(user?.token?.access)
      .then((res) => {
        setLoading(false);
        if (res?.data?.data?.length > 0) {
          setFaq(res.data.data);
        }
      })
      .catch((error) => {
        setLoading(false);
      });
  };

  const faqs = faq?.map((item, index) => (
    <CustomeAccorian key={`${index}`} data={item} />
  ))

  return (
    <AuthenticationContainer style={{ flex: 1 }}>
      <SimpleHeader
        headerLabel={"FAQ"}
        backgroundColor={Colors.inputBackgroundColor}
        backIcon={true}
        onPress={gotoBack}
      />
      {loading ? <LoadingOverlay /> : (
      <View style={styles.faqContainer}>
        <ScrollView  nestedScrollEnabled={true} showsVerticalScrollIndicator={false}>
          {faqs}
        </ScrollView>
      </View>
      )}
    </AuthenticationContainer>
  );
};

const styles = StyleSheet.create({
  faqContainer: { flex: 1, width: "100%", paddingHorizontal: 16, paddingVertical: 5 },
});

