/**
 * Task API Module
 * Handles task management for admins and users
 */

import apiClient from "../core/apiClient"

export const taskApi = {
  // ==================== Admin Endpoints ====================

  /**
   * Create new task
   * @param {Object} taskData - Task data
   */
  createTask: (taskData) => {
    return apiClient.post("/tasks", taskData)
  },

  /**
   * Get all tasks (admin)
   * @param {string} queryParams - Query string
   */
  getAllTasks: (queryParams = "") => {
    return apiClient.get("/tasks/all", { queryString: queryParams })
  },

  /**
   * Update task
   * @param {string} taskId - Task ID
   * @param {Object} taskData - Updated task data
   */
  updateTask: (taskId, taskData) => {
    return apiClient.put(`/tasks/${taskId}`, taskData)
  },

  /**
   * Delete task
   * @param {string} taskId - Task ID
   */
  deleteTask: (taskId) => {
    return apiClient.delete(`/tasks/${taskId}`)
  },

  /**
   * Get task statistics
   */
  getTaskStats: () => {
    return apiClient.get("/admin/task-stats")
  },

  // ==================== User Endpoints ====================

  /**
   * Get my tasks (assigned to current user)
   * @param {string} queryParams - Query string
   */
  getMyTasks: (queryParams = "") => {
    return apiClient.get("/tasks/my-tasks", { queryString: queryParams })
  },

  /**
   * Update task status
   * @param {string} taskId - Task ID
   * @param {string} status - New status
   */
  updateTaskStatus: (taskId, status) => {
    return apiClient.put(`/tasks/${taskId}/status`, { status })
  },
}

export default taskApi
