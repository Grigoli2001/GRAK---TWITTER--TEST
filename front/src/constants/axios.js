import axios from "axios";
export const baseURL = "http://localhost:8080";
const user = JSON.parse(localStorage.getItem("user"));
const token = user ? user.token : "";
const instance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
});

export default instance;
