import axios from "axios";
const apiUrl = process.env.REACT_APP_API_URL;


const api = axios.create({
    baseURL: `${apiUrl}`,
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzg4NzkwMTg4LCJpYXQiOjE3NTcyNTQxODgsImp0aSI6IjdiZGVlNjg5MzAxYjQ5N2VhYTlkYWNmOTU1ZjM4ZGU1IiwidXNlcl9pZCI6IjEiLCJlbWFpbCI6Imp0ZWNoZW5za2lAZXhhbXBsZS5jb20iLCJuYW1lIjoiIn0.0pdUr7W-FF-Ca7mwsOMI1K_-135cVfnCdj1mQ-OI3MI`,
    },
});

export default api;
