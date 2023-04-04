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

const TOKEN_KEY = "token";

// Set the default Authorization header with the token
axios.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem(
  TOKEN_KEY
)}`;

// Add a request interceptor to add the token to all requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axios;

// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:8000",
// });

// const TOKEN_KEY = "my_token";
// const token = localStorage.getItem(TOKEN_KEY);
// console.log(token);

// if (token) {
//   api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
// }

// export default api;
