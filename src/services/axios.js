import axios from "axios"; // responsible for communicating with api
const http = axios.create({
  baseURL: process.env.VUE_APP_BASE_URL
});
http.interceptors.response.use(function (response) {
  if (response.data && response.data.statusCode && !(response.data.statusCode >= 200 && response.data.statusCode < 300) && response.data.statusCode !== 504) throw new Error()
  return response;
}, function (error) {
  return Promise.reject(error);
});

export default http;