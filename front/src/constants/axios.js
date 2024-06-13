import axios from "axios";

// export const baseURL = "http://localhost:8080";
export const baseURL = "/";

const instance = axios.create({
  baseURL: baseURL,
});

// Interceptor for authorized routes
instance.interceptors.request.use(
  (config) => {
    const token = JSON.parse(localStorage.getItem("user"))?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for refresh token generation
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      // originalRequest._retry = true;

      try {
        console.log("refreshing token");
        const refreshToken = JSON.parse(localStorage.getItem("user"))?.refresh;
        const response = await axios.post(`${baseURL}/token/refresh`, {
          refreshToken,
        });
        const { token } = response.data;

        // Save the new token back to the local storage
        const user = JSON.parse(localStorage.getItem("user")) || {};
        user.token = token;
        localStorage.setItem("user", JSON.stringify(user));

        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axios(originalRequest);
      } catch (error) {
        // Handle refresh token failure
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
