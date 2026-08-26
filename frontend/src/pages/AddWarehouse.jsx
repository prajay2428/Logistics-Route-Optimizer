import React from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { API_BASE_URL } from "../api"
import LocationCard from "../components/LocationCard"
import SimpleMap from "../components/SimpleMap"
import "./AddWarehouse.css"

export default function AddWarehouse() {
    const { csrfToken, refreshCsrfToken } = useAuth()
    const navigate = useNavigate()
    const [locations, setLocations] = React.useState([])
    const [error, setError] = React.useState("")
    const [selectedLocation, setSelectedLocation] = React.useState(null)
    const [selectedPosition, setSelectedPosition] = React.useState(null)
    const [warehouseName, setWarehouseName] = React.useState("")
    const [warehouseInfo, setWarehouseInfo] = React.useState(null)
    const [registeredWarehouse, setRegisteredWarehouse] = React.useState(null)
    const [isSubmitting, setIsSubmitting] = React.useState(false)

    React.useEffect(() => {
        if (!registeredWarehouse) return undefined

        const redirectTimer = window.setTimeout(() => {
            navigate("/warehouse")
        }, 1500)

        return () => window.clearTimeout(redirectTimer)
    }, [registeredWarehouse, navigate])

    async function handleSearch(formData) {
        try {
            setError("")
            const payload = Object.fromEntries(formData)
            console.log("Searching for address:", payload)

            const requestCsrfToken = csrfToken || await refreshCsrfToken()
            const response = await fetch(`${API_BASE_URL}/api/routing/locations/`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": requestCsrfToken,
                },
                body: JSON.stringify(payload),
            })
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.detail || "Failed to search locations")
            }

            setLocations(data)
            console.log("Location search results:", data)
        } catch (requestError) {
            console.error("Location search failed:", requestError)
            setError(requestError.message)
        }
    }

    function handleLocationClick(id) {
        const location = locations.find((item) => item.place_id === id)
        setSelectedLocation(location)
        setSelectedPosition(null)
        setWarehouseInfo(null)
        setRegisteredWarehouse(null)
        console.log("Geocoding location selected:", location)
    }

    function handlePositionChange(position) {
        setSelectedPosition(position)
        setWarehouseInfo(null)
        setRegisteredWarehouse(null)
        console.log("Coordinates received by AddWarehouse:", position)
    }

    async function handleWarehouseSubmit(event) {
        event.preventDefault()
        setError("")
        setRegisteredWarehouse(null)

        const trimmedName = warehouseName.trim()
        if (!trimmedName) {
            setError("Enter a warehouse name.")
            return
        }
        if (!selectedPosition) {
            setError("Click the map to choose the exact warehouse position.")
            return
        }

        const info = {
            name: trimmedName,
            address: selectedLocation.display_name,
            longitude: Number(selectedPosition.lng.toFixed(6)),
            latitude: Number(selectedPosition.lat.toFixed(6)),
        }

        setWarehouseInfo(info)
        console.log("WarehouseInfo being sent to the backend:", info)

        try {
            setIsSubmitting(true)
            const requestCsrfToken = csrfToken || await refreshCsrfToken()
            const response = await fetch(`${API_BASE_URL}/api/routing/add/warehouse/`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": requestCsrfToken,
                },
                body: JSON.stringify(info),
            })
            const data = await response.json()

            if (!response.ok) {
                const message = data.detail || Object.values(data).flat().join(" ")
                throw new Error(message || "Failed to register warehouse")
            }

            setRegisteredWarehouse(data)
            console.log("Warehouse registered successfully:", data)
        } catch (requestError) {
            console.error("Warehouse registration failed:", requestError)
            setError(requestError.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    function changeLocation() {
        setSelectedLocation(null)
        setSelectedPosition(null)
        setWarehouseInfo(null)
        setRegisteredWarehouse(null)
        setError("")
    }

    const locationList = locations.map((location) => (
        <LocationCard
            key={location.place_id}
            name={location.display_name}
            type={location.type}
            lon={location.lon}
            lat={location.lat}
            place_id={location.place_id}
            fun={handleLocationClick}
        />
    ))

    return (
        <main className="add-warehouse-page">
            <header className="add-warehouse-page__header">
                <p className="eyebrow">New location</p>
                <h1>Add a warehouse</h1>
                <p>Search for an area, choose a result, then pinpoint the exact location.</p>
            </header>

            {!selectedLocation ? (
                <section className="location-search-panel">
                    <form action={handleSearch} className="location-search-form">
                        <label htmlFor="address">Warehouse address</label>
                        <div className="location-search-form__controls">
                            <input id="address" name="address" type="text" placeholder="Enter an address or area" required />
                            <button type="submit">Search</button>
                        </div>
                    </form>
                    {locations.length > 0 && (
                        <div className="location-results" aria-label="Location results">{locationList}</div>
                    )}
                </section>
            ) : (
                <section className="warehouse-builder">
                    <form className="warehouse-details-form" onSubmit={handleWarehouseSubmit}>
                        <label htmlFor="warehouse-name">Warehouse name</label>
                        <input
                            id="warehouse-name"
                            name="warehouseName"
                            type="text"
                            value={warehouseName}
                            onChange={(event) => setWarehouseName(event.target.value)}
                            placeholder="e.g. Central Distribution Hub"
                            maxLength={50}
                            required
                        />

                        <div className="selected-address">
                            <span>Selected address</span>
                            <p>{selectedLocation.display_name}</p>
                            <button type="button" onClick={changeLocation}>Change location</button>
                        </div>

                        <p className="map-instruction">Click the map to place or move your marker.</p>
                        <SimpleMap
                            latitude={selectedLocation.lat}
                            longitude={selectedLocation.lon}
                            onPositionChange={handlePositionChange}
                        />

                        <div className="warehouse-submit-row">
                            <p>
                                {selectedPosition
                                    ? `${selectedPosition.lat.toFixed(6)}, ${selectedPosition.lng.toFixed(6)}`
                                    : "No exact position selected yet"}
                            </p>
                            <button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Registering…" : "Register warehouse"}
                            </button>
                        </div>
                    </form>

                    {warehouseInfo && !registeredWarehouse && !error && (
                        <p className="warehouse-ready-message">Warehouse information is ready and being registered.</p>
                    )}
                    {registeredWarehouse && (
                        <p className="warehouse-ready-message" role="status">
                            {registeredWarehouse.name} was registered successfully. Returning to your warehouses…
                        </p>
                    )}
                </section>
            )}

            {error && <p className="add-warehouse-error" role="alert">{error}</p>}
        </main>
    )
}
