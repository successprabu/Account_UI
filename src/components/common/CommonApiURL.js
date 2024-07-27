export const BASE_URL = `http://localhost/api/`
//export const BASE_URL = `https://localhost:44393/api/`  //LOCAL URL

export const MASTER = `Master/`
export const AUTH = `Auth/`
export const TRANSACTION = `Transaction/`
export const SAVE_NEW_CUSTOMER_API = `${BASE_URL}${AUTH}AddCustomer`
export const SAVE_NEW_TRANS_API = `${TRANSACTION}UpdateTransaction`
export const LOGIN_API = `${BASE_URL}${AUTH}UserLogin`
export const LIST_CLIENT_API=`${MASTER}GetCustomer`
export const LIST_TRANSACTION_API=`${TRANSACTION}GetTransaction?`
export const DELETE_TRANSACTION_API=`${TRANSACTION}DeleteTransaction?`