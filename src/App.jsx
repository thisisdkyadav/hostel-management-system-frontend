import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthProvider"
import { SocketProvider } from "./contexts/SocketProvider"
import { AuthzProvider } from "./contexts/AuthzProvider"
import AppRoutes from "./routes/AppRoutes"
import GlobalProvider from "./contexts/GlobalProvider"
import PWAInstallPrompt from "./components/common/PWAInstallPrompt"
import AppUpdatePrompt from "./components/common/AppUpdatePrompt"
import { ToastProvider } from "./components/ui/feedback/Toast"

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <GlobalProvider>
            <AuthzProvider>
              <ToastProvider position="top-right">
                <AppRoutes />
                <PWAInstallPrompt />
                <AppUpdatePrompt />
              </ToastProvider>
            </AuthzProvider>
          </GlobalProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
