// import axios from "axios";

// const BASE_URL = "http://localhost:8000";
// const TOKEN_KEY = "my_token";

// const api = axios.create({
//   baseURL: BASE_URL,
// });

// api.interceptors.request.use(function (config) {
//   const token = localStorage.getItem(TOKEN_KEY);
//   console.log("token: " + token);
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export default api;

// import axios from "axios";

// const BASE_URL = "http://localhost:8000";
// const TOKEN_KEY = "my_token";

// const api = axios.create({
//   baseURL: BASE_URL,
//   headers: {
//     Accept: "application/json",
//   },
// });

// api.interceptors.request.use(function (config) {
//   const token = localStorage.getItem(TOKEN_KEY);
//   console.log(token);
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export default api;

// api.js

import axios from "axios";

const BASE_URL = "http://localhost:8000";
const TOKEN_KEY = "my_token";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use(function (config) {
  const token = localStorage.getItem(TOKEN_KEY);
  console.log(token);
  if (token != null) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

api.interceptors.response.use(
  function (response) {
    const token = response.data.token;
    console.log("token: " + token);
    if (token != null) {
      localStorage.setItem(TOKEN_KEY, token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    return response;
  },
  function (error) {
    return Promise.reject(error);
  }
);

export default api;
