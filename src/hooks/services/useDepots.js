import api from "../../lib/axios";
import {useCallback} from "react";


export const useDepots = () => {
    const getDepots = useCallback(() => {
        return api.get("/depots/");
    }, []);

    return { getDepots };
};