import { useMemo } from "react";
import api from "../lib/axios";

export function useApi() {
    // Then we add the auth thing
    return useMemo(() => api, []);
}
