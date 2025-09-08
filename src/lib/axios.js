// import axios from "axios";
// const apiUrl = process.env.REACT_APP_API_URL;


// const api = axios.create({
//     baseURL: `${apiUrl}`,
//     headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzg4ODQ0NDY3LCJpYXQiOjE3NTczMDg0NjcsImp0aSI6IjljMGQyY2IwMjRkNDRkNmRiYWMzM2ZjZDgxNDNjZTkxIiwidXNlcl9pZCI6IjIiLCJlbWFpbCI6ImRpZWdvbG9yYWJpQGV4YW1wbGUuY29tIiwibmFtZSI6IiJ9.U9WuHIJGKj6033Vwsql3Q4BAEeJuNLVadIuP4Z93ZW4`,
//     },
// });

import axios from "axios";

const apiUrl = process.env.REACT_APP_API_URL;

const api = axios.create({
    baseURL: apiUrl,
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor para agregar Authorization si hay token en sessionStorage
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem("access_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
