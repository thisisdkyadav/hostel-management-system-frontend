import { createContext, useContext } from "react"

/**
 * True for pages rendered inside the student phone app. Shared pages that
 * have no phone page of their own (elections, best performer) read it to swap
 * in a phone presentation while keeping their data and actions.
 */
export const PhoneShellContext = createContext(false)

export const useInPhoneShell = () => useContext(PhoneShellContext)
