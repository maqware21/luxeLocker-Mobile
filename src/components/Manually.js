import React,{useState,useEffect} from 'react';
import { Text, View,ImageBackground,StyleSheet,Image,TextInput,TouchableOpacity } from 'react-native';
import Colors from '~utils/Colors';
import { Camera} from 'react-native-vision-camera';
import { CommonActions } from "@react-navigation/native";
import AssetImages from '~assets';

export default ({ navigation }) => {

   const [hasPermission, setHasPermission] = useState(false);
  const [frameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.QR_CODE], {
    checkInverted: true,
  });

   const devices = useCameraDevices();
   const device = devices.back;

useEffect(() => {
  (async () => {
    const status = await Camera.requestCameraPermission();
    setHasPermission(status === 'authorized');
  })();
}, []);

const gotoBack = () => {
  navigation.dispatch(CommonActions.goBack());
};

    return(
          <ImageBackground source={AssetImages.access} style={styles.backImg}> 
           <View style={{flex:1}}>
          <View style={styles.iconOuterContainer}>
            <TouchableOpacity onPress={gotoBack} style={[styles.iconContainer, {backgroundColor:Colors.white}]}>
              <Image source={AssetImages.closeIcon} style={[styles.icon, {tintColor:Colors.grayFont}]} />
              </TouchableOpacity>
             </View>
             <View style={styles.contentOuterConatiner}>
            <View style={styles.contentInnerConatiner}>
               <Text style={styles.heading}>
                {'Enter Storage ID'}
               </Text>
               <Text style={styles.description}>
                {'Lorem Ipsum is simply dummy text of the printing and typesetting industry'}
               </Text>
               <View style={styles.storageOuterContainer}>
                <Text style={styles.storageIdLabel}>{'Storage ID'}</Text>
                <View style={styles.storageInnerContainer}>
                <TextInput
                placeholder='Storage ID'
                style={{width:"80%"}}
                />
                <View style={[styles.iconContainer, {backgroundColor:Colors.primaryButtonBackgroundColor}]}>
              <Image source={AssetImages.check} style={[styles.icon, {tintColor:Colors.white}]} />
              </View>
                </View>
              </View>
             </View>
              </View>
           </View>
        </ImageBackground>
      )
}

const styles = StyleSheet.create({ 
  heading:{
    color:Colors.white,
    fontFamily:"Inter",
    fontSize:17,
    fontWeight:"500",
    letterSpacing:0,
    lineHeight:24,
    textAlign:"center"
 },
backImg: { 
  height: "100%", 
  width: "100%" 
},
iconOuterContainer: { 
  width: "100%", 
  padding: 14,
  marginTop: 50 
},
iconContainer: {
  justifyContent: "center", 
  alignItems: "center", 
  height: 24, 
  width: 24,
  borderRadius: 24 / 2,
},
contentOuterConatiner: { 
  width: "100%", 
  justifyContent: "center", 
  alignItems: "center" 
},
contentInnerConatiner: { 
  marginTop: 106, 
  alignItems: "center", 
  justifyContent: "center", 
  width: "75%" 
},
storageOuterContainer: { 
  marginTop: 96, 
  backgroundColor: Colors.white, 
  width: "100%", 
  padding: 14, 
  borderRadius: 10 
},
storageInnerContainer: { 
  marginTop: 6, 
  flexDirection: "row", 
  justifyContent: "space-between" 
},
icon:{
  width: 14, 
  height: 14,
},
 description:{
  color:Colors.white,
  marginTop:6,
  fontFamily:"Inter",
  fontSize:13,
  fontWeight:"500",
  letterSpacing:0,
  lineHeight:20,
  textAlign:"center"
 },
 storageIdLabel:{
  color:"#0F0F14",
  fontFamily:"Inter",
  fontSize:11,
  letterSpacing:0,
  lineHeight:14
 },
 
})