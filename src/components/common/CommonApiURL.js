export const BASE_URL = `http://localhost/api/`
//export const BASE_URL = `https://localhost:44393/api/`  //LOCAL URL

export const MASTER = `Master/`
export const AUTH = `Auth/`
export const TRANSACTION = `Transaction/`
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