import BaseLayout from "./BaseLayout"
import { getGymkhanaNavItems } from "../constants/navigationConfig"
import { useLogout } from "../hooks/useLogout"
import GlobalProvider from "../contexts/GlobalProvider"
import { ToastProvider } from "../components/ui/feedback"
import useAuthz from "../hooks/useAuthz"

const GymkhanaLayout = () => {
    const handleLogout = useLogout()
    const { canRouteByPath } = useAuthz()
    const navItems = getGymkhanaNavItems(handleLogout).filter((item) => {
        if (!item?.path) return true
        return canRouteByPath(item.path)
    })

    return (
        <GlobalProvider>
            <ToastProvider>
                <BaseLayout navItems={navItems} />
            </ToastProvider>
        </GlobalProvider>
    )
}

export default GymkhanaLayout
