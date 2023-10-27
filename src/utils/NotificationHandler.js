import { navigationRef } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

const handleNotificationPress = async (userData) => {
        const user = await AsyncStorage.getItem("isLoggedIn");
        let userObj = {
                unit_id: userData?.unit_id,
                user_id: userData?.user_id,
        }
        if (JSON.parse(user)) {
                navigationRef.current?.navigate("ownedUnitDetail", {
                        unit: userObj,
                        fromBuy: false,
                });
        } else {
                navigationRef.current?.navigate('login', { userAccess: userObj });
        }
};

export default handleNotificationPress;