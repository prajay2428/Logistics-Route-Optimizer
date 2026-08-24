import { useState } from "react"
import { useLocation, useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "./Login.css"

export default function Login(){
    const { login } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [error, setError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function formAction(formData){
        setError("")
        setIsSubmitting(true)
        try{
            const payload = Object.fromEntries(formData)
            const response = await fetch('http://127.0.0.1:8000/api/accounts/login/', {
                method : 'POST',
                headers : {
                    'Content-Type' : 'application/json',
                },
                body : JSON.stringify(payload)
            })

            if (!response.ok){
                throw new Error(`HTTP error! STATUS ${response.status}`)
            }

            const data = await response.json()
            login(data)
            navigate(location.state?.from?.pathname || "/", { replace: true })
        }
        catch (error){
            console.log("error posting data", error)
            setError("We couldn't sign you in. Please check your details and try again.")
        }
        finally {
            setIsSubmitting(false)
        }
    }

    return (
        <section className="login-page">
            <div className="login-card">
                <p className="eyebrow">Welcome back</p>
                <h1>Sign in to your account</h1>
                <p className="login-intro">Manage your routes and keep every delivery on track.</p>
                {location.state?.registered && (
                    <p className="form-success" role="status">Your account is ready. You can log in now.</p>
                )}
                <form action={formAction}>
                    <label htmlFor="username">Username</label>
                    <input id="username" type="text" name="username" placeholder="Enter your username" autoComplete="username" required />
                    <label htmlFor="password">Password</label>
                    <input id="password" type="password" name="password" placeholder="Enter your password" autoComplete="current-password" required />
                    {error && <p className="form-error" role="alert">{error}</p>}
                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Signing in…" : "Login"}
                    </button>
                </form>
            </div>
            <h2>Don't have an account? <Link to = "/signup">sign up here</Link></h2>
        </section>
    )
}
