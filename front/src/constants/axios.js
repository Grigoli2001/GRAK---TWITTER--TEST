import axios from "axios";
const token = JSON.parse(localStorage.getItem("user"))?.token;

const instance = axios.create({
  baseURL: "http://localhost:8080",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }
);

export default instance;
