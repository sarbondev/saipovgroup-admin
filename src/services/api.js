import axios from "axios";

const BASE_URL = "http://localhost:3000/api";

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("authToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("authToken");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token) {
    if (token) {
      this.api.defaults.headers.Authorization = `Bearer ${token}`;
    } else {
      delete this.api.defaults.headers.Authorization;
    }
  }

  // Auth endpoints
  async login(phoneNumber, password) {
    return this.api.post("/auth/login", { phoneNumber, password });
  }

  async getProfile() {
    return this.api.get("/auth/profile");
  }

  async changePassword(currentPassword, newPassword) {
    return this.api.post("/auth/change-password", {
      currentPassword,
      newPassword,
    });
  }

  // Admin endpoints
  async getAdmins() {
    return this.api.get("/admin");
  }

  async getAdmin(id) {
    return this.api.get(`/admin/${id}`);
  }

  async createAdmin(data) {
    return this.api.post("/admin", data);
  }

  async updateAdmin(id, data) {
    return this.api.put(`/admin/${id}`, data);
  }

  async deleteAdmin(id) {
    return this.api.delete(`/admin/${id}`);
  }

  // Product endpoints
  async getProducts(params = {}) {
    return this.api.get("/products", { params });
  }

  async getProduct(id) {
    return this.api.get(`/products/${id}`);
  }

  async createProduct(formData) {
    return this.api.post("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  async updateProduct(id, formData) {
    return this.api.put(`/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  async deleteProduct(id) {
    return this.api.delete(`/products/${id}`);
  }

  async updateInventory(id, stockQuantity) {
    return this.api.patch(`/products/${id}/inventory`, { stockQuantity });
  }

  async getProductCategories() {
    return this.api.get("/products/categories");
  }

  // Order endpoints
  async getOrders() {
    return this.api.get("/orders");
  }

  async getOrder(id) {
    return this.api.get(`/orders/${id}`);
  }

  async createOrder(data) {
    return this.api.post("/orders", data);
  }

  async updateOrderStatus(id, status, internalNotes) {
    return this.api.put(`/orders/${id}/status`, { status, internalNotes });
  }

  async cancelOrder(id, reason) {
    return this.api.put(`/orders/${id}/cancel`, { reason });
  }
}

export const apiService = new ApiService();
