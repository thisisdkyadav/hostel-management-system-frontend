import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthProvider"
import AppRoutes from "./routes/AppRoutes"
import GlobalProvider from "./contexts/GlobalProvider"
import VersionUpdateNotification from "./components/common/VersionUpdateNotification"
import PWAInstallPrompt from "./components/common/PWAInstallPrompt"
import WhatsNewDialog from "./components/common/WhatsNewDialog"

function App() {
  // Set to false if you want to always show update notifications
  const autoUpdateOnInitialLoad = true

  return (
    <BrowserRouter>
      <AuthProvider>
        <GlobalProvider>
          <AppRoutes />
          <VersionUpdateNotification autoUpdateOnLoad={autoUpdateOnInitialLoad} />
          <PWAInstallPrompt />
          <WhatsNewDialog />
        </GlobalProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
