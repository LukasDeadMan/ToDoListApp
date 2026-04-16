import { request } from "./http";

export const tasksApi = {
  list() {
    return request("/tasks");
  },
  create(payload) {
    return request("/tasks", {
      method: "POST",
      body: payload,
    });
  },
  update(taskId, payload) {
    return request(`/tasks/${taskId}`, {
      method: "PUT",
      body: payload,
    });
  },
  delete(taskId) {
    return request(`/tasks/${taskId}`, {
      method: "DELETE",
    });
  },
};
