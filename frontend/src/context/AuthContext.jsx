import { createContext, useContext, useState } from "react"

const AuthContext = createContext()
const AUTH_STORAGE_KEY = "lro-auth-session"

function getStoredSession() {
    try {
        const storedSession = localStorage.getItem(AUTH_STORAGE_KEY)
        return storedSession
            ? JSON.parse(storedSession)
            : { user: null, accessToken: null, refreshToken: null }
    } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY)
        return { user: null, accessToken: null, refreshToken: null }
    }
}

export function AuthProvider({ children }) {
    const [session, setSession] = useState(getStoredSession)

    function login(data) {
        const nextSession = {
            user: data.user,
            accessToken: data.access,
            refreshToken: data.refresh,
        }

        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession))
        setSession(nextSession)
    }

    function logout() {
        localStorage.removeItem(AUTH_STORAGE_KEY)
        setSession({ user: null, accessToken: null, refreshToken: null })
    }

    return (
        <AuthContext.Provider
            value={{
                user: session.user,
                accessToken: session.accessToken,
                refreshToken: session.refreshToken,
                login,
                logout,
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
