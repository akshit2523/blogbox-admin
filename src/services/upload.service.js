import axiosInstance from "./axiosinstance";

const ImageService = {
  uploadImage: async (file) => {
    const formData = new FormData();

    formData.append("image", file);

    const response = await axiosInstance.post(`/v1/image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },
  deleteImage: async (publicId) => {
  const response = await axiosInstance.delete("/v1/image", {
    data: { publicId },
  });

  return response.data;
},
};

export default ImageService;
