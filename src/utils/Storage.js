import AsyncStorage from "@react-native-async-storage/async-storage";


export default class Storage {
  /* Serves as an abstraction on top of AsyncStorage
  */
  static keys = {
    AUTH_TOKEN: 'AUTH_TOKEN',
    USER_DATA: 'USER_DATA',
  }

  static _parseData = (data) => {
    try {
      return JSON.parse(data);
    } catch (e) {
      return data;
    }
  }

  static _prepareData = (data) => {
    try {
      return JSON.stringify(data);
    } catch (e) {
      return data;
    }
  }

  static getItem = async (key) => {
    const data = await AsyncStorage.getItem(key);
    return this._parseData(data);
  }

  static setItem = async (key, data) => {
    data = this._prepareData(data);
    return await AsyncStorage.setItem(key, data);
  }

  static removeItem = async (key) => {
    return await AsyncStorage.removeItem(key);
  }

  static clear = async () => {
    return await AsyncStorage.clear();
  }
}
