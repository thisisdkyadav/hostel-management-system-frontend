import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthProvider"
import AppRoutes from "./routes/AppRoutes"
import GlobalProvider from "./contexts/GlobalProvider"
import VersionUpdateNotification from "./components/common/VersionUpdateNotification"
import PWAInstallPrompt from "./components/common/PWAInstallPrompt"

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GlobalProvider>
          <AppRoutes />
          <VersionUpdateNotification />
          <PWAInstallPrompt />
        </GlobalProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
