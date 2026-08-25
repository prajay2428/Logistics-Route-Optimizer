import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { API_BASE_URL } from "../api"

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [csrfToken, setCsrfToken] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    const refreshCsrfToken = useCallback(async () => {
        const response = await fetch(`${API_BASE_URL}/api/accounts/csrf/`, {
            credentials: "include",
        })

        if (!response.ok) {
            throw new Error(`Unable to get a CSRF token. STATUS ${response.status}`)
        }

        const data = await response.json()
        setCsrfToken(data.csrfToken)
        return data.csrfToken
    }, [])

    useEffect(() => {
        let isCurrent = true

        async function restoreSession() {
            try {
                const response = await fetch(`${API_BASE_URL}/api/accounts/csrf/`, {
                    credentials: "include",
                })
                if (!response.ok) {
                    throw new Error(`Unable to initialize CSRF. STATUS ${response.status}`)
                }

                const csrfData = await response.json()
                if (isCurrent) {
                    setCsrfToken(csrfData.csrfToken)
                }

                const userResponse = await fetch(`${API_BASE_URL}/api/accounts/me/`, {
                    credentials: "include",
                })
                if (userResponse.ok) {
                    const userData = await userResponse.json()
                    if (isCurrent) {
                        setUser(userData)
                    }
                } else if (isCurrent) {
                    setUser(null)
                }
            } catch (error) {
                console.error("Unable to restore the session:", error)
                if (isCurrent) {
                    setUser(null)
                }
            } finally {
                if (isCurrent) {
                    setIsLoading(false)
                }
            }
        }

        restoreSession()

        return () => {
            isCurrent = false
        }
    }, [])

    function login(data) {
        setUser(data.user)
        setCsrfToken(data.csrfToken)
    }

    function logout(nextCsrfToken = null) {
        setUser(null)
        setCsrfToken(nextCsrfToken)
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                csrfToken,
                isLoading,
                login,
                logout,
                refreshCsrfToken,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

// Context hooks live beside their provider so the auth API stays in one place.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    return useContext(AuthContext)
}
