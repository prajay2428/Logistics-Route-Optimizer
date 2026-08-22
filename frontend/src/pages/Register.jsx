import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import "./Register.css"

export default function Register(){
    const navigate = useNavigate()
    const [error, setError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function registerAction(formData){
        const payload = Object.fromEntries(formData)
        setError("")
        setIsSubmitting(true)

        try{
            const response = await fetch("http://127.0.0.1:8000/api/accounts/register",{
                method:"POST",
                body:JSON.stringify(payload),
                headers:{
                    'Content-Type':'application/json'
                }
            })

            if(!response.ok){
                const errorData = await response.json()
                const firstError = Object.values(errorData).flat()[0]
                throw new Error(firstError || `Registration failed with status ${response.status}`)
            }

            navigate("/login", { state: { registered: true } })
        }
        catch(error){
            console.log("error posting the data",error)
            setError(error.message || "We couldn't create your account. Please try again.")
        }
        finally {
            setIsSubmitting(false)
        }
    }

    return (
        <section className="register-page">
            <div className="register-card">
                <p className="eyebrow">Join LRO</p>
                <h1>Create your account</h1>
                <p className="register-intro">Start managing your logistics from one simple workspace.</p>

                <form action={registerAction}>
                    <div className="field-group">
                        <label htmlFor="register-username">Username</label>
                        <input id="register-username" name="username" type="text" placeholder="Choose a username" autoComplete="username" required />
                    </div>
                    <div className="field-group">
                        <label htmlFor="register-email">Email</label>
                        <input id="register-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
                    </div>
                    <div className="form-row">
                        <div className="field-group">
                            <label htmlFor="register-password">Password</label>
                            <input id="register-password" name="password" type="password" placeholder="Create a password" autoComplete="new-password" required />
                        </div>
                        <div className="field-group">
                            <label htmlFor="register-password2">Confirm password</label>
                            <input id="register-password2" name="password2" type="password" placeholder="Repeat password" autoComplete="new-password" required />
                        </div>
                    </div>
                    {error && <p className="form-error" role="alert">{error}</p>}
                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creating account…" : "Create account"}
                    </button>
                </form>

                <p className="register-login">Already have an account? <Link to="/login">Log in</Link></p>
            </div>
        </section>
    )
}
