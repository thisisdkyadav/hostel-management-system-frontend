import BaseLayout from "./BaseLayout"
import { getGymkhanaNavItems } from "../constants/navigationConfig"
import { useLogout } from "../hooks/useLogout"
import GlobalProvider from "../contexts/GlobalProvider"
import { ToastProvider } from "../components/ui/feedback"
import useAuthorizedNavItems from "../hooks/useAuthorizedNavItems"
import { useAuth } from "../contexts/AuthProvider"

const GymkhanaLayout = () => {
    const { user } = useAuth()
    const handleLogout = useLogout()
    const navItems = useAuthorizedNavItems(getGymkhanaNavItems(handleLogout, user))

    return (
        <GlobalProvider>
            <ToastProvider>
                <BaseLayout navItems={navItems} />
            </ToastProvider>
        </GlobalProvider>
    )
}

export default GymkhanaLayout
