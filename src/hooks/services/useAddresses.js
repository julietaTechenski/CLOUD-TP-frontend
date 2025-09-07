export const useAddresses = (api) => ({
    createAddress: (data) => {
        const requiredFields = ["street", "city", "province", "zip_code"];
        for (const field of requiredFields) {
            if (!data[field]) {
                return Promise.reject(new Error(`Field "${field}" is required`));
            }
        }

        return api.post("/addresses/", data);
    },

});
