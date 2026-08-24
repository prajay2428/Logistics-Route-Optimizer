import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "./Navbar.css"

export default function Navbar() {
    const { user, accessToken, refreshToken, logout } = useAuth()
    const navigate = useNavigate()

    async function handleLogout() {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/accounts/logout/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ refresh: refreshToken }),
            })

            if (!response.ok) {
                throw new Error(`HTTP error! STATUS ${response.status}`)
            }
        } catch (error) {
            console.error("Error logging out:", error)
        } finally {
            logout()
            navigate("/")
        }
    }

    return (
        <header className="navbar">
            <NavLink className="site-logo" to="/" aria-label="LRO home">
                <span className="logo-mark">L</span>
                <span>LRO</span>
            </NavLink>
            <nav aria-label="Main navigation">
                <NavLink to="/" end>Home</NavLink>
                <NavLink to="/About">About</NavLink>
                {user ? (
                    <>
                        <span className="user-greeting" title={user.email || user.username}>
                            <span className="user-avatar">{user.username.charAt(0).toUpperCase()}</span>
                            <span>Hi, {user.username}</span>
                        </span>
                        <button className="nav-auth-button" type="button" onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <NavLink className="nav-auth-link" to="/login">Login</NavLink>
                )}
            </nav>
        </header>
    )
}
