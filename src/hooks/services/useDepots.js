import api from "../../lib/axios";
import {useCallback} from "react";


export const useDepots = () => {
    const getDepots = useCallback(() => {
        return api.get("/depots/");
    }, []);

    const getDepotById = useCallback((id) => {
        return api.get(`/depots/${id}/`);
    }, []);

    return { getDepots, getDepotById };
};