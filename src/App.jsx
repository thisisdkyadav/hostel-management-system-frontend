import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthProvider"
import AppRoutes from "./routes/AppRoutes"
import GlobalProvider from "./contexts/GlobalProvider"

function App() {
  return (
    <AuthProvider>
      <GlobalProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </GlobalProvider>
    </AuthProvider>
  )
}

export default App
