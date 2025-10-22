import api from "../../lib/axios";

export const usePackages = () => ({
    createPackage: (data) => {
        const requiredFields = ["origin", "destination", "status", "receiver_name", "receiver_email","size", "weight"];
        for (const field of requiredFields) {
            if (!data[field]) {
                return Promise.reject(new Error(`Field "${field}" is required`));
            }
        }
        return api.post("/packages/", data);
    },
    getPackages: () => api.get("/packages/"),

    getPackageById: (code) => api.get(`/packages/${code}`),

    uploadPackageImage: (code, file) => {
        const formData = new FormData();
        formData.append("purpose", "CREATION");
        formData.append("image", file);

        return api.post(`/packages/${code}/images/`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    }

});
