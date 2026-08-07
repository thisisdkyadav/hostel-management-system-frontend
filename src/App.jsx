import { BrowserRouter } from "react-router-dom"
import { StatusBadgeProvider } from "hzero"
import { AuthProvider } from "./contexts/AuthProvider"
import { SocketProvider } from "./contexts/SocketProvider"
import { AuthzProvider } from "./contexts/AuthzProvider"
import AppRoutes from "./routes/AppRoutes"
import GlobalProvider from "./contexts/GlobalProvider"
import PWAInstallPrompt from "./components/common/PWAInstallPrompt"
import AppUpdatePrompt from "./components/common/AppUpdatePrompt"
import { ToastProvider } from "./components/ui/feedback/Toast"
import { ConfirmProvider } from "@/components/ui"

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
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
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
  )
}

export default App
