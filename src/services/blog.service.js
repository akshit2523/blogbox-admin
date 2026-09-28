import axiosInstance from "./axiosinstance";

export default class BlogService {
  static async getBlogs() {
    try {
      const response = await axiosInstance.get("/v1");

      return response.data;
    } catch (error) {
      console.log("Error getting blogs:", error);
      throw error;
    }
  }

  static async getLatestBlogsByLimit(page = 1, limit = 10) {
    try {
      const response = await axiosInstance.get(
        `/v1/public/latest/limit?page=${page}&limit=${limit}`,
      );

      return response.data;
    } catch (error) {
      console.log("Error getting latest blogs by limit:", error);
      throw error;
    }
  }

  static async getBlogBySlug(slug) {
    try {
      const response = await axiosInstance.get(`/v1/${slug}`);

      return response.data;
    } catch (error) {
      console.log("Error getting blog by slug:", error);
      throw error;
    }
  }

  static async filterBlogByCategory(category, page = 1, limit = 10) {
    try {
      const response = await axiosInstance.post("/v1/blogs/filter-category", {
        category,
        page,
        limit,
      });

      return response.data;
    } catch (error) {
      console.log("Error filtering blogs:", error);
      throw error;
    }
  }

  static async addBlog(blogData) {
    try {
      const response = await axiosInstance.post("/v1/blogs", blogData);

      return response.data;
    } catch (error) {
      console.log("Error adding blog:", error);
      throw error;
    }
  }

  static async editBlog(id, blogData) {
    try {
      const response = await axiosInstance.put(`/v1/blogs/${id}`, blogData);

      return response.data;
    } catch (error) {
      console.log("Error editing blog:", error);
      throw error;
    }
  }

  static async deleteBlog(id) {
    try {
      const response = await axiosInstance.delete(`/v1/blogs/${id}`);

      return response.data;
    } catch (error) {
      console.log("Error deleting blog:", error);
      throw error;
    }
  }
}
