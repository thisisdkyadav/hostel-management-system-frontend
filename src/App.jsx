import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthProvider"
import AppRoutes from "./routes/AppRoutes"
import GlobalProvider from "./contexts/GlobalProvider"
import VersionUpdateNotification from "./components/common/VersionUpdateNotification"

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GlobalProvider>
          <AppRoutes />
          <VersionUpdateNotification />
        </GlobalProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
