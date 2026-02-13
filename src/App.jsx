import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthProvider"
import { SocketProvider } from "./contexts/SocketProvider"
import AppRoutes from "./routes/AppRoutes"
import GlobalProvider from "./contexts/GlobalProvider"
import PWAInstallPrompt from "./components/common/PWAInstallPrompt"
import { ToastProvider } from "./components/ui/feedback/Toast"

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <GlobalProvider>
            <ToastProvider position="top-right">
              <AppRoutes />
              <PWAInstallPrompt />
            </ToastProvider>
          </GlobalProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
