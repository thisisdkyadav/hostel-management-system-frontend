import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthProvider"
import { SocketProvider } from "./contexts/SocketProvider"
import AppRoutes from "./routes/AppRoutes"
import GlobalProvider from "./contexts/GlobalProvider"
import VersionUpdateNotification from "./components/common/VersionUpdateNotification"
import PWAInstallPrompt from "./components/common/PWAInstallPrompt"

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <GlobalProvider>
            <AppRoutes />
            <VersionUpdateNotification />
            <PWAInstallPrompt />
          </GlobalProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
