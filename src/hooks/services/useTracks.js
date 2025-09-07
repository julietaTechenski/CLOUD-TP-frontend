import api from "../../lib/axios";

export const useTracks = () => ({
    getPackageTracks: (code) => api.get(`/packages/${code}/tracks/`),

    getLatestPackageTrack: (code) => api.get(`/packages/${code}/tracks/latest/`),
});