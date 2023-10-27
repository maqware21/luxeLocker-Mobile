import React, { useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./screens/LoginScreen";
import ForgetPasswordScreen from "./screens/ForgetPasswordScreen";
import ResetPasswordScreen from "./screens/ResetPasswordScreen";
import StorageAccess from "./screens/StorageAccess";
import CreateAccount from "./screens/CreateAccount";
import Personalnfo from "./screens/Personalnfo";
import "react-native-gesture-handler";
import Map from "./screens/index";
import Tab from "../index";
import InsuranceScreen from "./screens/InsuranceScreen";
import SignatureScreen from "./screens/SignatureScreen";
import PersonalInfoEditScreen from "~navigation/tabs/settings/PersonalInfoEditScreen";
import ChangePasswordScreen from "~navigation/tabs/settings/ChangePasswordScreen";
import MarketPlace from "~navigation/tabs/marketPlace/screen";
import BrowsMarketPlace from "~navigation/tabs/marketPlace/screen/BrowsMarketPlace";
import FilterUnits from "~navigation/tabs/myUnits/screen/FilterUnits";
import UnitDetails from "~navigation/tabs/myUnits/screen/UnitDetails";
import UnitBuyScreen from "./screens/UnitBuyScreen";
import CardInfo from "./screens/CardInfo";
import Document from "~navigation/tabs/settings/Document/Index";
import Driverlicense from "~navigation/tabs/settings/Document/Driverlicense";
import UploaloadDriverLicense from "~navigation/tabs/settings/Document/UploaloadDriverLicense";
import InsurancePolicy from "~navigation/tabs/settings/Document/InsurancePolicy";
import UploadInsurancePolicy from "~navigation/tabs/settings/Document/UploadInsurancePolicy";
import Payments from "~navigation/tabs/settings/Payments";
import LockerReady from "./screens/LockerReady";
import PaymentDetail from "~navigation/tabs/settings/Payments/PaymentDetail";
import LeaseAgrement from "~navigation/tabs/settings/Document/LeaseAgrement";
import OwnedUnitDetail from "~navigation/tabs/myUnits/screen/OwnedUnitDetail";
import AddVendor from "~navigation/tabs/vendors/AddVendor";
import AddUser from "~navigation/tabs/myUnits/screen/AddUser";
import dynamicLinks from "@react-native-firebase/dynamic-links";
import VenderDetail from "~navigation/tabs/vendors/VenderDetail";
import AdditionalUserDetail from "~navigation/tabs/myUnits/screen/AdditionalUserDetail";
import Faq from "~navigation/tabs/settings/Faq";
import Notification from "~navigation/tabs/settings/Notification";
import ForgotPasswordCheckEmail from "./screens/ForgotPasswordCheckEmail";
import ManageUnit from "~navigation/tabs/myUnits/screen/ManageUnit";
import ManageUnitPrice from "~navigation/tabs/myUnits/screen/ManageUnitPrice";
import VendorAccessHistory from "~navigation/tabs/vendors/VendorAccessHistory";
import ROIDetails from "~navigation/tabs/myUnits/screen/ROIDetails";
import Notifications from "~navigation/tabs/notifications/Notifications";

const Stack = createStackNavigator();

export default () => {
  useEffect(() => {
    const unsubscribe = dynamicLinks().onLink(handleDynamicLink);
    // When the component is unmounted, remove the listener
    return () => unsubscribe();
  }, []);

  const handleDynamicLink = (link) => {
    // Handle dynamic link inside your own application
    if (link.url === "https://invertase.io/offer") {
      // ...navigate to your offers screen
    }
  };

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, gestureEnabled: false }}
    >
      <Stack.Screen name="map" component={Map} />
      <Stack.Screen name="login" component={LoginScreen} />

      <Stack.Screen
        name="forgotPassword"
        component={ForgetPasswordScreen}
        options={{ header: false }}
      />
      <Stack.Screen name="tabs" component={Tab} options={{ header: false }} />
      <Stack.Screen name="resetPassword" component={ResetPasswordScreen} />
      <Stack.Screen
        name="storageAccess"
        component={StorageAccess}
        options={{ header: false }}
      />
      <Stack.Screen
        name="createAccount"
        component={CreateAccount}
        options={{ header: false }}
      />
      <Stack.Screen
        name="personalInfo"
        component={Personalnfo}
        options={{ header: false }}
      />
      <Stack.Screen
        name="insuranceScreen"
        component={InsuranceScreen}
        options={{ header: false }}
      />
      <Stack.Screen
        name="signature"
        component={SignatureScreen}
        options={{ header: false }}
      />
      <Stack.Screen
        name="personalInfoEditScreen"
        component={PersonalInfoEditScreen}
        options={{ header: false }}
      />
      <Stack.Screen
        name="changePasswordScreen"
        component={ChangePasswordScreen}
        options={{ header: false }}
      />
      <Stack.Screen
        name="marketplace"
        component={MarketPlace}
        options={{ header: false }}
      />
      <Stack.Screen
        name="browsMarketPlace"
        component={BrowsMarketPlace}
        options={{ header: false }}
      />
      <Stack.Screen
        name="filterUnitsScreen"
        component={FilterUnits}
        options={{ header: false }}
      />
      <Stack.Screen
        name="unitDetailScreen"
        component={UnitDetails}
        options={{ header: false }}
      />
      <Stack.Screen
        name="unitBuyScreen"
        component={UnitBuyScreen}
        options={{ header: false }}
      />
      <Stack.Screen
        name="cardInfo"
        component={CardInfo}
        options={{ header: false }}
      />
      <Stack.Screen
        name="document"
        component={Document}
        options={{ header: false }}
      />
      <Stack.Screen
        name="driverlicense"
        component={Driverlicense}
        options={{ header: false }}
      />
      <Stack.Screen
        name="uploaloadDriverLicense"
        component={UploaloadDriverLicense}
        options={{ header: false }}
      />
      <Stack.Screen
        name="insurancePolicy"
        component={InsurancePolicy}
        options={{ header: false }}
      />
      <Stack.Screen
        name="uploadInsurancePolicy"
        component={UploadInsurancePolicy}
        options={{ header: false }}
      />
      <Stack.Screen
        name="payment"
        component={Payments}
        options={{ header: false }}
      />
      <Stack.Screen
        name="lockerReady"
        component={LockerReady}
        options={{ header: false }}
      />
      <Stack.Screen
        name="paymentDetail"
        component={PaymentDetail}
        options={{ header: false }}
      />
      <Stack.Screen
        name="leaseAgrement"
        component={LeaseAgrement}
        options={{ header: false }}
      />
      <Stack.Screen
        name="ownedUnitDetail"
        component={OwnedUnitDetail}
        options={{ header: false }}
      />
      <Stack.Screen
        name="manageUnit"
        component={ManageUnit}
        options={{ header: false }}
      />
      <Stack.Screen
        name="manageUnitPrice"
        component={ManageUnitPrice}
        options={{ header: false }}
      />
      <Stack.Screen
        name="addVendor"
        component={AddVendor}
        options={{ header: false }}
      />
      <Stack.Screen
        name="venderDetail"
        component={VenderDetail}
        options={{ header: false }}
      />
      <Stack.Screen
        name="vendorAccessHistory"
        component={VendorAccessHistory}
        options={{ header: false }}
      />
      <Stack.Screen
        name="ROIDetails"
        component={ROIDetails}
        options={{ header: false }}
      />
      <Stack.Screen
        name="additionalUser"
        component={AddUser}
        options={{ header: false }}
      />
      <Stack.Screen
        name="additionalUserDetail"
        component={AdditionalUserDetail}
        options={{ header: false }}
      />
      <Stack.Screen
        name="notifications"
        component={Notifications}
        options={{ header: false }}
      />
      <Stack.Screen
        name="forgotPasswordCheckEmail"
        component={ForgotPasswordCheckEmail}
        options={{ header: false }}
      />
      <Stack.Screen
        name="notification"
        component={Notification}
        options={{ header: false }}
      />
      <Stack.Screen name="faq" component={Faq} options={{ header: false }} />
    </Stack.Navigator>
  );
};
