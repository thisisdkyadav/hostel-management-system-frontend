import DiningScopeProvider from "@/components/dining/caterer/DiningScopeProvider"
import LiveFeedScreen from "@/components/dining/caterer/live/LiveFeedScreen"

/** The full-screen caterer Live Feed across every caterer, for Admin and the Dining Office. */
const DiningLiveFeedPage = ({ home }) => (
  <DiningScopeProvider home={home} livePath={home === "/admin" ? "/admin/dining-live" : `${home}/live`} mealRecordsPath={`${home}/meal-records`}>
    <LiveFeedScreen />
  </DiningScopeProvider>
)

export default DiningLiveFeedPage
