import React from "react"
import { useAuth } from "../context/AuthContext"
import { API_BASE_URL } from "../api"

export default function AddWarehouse() {
    const { csrfToken, refreshCsrfToken } = useAuth()

    const [locations, setLocations] = React.useState([])
    const [error, setError] = React.useState("")

    async function handleSubmit(formData) {
        try {
            setError("")

            const payload = Object.fromEntries(formData)
            const requestCsrfToken = csrfToken || await refreshCsrfToken()

            const response = await fetch(
                `${API_BASE_URL}/api/routing/locations/`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": requestCsrfToken,
                    },
                    body: JSON.stringify(payload),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.detail || "Failed to search locations"
                )
            }

            setLocations(data)
        } catch (error) {
            console.error(error)
            setError(error.message)
        }
    }

    return (
        <>
            <form action={handleSubmit}>
                <label>
                    Address:
                    <input
                        name="address"
                        type="text"
                        placeholder="Enter address"
                    />
                </label>

                <button type="submit">Search</button>
            </form>

            {error && (
                <p>{error}</p>
            )}

            {locations.length > 0 && (
                <div>
                    {locations.map((location, index) => (
                        <div key={index}>
                            <h3>{location.display_name}</h3>
                            <p>Type: {location.type}</p>
                            <p>Latitude: {location.lat}</p>
                            <p>Longitude: {location.lon}</p>
                        </div>
                    ))}
                </div>
            )}
        </>
    )
}
