import React, { Fragment } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Colors from "~utils/Colors";
import Units from "./tabs/myUnits/screen/index";
import MarketPlace from "./tabs/marketPlace/screen";
import Settings from "./tabs/settings";
import Vendors from "./tabs/vendors";
import { Image } from "react-native";
import { useSelector } from "react-redux";
import AssetImages from "~assets";

const Tabs = createBottomTabNavigator();

export default () => {
  const user = useSelector((state) => state?.authUser?.authUser);
  return (
    <Tabs.Navigator
      screenOptions={{
        scrollEnabled: true,
        keyboardHidesTabBar: true,
        tabBarStyle: {
          backgroundColor: Colors.inputBackgroundColor,
        },
        safeAreaInsets: {
          bottom: 0,
        },
        Headers: false,
        tabBarActiveTintColor: "#f1c522",
        tabBarInactiveTintColor: "#85878D",
        tabStyle: {
          backgroundColor: Colors.inputBackgroundColor,
        },
      }}
    >
      <Tabs.Screen
        name="MyUnits"
        component={Units}
        options={{
          headerShown: false,
          tabBarLabel: "MY UNITS",
          tabBarIcon: ({ focused, color, size }) => (
            <Image
              source={AssetImages.units}
              style={{ height: 25, width: 25, tintColor: color }}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="MarketPlace"
        component={MarketPlace}
        options={{
          unmountOnBlur: true,
          headerShown: false,
          tabBarLabel: "MARKETPLACE",
          tabBarIcon: ({ focused, color, size }) => (
            <Image
              source={AssetImages.market}
              style={{ height: 25, width: 25, tintColor: color }}
            />
          ),
        }}
      />
      {user?.first_login == null ? (
        <Fragment>
          <Tabs.Screen
            name="Vendors"
            component={Vendors}
            options={{
              headerShown: false,
              tabBarLabel: "VENDORS",
              tabBarIcon: ({ focused, color, size }) => (
                <Image
                  source={AssetImages.vendor}
                  style={{ height: 25, width: 25, tintColor: color }}
                />
              ),
            }}
          />
        </Fragment>
      ) : null}
      <Fragment>
        <Tabs.Screen
          name="Setting"
          component={Settings}
          options={{
            headerShown: false,
            tabBarLabel: "SETTINGS",
            tabBarIcon: ({ focused, color, size }) => (
              <Image
                source={AssetImages.setting}
                style={{ height: 25, width: 25, tintColor: color }}
              />
            ),
          }}
        />
      </Fragment>
    </Tabs.Navigator>
  );
};
