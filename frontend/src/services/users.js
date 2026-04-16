import { request } from "./http";

export const usersApi = {
  register(payload) {
    return request("/users/register", {
      method: "POST",
      body: payload,
    });
  },
  login(payload) {
    return request("/users/login", {
      method: "POST",
      body: payload,
    });
  },
  logout() {
    return request("/users/logout", {
      method: "POST",
    });
  },
  me() {
    return request("/users/me");
  },
  update(userId, payload) {
    return request(`/users/${userId}`, {
      method: "PUT",
      body: payload,
    });
  },
  delete(userId) {
    return request(`/users/${userId}`, {
      method: "DELETE",
    });
  },
};
