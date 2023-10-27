// Library Imports
import axios from "axios";
import {
  getHeaderWithAuthToken,
  getHeaderWithAuthTokenImage,
} from "~utils/Helpers";

import { Platform } from "react-native";

// Local Imports
import { baseUrl, endPoints } from "./constants";

//************************* AUTH API'S *******************************//
export const loginCall = (payload) => {
  if (Platform.OS == "android") {
    axios.defaults.headers = {
      Accept: "application/json",
      "Content-Type": "multipart/form-data",
    };
  } else {
    axios.defaults.headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
  }

  return axios.post(`${baseUrl}/${endPoints.login}`, payload);
};
export const registerCall = (payload) =>
  axios.post(`${baseUrl}/${endPoints.register}`, payload);

export const changePasswordCall = (payload, token) => {
  axios.defaults.headers = getHeaderWithAuthToken(token);
  return axios.post(`${baseUrl}/${endPoints.changePassword}`, payload);
};

export const editProfileCall = (payload, token) => {
  axios.defaults.headers = getHeaderWithAuthToken(token);
  return axios.post(`${baseUrl}/${endPoints.editProfile}`, payload);
};

export const fetchProfileCall = (token) => {
  axios.defaults.headers = getHeaderWithAuthToken(token);
  return axios.get(`${baseUrl}/${endPoints.editProfile}`);
};

export const validateEmailCall = (payload) => {
    axios.defaults.headers = {
      Accept: "application/json",
      "Content-Type": "multipart/form-data",
    };

  return axios.post(`${baseUrl}/${endPoints.validateEmail}`, payload);
};

export const zoneCall = (token) => {
  if (Platform.OS == "android") {
    axios.defaults.headers = {
      Accept: "application/json",
      "Content-Type": "multipart/form-data",
    };
  } else {
    axios.defaults.headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
  }

  return axios.get(`${baseUrl}/${endPoints.getZones}`);
};

export const stateCall = () => {
  if (Platform.OS == "android") {
    axios.defaults.headers = {
      Accept: "application/json",
      "Content-Type": "multipart/form-data",
    };
  } else {
    axios.defaults.headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
  }

  return axios.get(`${baseUrl}/${endPoints.getState}`);
};

export const cityCall = (payload) => {
  if (Platform.OS == "android") {
    axios.defaults.headers = {
      Accept: "application/json",
      "Content-Type": "multipart/form-data",
    };
  } else {
    axios.defaults.headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
  }

  return axios.post(`${baseUrl}/${endPoints.getState}`, payload);
};

export const availableCampusCall = () => {
  if (Platform.OS == "android") {
    axios.defaults.headers = {
      Accept: "application/json",
      "Content-Type": "multipart/form-data",
    };
  } else {
    axios.defaults.headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
  }

  return axios.get(`${baseUrl}/${endPoints.availableCampus}`);
};

export const availableUnitCall = (campusId, commaSeparatedLength) => {
  if (Platform.OS == "android") {
    axios.defaults.headers = {
      Accept: "application/json",
      "Content-Type": "multipart/form-data",
    };
  } else {
    axios.defaults.headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
  }
  if (typeof commaSeparatedLength !== "undefined") {
    return axios.get(
      `${baseUrl}/${endPoints.availableUnits}${campusId}?length=${commaSeparatedLength}`
    );
  } else {
    return axios.get(`${baseUrl}/${endPoints.availableUnits}${campusId}`);
  }
};

export const availableUnitDetailCall = (unitId) => {
  if (Platform.OS == "android") {
    axios.defaults.headers = {
      Accept: "application/json",
      "Content-Type": "multipart/form-data",
    };
  } else {
    axios.defaults.headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
  }

  return axios.get(`${baseUrl}/${endPoints.unitDetail}${unitId}`);
};

export const addWaitingListCall = (payload) => {
  if (Platform.OS == "android") {
    axios.defaults.headers = {
      Accept: "application/json",
      "Content-Type": "multipart/form-data",
    };
  } else {
    axios.defaults.headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
  }

  return axios.post(`${baseUrl}/${endPoints.waitingList}`, payload);
};

export const addWaitingListCallForRegisterUser = (payload, token) => {
  axios.defaults.headers = getHeaderWithAuthTokenImage(token);
  return axios.post(`${baseUrl}/${endPoints.registerWaitlist}`, payload);
};

export const addWaitingRegisterListCall = (payload) => {
  axios.defaults.headers = getHeaderWithAuthTokenImage(token);
  return axios.post(`${baseUrl}/${endPoints.registerWaitlist}`, payload);
};
export const retrieveStrogeIdCall = (payload) => {
  return axios.post(
    `${baseUrl}${endPoints.retrieveStrogeId}`,
    JSON.stringify(payload)
  );
};

export const uploadInsuranceDousCall = (payload, token) => {
  axios.defaults.headers = getHeaderWithAuthTokenImage(token);
  return axios.post(`${baseUrl}/${endPoints.insuranceUpload}`, payload);
};
export const AddCard = (payload, token) => {
  axios.defaults.headers = getHeaderWithAuthToken(token);
  return axios.post(`${baseUrl}/${endPoints.addCard}`, payload);
};
export const AddVendorCall = (payload, token, id) => {
  axios.defaults.headers = getHeaderWithAuthToken(token);
  return axios.post(`${baseUrl}/${endPoints.fetchVendor}${id}/`, payload);
};
export const AddCardCall = (payload, token) => {
  axios.defaults.headers = getHeaderWithAuthToken(token);
  return axios.post(`${baseUrl}/${endPoints.addCardForSetting}`, payload);
};
export const getProfileStageCall = (token) => {
  axios.defaults.headers = getHeaderWithAuthToken(token);
  return axios.get(`${baseUrl}/${endPoints.getProfileStage}`);
};
export const uploadDrivingLicenseCall = (payload, token) => {
  axios.defaults.headers = {
    Accept: "application/json",
    "Content-Type": "multipart/form-data",
    Authorization: `Bearer ${token}`,
  };
  return axios.post(`${baseUrl}/${endPoints.uploadDrivingLicense}`, payload);
};
export const uploadInsurancePolicyCall = (payload, token) => {
  axios.defaults.headers = {
    Accept: "application/json",
    "Content-Type": "multipart/form-data",
    Authorization: `Bearer ${token}`,
  };
  return axios.post(`${baseUrl}/${endPoints.uploadInsurancePolicy}`, payload);
};
export const getInsurancePolicyCall = (token) => {
  axios.defaults.headers = getHeaderWithAuthToken(token);
  return axios.get(`${baseUrl}/${endPoints.uploadInsurancePolicy}`);
};
export const getDrivingLicenseCall = (token) => {
  axios.defaults.headers = getHeaderWithAuthToken(token);
  return axios.get(`${baseUrl}/${endPoints.getDrivingLicense}`);
};
export const getCardListingCall = (token) => {
  axios.defaults.headers = getHeaderWithAuthToken(token);
  return axios.get(`${baseUrl}/${endPoints.getCardList}`);
};

export const getAllPaymentHistoryCall = (token) => {
  axios.defaults.headers = getHeaderWithAuthToken(token);
  return axios.get(`${baseUrl}/${endPoints.getPaymentHistory}`);
};

export const deleteCardCall = (payload, token) => {
  axios.defaults.headers = getHeaderWithAuthToken(token);
  return axios.post(`${baseUrl}/${endPoints.deleteCard}`, payload);
};
export const getAllPaymentDetailCall = (token, id) => {
  axios.defaults.headers = getHeaderWithAuthToken(token);
  return axios.get(`${baseUrl}/${endPoints.getPaymentHistory}${id}/`);
};

export const getAllAgrementCall = (token) => {
  axios.defaults.headers = getHeaderWithAuthToken(token);
  return axios.get(`${baseUrl}/${endPoints.getAgrement}`);
};
export const fetchAllUnitCall = (token) => {
  axios.defaults.headers = getHeaderWithAuthToken(token);
  return axios.get(`${baseUrl}/${endPoints.fetchUnit}`);
};
export const UnitDetaiCall = (token, unitId) => {
  axios.defaults.headers = getHeaderWithAuthToken(token);
  return axios.get(`${baseUrl}/${endPoints.fetchUnitDetail}${unitId}/`);
};

export const fetchVendorCall = (token, unitId) => {
  axios.defaults.headers = getHeaderWithAuthToken(token);
  return axios.get(`${baseUrl}/${endPoints.fetchVendor}${unitId}/`);
};
export const fetchVendorDetailCall = (token, unitId, venderId) => {
  axios.defaults.headers = getHeaderWithAuthToken(token);
  return axios.get(
    `${baseUrl}${endPoints.fetchVendorDetail}${unitId}/${venderId}/`
  );
};
export const updateVendorDetailCall = (token, unitId, venderId, payload) => {
  axios.defaults.headers = getHeaderWithAuthToken(token);
  return axios.patch(
    `${baseUrl}${endPoints.fetchVendorDetail}${unitId}/${venderId}/`,
    payload
  );
};

export const fetchUserCall = (token, unitId) => {
  axios.defaults.headers = getHeaderWithAuthToken(token);
  return axios.get(`${baseUrl}/${endPoints.fetchUser}${unitId}/`);
};
export const fetchUserDetailCall = (token, unitId, userId) => {
  axios.defaults.headers = getHeaderWithAuthToken(token);
  return axios.get(
    `${baseUrl}${endPoints.fetchUserDetail}/${unitId}/${userId}/`
  );
};
export const updateUserDetailCall = (token, unitId, userId, payload) => {
  axios.defaults.headers = getHeaderWithAuthToken(token);
  return axios.patch(
    `${baseUrl}${endPoints.fetchUserDetail}/${unitId}/${userId}/`,
    payload
  );
};

export const AddUserCall = (payload, token, id) => {
  axios.defaults.headers = getHeaderWithAuthToken(token);
  return axios.post(`${baseUrl}/${endPoints.fetchUser}${id}/`, payload);
};

export const fetchMonthlyPaymentHistoryCall = (token, unitId) => {
  axios.defaults.headers = getHeaderWithAuthToken(token);
  return axios.get(`${baseUrl}/${endPoints.fetchPaymentHistory}/${unitId}/`);
};

export const addUnitForRegisteredUserCall = (payload, token, id) => {
  axios.defaults.headers = getHeaderWithAuthToken(token);
  return axios.post(`${baseUrl}/${endPoints.registerUnit}${id}/`, payload);
};
export const addInsurancePolicyForRegisterUser = (payload, token) => {
  axios.defaults.headers = {
    Accept: "application/json",
    "Content-Type": "multipart/form-data",
    Authorization: `Bearer ${token}`,
  };
  return axios.post(
    `${baseUrl}/${endPoints.insuranceForRegistedUser}/`,
    payload
  );
};
export const addPaymentForRegistedUser = (token, unitId) => {
  axios.defaults.headers = getHeaderWithAuthToken(token);
  return axios.post(`${baseUrl}/${endPoints.paymentConfirmation}/${unitId}/`);
};

export const fetFaqCategories = (token) => {
  axios.defaults.headers = getHeaderWithAuthToken(token);
  return axios.get(`${baseUrl}/${endPoints.getfaqsCategories}/`);
};
export const getNotificationSetting = (token) => {
  axios.defaults.headers = getHeaderWithAuthToken(token);
  return axios.get(`${baseUrl}/${endPoints.fetchNotificationSetting}/`);
};

export const forGotPassword = (payload) => {
  if (Platform.OS == "android") {
    axios.defaults.headers = {
      Accept: "application/json",
      "Content-Type": "multipart/form-data",
    };
  } else {
    axios.defaults.headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
  }

  return axios.post(`${baseUrl}/${endPoints.forgotPassword}/`, payload);
};

export const openCampusGateCall = (payload, token, unitId) => {
  return axios.post(
    `${baseUrl}/${endPoints.openCampusGate}/${unitId}/`,
    payload
  );
};

export const openCloseUnitCall = (payload, token, unitId) => {
  axios.defaults.headers = getHeaderWithAuthToken(token);
  axios.defaults.headers = getHeaderWithAuthToken(token);
  return axios.post(
    `${baseUrl}/${endPoints.openCloseUnit}/${unitId}/`,
    payload
  );
};

export const sellUnitCall = (payload, token, unitId) => {
  axios.defaults.headers = getHeaderWithAuthToken(token);
  return axios.post(`${baseUrl}/${endPoints.sellUnit}/${unitId}/`, payload);
};

export const leaseUnitCall = (payload, token, unitId) => {
  axios.defaults.headers = getHeaderWithAuthToken(token);
  return axios.post(`${baseUrl}/${endPoints.leaseUnit}/${unitId}/`, payload);
};

export const getAllVendors = (token, name) => {
  axios.defaults.headers = getHeaderWithAuthToken(token);
  const endPoint = name
    ? endPoints.getAllVendors + "/?name=" + name
    : endPoints.getAllVendors + "/";
  return axios.get(`${baseUrl}/${endPoint}`);
};

export const roiDetailCall = (payload, token, unitId) => {
  axios.defaults.headers = getHeaderWithAuthToken(token);
  return axios.post(`${baseUrl}/${endPoints.roiDetail}/${unitId}/`, payload);
};

export const fetchVendorAccessHistory = (token, unitId, venderId) => {
  axios.defaults.headers = getHeaderWithAuthToken(token);

  return axios.get(
    `${baseUrl}/${endPoints.vendorAccessHistory}/${venderId}/${unitId}/`
  );
};
export const fetchAllForVendor = (token) => {
  axios.defaults.headers = getHeaderWithAuthToken(token);
  return axios.get(`${baseUrl}/${endPoints.vendorUnits}`);
};

export const fetchNotifications = (token, payload) => {
  axios.defaults.headers = getHeaderWithAuthToken(token);
  return axios.post(`${baseUrl}/${endPoints.notifications}/`, payload);
};

export const changeNotificationSetting = (token, id, payload) => {
  axios.defaults.headers = getHeaderWithAuthToken(token);

  return axios.put(
    `${baseUrl}/${endPoints.updateNofiticationSetting}/${id}/`,
    payload
  );
};

export const fetchUnitLength = (campusId) => {
  if (Platform.OS == "android") {
    axios.defaults.headers = {
      Accept: "application/json",
      "Content-Type": "multipart/form-data",
    };
  } else {
    axios.defaults.headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
  }
  return axios.get(`${baseUrl}/${endPoints.unitlength}/${campusId}/`);
};
