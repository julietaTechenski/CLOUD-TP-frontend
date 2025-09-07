import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8001/api",
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
    },
});

export default api;
