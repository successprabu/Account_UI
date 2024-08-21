export const BASE_URL = `http://localhost/api/`
//export const BASE_URL = `https://localhost:44393/api/`  //LOCAL URL
//export const BASE_URL = `https://mercy-daa0chgbdvd8d7ga.eastus-01.azurewebsites.net/api/` //live URL

const GOOGLE_TRANS_API_KEY ="AIzaSyC_7ciFvvyV0P8sKm7YA3S603Hv6vSpPfE"
export const GOOGLE_TRANS_API=`https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANS_API_KEY}`
export const MASTER = `Master/`
export const AUTH = `Auth/`
export const TRANSACTION = `Transaction/`
export const REPORT = `Report/`
export const LOGIN_API = `${BASE_URL}${AUTH}UserLogin`
export const LOGIN_USER_ACCOUNT_CHECK_API = `${BASE_URL}${AUTH}UserAccountCheck?`
export const SAVE_NEW_CUSTOMER_API = `${BASE_URL}${AUTH}AddCustomer`
export const SAVE_NEW_USER_API = `${AUTH}AddCustomer`
export const SAVE_FUNCTION_API=`${MASTER}UpdateCustomerFunction`
export const SAVE_NEW_TRANS_API = `${TRANSACTION}UpdateTransaction`
export const UPDATE_CUSTOMER_API=`${MASTER}UpdateCustomer`
export const LIST_CLIENT_API=`${MASTER}GetCustomer`
export const LIST_FUNCTION_API=`${MASTER}GetFunction`
export const LIST_TRANSACTION_API=`${TRANSACTION}GetTransaction?`
export const DELETE_TRANSACTION_API=`${TRANSACTION}DeleteTransaction?`
export const DASHBOARD_SUMMARY_API=`${TRANSACTION}GetDashboard?`
export const DASHBOARD_DETAIL_API=`${TRANSACTION}GetDashboardDetail?`
export const REPORT_API=`${REPORT}GetTransactionReport?`
export const REPORT_GET_ALLDATA_API=`${REPORT}GetAllTransaction?`
export const REPORT_GET_OTHERSSUMMARY_API=`${REPORT}GetOthersSummaryReport?`
export const REPORT_GET_REGIONALSUMMARY_API=`${REPORT}GetRegionalSummaryReport?`
export const REPORT_GET_OVERALLSUMMARY_API=`${REPORT}GetOverallSummaryReport?`

