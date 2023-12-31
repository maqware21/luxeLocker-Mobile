//************************* URL Constants *******************************//
import { BASE_URL } from '@env';
export const baseUrl = BASE_URL;

//************************* End Points Constants *******************************//
export const endPoints = {
  // AUTH
  login: "login/",
  register: "registration/",
  changePassword: "profile/change-password/",
  validateEmail: "registration/validate-email/",
  profile: "profile/",
  editProfile: "profile/",
  getZones: "zones/zones-location/",
  getState: "fetch-states/",
  availableCampus: "zones/campus-location-list/",
  availableUnits: "zones/available-units/",
  unitDetail: "zones/units-details/",
  waitingList: "zones/add-to-waiting-list-unregistered/",
  registerWaitlist: "zones/add-to-waiting-list-registered/",
  retrieveStrogeId: "zones/retrieve-storage-id/",
  insuranceUpload: "registration/insurance/",
  addCard: "registration/payment/",
  getProfileStage: "profile/stage-info/",
  uploadDrivingLicense: "profile/license-upload/",
  getDrivingLicense: "profile/documents/",
  uploadInsurancePolicy: "profile/insurance-policy/",
  getCardList: "profile/get-cards/",
  getPaymentHistory: "profile/payments/",
  deleteCard: "profile/payments/update-card/",
  addCardForSetting: "profile/payments/add-card/",
  getAgrement: "profile/agreement-documents/",
  fetchUnit: "zones/my-units/",
  fetchUnitDetail: "zones/my-units-detail/",
  fetchVendor: "vendor/",
  fetchVendorDetail: "/vendor/vendor-info/",
  fetchUser: "vendor/additional-users/",
  fetchUserDetail: "/vendor/additional-user-info",
  fetchPaymentHistory: "payments/monthly-payment",
  registerUnit: "registered/",
  insuranceForRegistedUser: "registered-user/insurance_policy",
  paymentConfirmation: "registered-payment",
  getfaqsCategories: "faqs/fetch",
  fetchNotificationSetting: "announcements/notification-setting",
  forgotPassword: "forgot-password",
  openCampusGate: "zones/facility/gate",
  openCloseUnit: "zones/units/door",
  sellUnit: "zones/sell-unit",
  leaseUnit: "zones/lease-out-unit",
  getAllVendors: "vendor/vendors-list",
  roiDetail: "payments/roi-history",
  vendorAccessHistory: "vendor/access-history",
  vendorUnits: "vendor/vendor/additional_user-units/",
  notifications: "announcements/notification",
  updateNofiticationSetting: "announcements/notification-setting",
  unitlength: "zones/units-lengths",
};
