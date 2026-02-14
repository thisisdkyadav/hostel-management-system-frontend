import { useState, useEffect, useRef } from "react"
import { Input } from "czero/react"
import { userApi } from "../../service"

const UserSearch = ({ onSelectUser, selectedUsers = [], roleFilter, placeholder = "Search users...", maxResults = 5, disabled = false }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef(null)

  // Handle click outside to close the search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [searchRef])

  // Search for users when search term changes
  useEffect(() => {
    const searchUsers = async () => {
      if (searchTerm.trim().length < 2) {
        setSearchResults([])
        return
      }

      setIsLoading(true)
      try {
        const results = await userApi.searchUsers(searchTerm, roleFilter)

        // Filter out already selected users
        const filteredResults = results.filter((user) => !selectedUsers.some((selected) => selected._id === user._id)).slice(0, maxResults)

        setSearchResults(filteredResults)
        setShowResults(true)
      } catch (error) {
        console.error("Error searching users:", error)
        setSearchResults([])
      } finally {
        setIsLoading(false)
      }
    }

    const delaySearch = setTimeout(searchUsers, 300)
    return () => clearTimeout(delaySearch)
  }, [searchTerm, roleFilter, selectedUsers, maxResults])

  const handleUserSelect = (user) => {
    onSelectUser(user)
    setSearchTerm("")
    setSearchResults([])
    setShowResults(false)
  }

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value)
    if (e.target.value.trim().length > 0) {
      setShowResults(true)
    } else {
      setShowResults(false)
    }
  }

  const getUserInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U"
  }

  const getRoleColor = (role) => {
    const roleColors = {
      Admin: "bg-[var(--color-info-bg)] text-[var(--color-info)]",
      "Super Admin": "bg-[var(--color-info-bg)] text-[var(--color-info)]",
      Warden: "bg-[var(--color-primary-bg)] text-[var(--color-primary)]",
      "Associate Warden": "bg-[var(--color-primary-bg)] text-[var(--color-primary)]",
      "Hostel Supervisor": "bg-[var(--color-success-bg-light)] text-[var(--color-success)]",
      Security: "bg-[var(--color-success-bg-light)] text-[var(--color-success-dark)]",
      "Maintenance Staff": "bg-[var(--color-warning-bg)] text-[var(--color-warning-dark)]",
      Student: "bg-[var(--color-primary-bg)] text-[var(--color-primary-dark)]",
    }

    return roleColors[role] || "bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]"
  }

  return (
    <div className="relative" ref={searchRef}>
      <div className="flex items-center relative">
        <Input type="text" value={searchTerm} onChange={handleInputChange} placeholder={placeholder} disabled={disabled} />
        {isLoading && (
          <div className="absolute right-3">
            <svg className="animate-spin h-4 w-4 text-[var(--color-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>

      {showResults && searchResults.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-[var(--color-bg-primary)] shadow-lg rounded-md border border-[var(--color-border-primary)] max-h-60 overflow-auto">
          <ul className="divide-y divide-[var(--color-border-light)]">
            {searchResults.map((user) => (
              <li key={user._id} onClick={() => handleUserSelect(user)} className="px-4 py-2 hover:bg-[var(--color-bg-tertiary)] cursor-pointer">
                <div className="flex items-center">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${getRoleColor(user.role)}`}>{getUserInitial(user.name)}</div>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{user.name}</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-xs text-[var(--color-text-muted)]">{user.email}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getRoleColor(user.role)}`}>{user.role}</span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showResults && searchTerm.trim().length >= 2 && searchResults.length === 0 && !isLoading && (
        <div className="absolute z-10 mt-1 w-full bg-[var(--color-bg-primary)] shadow-lg rounded-md border border-[var(--color-border-primary)] p-4 text-center">
          <p className="text-sm text-[var(--color-text-muted)]">No users found</p>
        </div>
      )}
    </div>
  )
}

export default UserSearch
