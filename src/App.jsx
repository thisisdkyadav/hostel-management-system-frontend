import { BrowserRouter } from "react-router-dom"
import { QueryClientProvider } from "@tanstack/react-query"
import { ConfirmProvider, StatusBadgeProvider, ToastProvider } from "hzero"
import { AuthProvider } from "./contexts/AuthProvider"
import { SocketProvider } from "./contexts/SocketProvider"
import { AuthzProvider } from "./contexts/AuthzProvider"
import AppRoutes from "./routes/AppRoutes"
import GlobalProvider from "./contexts/GlobalProvider"
import PWAInstallPrompt from "./components/common/PWAInstallPrompt"
import AppUpdatePrompt from "./components/common/AppUpdatePrompt"
import { createAppQueryClient } from "./lib/query/queryClient"
import QueryInvalidationBridge from "./lib/query/QueryInvalidationBridge"
import { readStoredUser, warmStudentPortal } from "./components/dining/student/portalQuery"

const queryClient = createAppQueryClient()

// A returning student's session is verified with Go first; start the dining
// portal read in parallel so the allocation screen doesn't wait on login.
warmStudentPortal(queryClient, readStoredUser())

// Hostel vocabulary for StatusBadge. czero ships the states every app shares
// (active, pending, failed, …); these are the ones only HMS knows about.
// Keys are lower-cased — lookup is case-insensitive.
const statusVocabulary = {
  "checked in": "success",
  present: "success",
  "checked out": "danger",
  absent: "danger",
  maintenance: "warning",
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <SocketProvider>
            <QueryInvalidationBridge />
            <GlobalProvider>
              <AuthzProvider>
                <ToastProvider position="top-right">
                  <StatusBadgeProvider map={statusVocabulary} fallback="primary">
                    <ConfirmProvider>
                      <AppRoutes />
                      <PWAInstallPrompt />
                      <AppUpdatePrompt />
                    </ConfirmProvider>
                  </StatusBadgeProvider>
                </ToastProvider>
              </AuthzProvider>
            </GlobalProvider>
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
