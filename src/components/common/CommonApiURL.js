export const BASE_URL = `http://localhost/api/`

export const MASTER = `Master/`
export const AUTH = `Auth/`
export const TRANSACTION = `Transaction/`
export const SAVE_NEW_CUSTOMER_API = `${BASE_URL}${AUTH}AddCustomer`
export const SAVE_NEW_TRANS_API = `${TRANSACTION}UpdateTransaction`
export const LOGIN_API = `${BASE_URL}${AUTH}UserLogin`
export const LIST_CLIENT_API=`${MASTER}GetCustomer`