import React from "react"
import { useAuth } from "../context/AuthContext"
import { API_BASE_URL } from "../api"
import LocationCard from "../components/LocationCard"
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
    const locationList = locations.map((location) => {
        return <LocationCard name = {location.display_name} type = {location.type} lon = {location.lon} lat = {location.lat} key={`${location.lat}-${location.lon}`} id ={`${location.lat}-${location.lon}`} fun = {handleClick} /> })

    
    function handleClick(id){
        console.log(id)

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

            {locations.length > 0 && locationList
            }
        </>
    )
}
