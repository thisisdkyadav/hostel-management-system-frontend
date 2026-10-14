import DiningScopeProvider from "@/components/dining/caterer/DiningScopeProvider"
import MealRecordsPage from "../caterer/MealRecordsPage"

/** The caterer Meal Records page across every caterer, for Admin and the Dining Office. */
const DiningMealRecordsPage = ({ home }) => (
  <DiningScopeProvider home={home} livePath={home === "/admin" ? "/admin/dining-live" : `${home}/live`} mealRecordsPath={`${home}/meal-records`}>
    <MealRecordsPage />
  </DiningScopeProvider>
)

export default DiningMealRecordsPage
