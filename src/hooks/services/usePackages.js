
export const usePackages = (api) => ({
    createPackage: (data) => {
        const requiredFields = ["origin", "destination", "state", "sender", "receiver"];
        for (const field of requiredFields) {
            if (!data[field]) {
                return Promise.reject(new Error(`Field "${field}" is required`));
            }
        }

        const allowedStates = ["pending", "in-transit", "delivered"];
        if (!allowedStates.includes(data.state)) {
            return Promise.reject(new Error(`Invalid state: ${data.state}`));
        }

        return api.post("/packages", data);
    },

    getPackages: () => api.get("/packages"),
});


