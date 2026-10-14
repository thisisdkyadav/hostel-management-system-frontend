import { useMemo } from "react"
import { DiningScopeContext, oversightScope } from "./diningScope"

/** Puts the caterer screens below it into "every caterer" mode, for Admin or the Dining Office. */
const DiningScopeProvider = ({ home, livePath, mealRecordsPath, children }) => {
  const scope = useMemo(() => oversightScope({ home, livePath, mealRecordsPath }), [home, livePath, mealRecordsPath])
  return <DiningScopeContext.Provider value={scope}>{children}</DiningScopeContext.Provider>
}

export default DiningScopeProvider
