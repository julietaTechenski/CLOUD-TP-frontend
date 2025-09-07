export const useReceivers = (api) => ({
    createReceiver: (data) => {
        const requiredFields = ["name", "email"];
        for (const field of requiredFields) {
            if (!data[field]) {
                return Promise.reject(new Error(`Field "${field}" is required`));
            }
        }

        return api.post("/receivers", data);
    },

});
