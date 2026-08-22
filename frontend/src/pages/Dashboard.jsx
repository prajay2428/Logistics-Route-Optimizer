import { Link } from "react-router-dom"
import heroImage from "../assets/hero.png"
import "./Dashboard.css"

export default function Dashboard(){
    return (
        <section className="dashboard-page">
            <div className="hero-content">
                <p className="eyebrow">Logistics, made clearer</p>
                <h1>Every route. One reliable view.</h1>
                <p className="hero-copy">Plan smarter, stay informed, and keep your logistics operation moving from a simple, focused dashboard.</p>
                <div className="hero-actions">
                    <Link className="primary-button" to="/login">Get started</Link>
                    <Link className="secondary-button" to="/About">Learn more</Link>
                </div>
            </div>
            <div className="hero-visual" aria-hidden="true">
                <div className="image-glow"></div>
                <img src={heroImage} alt="" />
            </div>
        </section>
    )
}
