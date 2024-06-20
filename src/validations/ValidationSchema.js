import * as yup from 'yup';


export const loginSchema=yup.object().shape({
    username :yup.number().required("Please Enter Your Mobile Number"),
    password:yup.string().min(6).max(16).required("Please Enter Password")
})