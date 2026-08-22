import { Link } from "react-router-dom"
import "./About.css"

export default function About(){
    return (
        <section className="about-page">
            <div className="about-heading">
                <p className="eyebrow">About LRO</p>
                <h1>Built for simpler logistics.</h1>
            </div>
            <div className="about-card">
                <p>Good logistics should feel organized, predictable, and easy to understand. LRO brings the information you need into one calm, practical workspace.</p>
                <p>From planning routes to monitoring day-to-day work, everything is designed to help your team spend less time untangling details and more time moving forward.</p>
                <Link className="primary-button" to="/">Explore the dashboard</Link>
            </div>
        </section>
    )
}
