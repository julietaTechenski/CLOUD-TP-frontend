import api from "../../lib/axios";
import {useCallback} from "react";

export const useAddresses = () => {
    const createAddress = useCallback((data) => {
        const requiredFields = ["street", "city", "province", "zip_code"];
        for (const field of requiredFields) {
            if (!data[field]) {
                return Promise.reject(new Error(`Field "${field}" is required`));
            }
        }

        return api.post("/addresses/", data);
    }, []);

    const getAddresses = useCallback(() => api.get("/addresses/"), []);

    const getAddress = useCallback((id) => api.get(`/addresses/${id}/`), []);

    return { createAddress, getAddresses, getAddress };
}
