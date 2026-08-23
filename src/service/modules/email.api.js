/**
 * Email API Module
 * Admin email utilities (status, SMTP account diagnostics)
 */

import apiClient from "../core/apiClient"

const ROUTE = "/email"

export const emailApi = {
  /**
   * Check email service status
   */
  getStatus: () => apiClient.get(`${ROUTE}/status`),

  /**
   * Send a test email via every configured SMTP account.
   * The receiver gets one copy per working account; the response reports
   * per-account success/error.
   * @param {string} to - receiver email
   */
  testAllAccounts: (to) => apiClient.post(`${ROUTE}/test-all-accounts`, { to }),
}

export default emailApi
