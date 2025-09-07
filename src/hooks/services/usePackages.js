export const usePackages = (api) => ({
    createPackage: (data) => {
        const requiredFields = ["origin", "destination", "status", "receiver", "size", "weight"];
        for (const field of requiredFields) {
            if (!data[field]) {
                return Promise.reject(new Error(`Field "${field}" is required`));
            }
        }

        return api.post("/packages", data);
    },

});
