import api from "../../lib/axios";
import {useCallback} from "react";

export const useTracks = () => {
    const getPackageTracks= useCallback((code) => api.get(`/packages/${code}/tracks/`), []);

    const getLatestPackageTrack= useCallback((code) => api.get(`/packages/${code}/tracks/latest/`), []);

    const postPackageTrack = useCallback((code, data) => {
        const requiredFields = ["action", "comment"];
        for (const field of requiredFields) {
            if (!data[field]) {
                return Promise.reject(new Error(`Field "${field}" is required`));
            }
        }

        return api.post(`/packages/${code}/tracks/`, data);
    }, []);

    return { getPackageTracks, getLatestPackageTrack, postPackageTrack };
}
