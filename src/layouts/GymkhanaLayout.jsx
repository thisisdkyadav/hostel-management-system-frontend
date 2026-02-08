import BaseLayout from "./BaseLayout"
import { getGymkhanaNavItems } from "../constants/navigationConfig"
import { useLogout } from "../hooks/useLogout"
import GlobalProvider from "../contexts/GlobalProvider"
import { ToastProvider } from "../components/ui/feedback"

const GymkhanaLayout = () => {
    const handleLogout = useLogout()
    const navItems = getGymkhanaNavItems(handleLogout)

    return (
        <GlobalProvider>
            <ToastProvider>
                <BaseLayout navItems={navItems} />
            </ToastProvider>
        </GlobalProvider>
    )
}

export default GymkhanaLayout
