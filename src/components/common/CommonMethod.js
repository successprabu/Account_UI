import axios from "axios";
import { BASE_URL } from "../constant/CommonApiURL";

export const dateUTC = (date = new Date()) => new Date(new Date(date).toUTCString()).toISOString()

export const commonPayloadFields = {
    createdBy: 'APPLICATION',
    createdDt: dateUTC(new Date()),
    updateddBy:'APPLICATION',
    updatedDt: dateUTC(new Date()),
    isActive:true
}

const post = (url, payload) => {
    let payload = payload;
    payload = { ...payload, ...commonPayloadFields};

    return axios({
      method: "post",
      url: BASE_URL + `${url}`,
      data: payload,
    }).catch(handleAuthenticationError);
  };

  export const API_SERVICE = {
    post: post
  };
  