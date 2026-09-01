import React from "react"
import { useParams } from "react-router-dom"
import { API_BASE_URL } from "../api"
import { useAuth } from "../context/AuthContext"
import DeliveryLocationCard from "../components/DeliveryLocationCard"
import LocationCard from "../components/LocationCard"
import "./UseWarehouse.css"

export default function UseWarehouse() {
    const { csrfToken, refreshCsrfToken } = useAuth()
    const [warehouseDetail, setWarehouseDetail] = React.useState({})
    const [deliveryLocations, setDeliveryLocations] = React.useState([])
    const [locations, setLocations] = React.useState([])
    const [searchAddress, setSearchAddress] = React.useState("")
    const [isAddingLocation, setIsAddingLocation] = React.useState(false)
    const [isSearching, setIsSearching] = React.useState(false)
    const [savingPlaceId, setSavingPlaceId] = React.useState(null)
    const [error, setError] = React.useState("")
    const [deliveryLocationCoordinates,setDeliveryLocationCoordinates] = React.useState([])

    const params = useParams()
    const id = Number(params.id)

    React.useEffect(() => {
        async function fetchWarehouseDetail() {
            try {
                const response = await fetch(`${API_BASE_URL}/api/routing/get/warehouse/${id}/`, {
                    credentials: "include",
                })
                if (!response.ok) throw new Error("Failed to fetch warehouse")
                const data = await response.json()
                setWarehouseDetail(data)
                setDeliveryLocationCoordinates([

                    [Number(data.longitude), Number(data.latitude)],
                ])
            } catch (requestError) {
                console.error(requestError)
                setError(requestError.message)
            }
        }

        fetchWarehouseDetail()
    }, [id])

    

    
    async function getRequestCsrfToken() {
        return csrfToken || await refreshCsrfToken()
    }

    async function handleLocationSearch(event) {
        event.preventDefault()
        const address = searchAddress.trim()
        if (!address) {
            setError("Enter a delivery address.")
            return
        }

        try {
            setError("")
            setLocations([])
            setIsSearching(true)
            const requestCsrfToken = await getRequestCsrfToken()
            const response = await fetch(`${API_BASE_URL}/api/routing/delivery/locations/`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json", "X-CSRFToken": requestCsrfToken },
                body: JSON.stringify({ address }),
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.detail || "Failed to find delivery locations")
            setLocations(data)
        } catch (requestError) {
            console.error("Delivery location search failed:", requestError)
            setError(requestError.message)
        } finally {
            setIsSearching(false)
        }
    }

    async function handleLocationSelect(placeId) {
        const location = locations.find(item => String(item.place_id) === String(placeId))
        if (!location) return

        try {
            setError("")
            setSavingPlaceId(placeId)
            const requestCsrfToken = await getRequestCsrfToken()
            const response = await fetch(`${API_BASE_URL}/api/routing/save/location/`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json", "X-CSRFToken": requestCsrfToken },
                body: JSON.stringify({
                    address: searchAddress.trim(),
                    place_id: location.place_id,
                    display_name: location.display_name,
                    type: location.type,
                    lat: location.lat,
                    lon: location.lon,
                }),
            })
            const savedLocation = await response.json()
            if (!response.ok) throw new Error(savedLocation.detail || "Failed to save delivery location")

            setDeliveryLocations(current => [
                ...current,
                { ...savedLocation, clientId: crypto.randomUUID() },
            ])
            setLocations([])
            setSearchAddress("")
            setIsAddingLocation(false)
        } catch (requestError) {
            console.error("Saving delivery location failed:", requestError)
            setError(requestError.message)
        } finally {
            setSavingPlaceId(null)
        }
    }

    function openLocationForm() {
        setError("")
        setIsAddingLocation(true)
    }

    function closeLocationForm() {
        setError("")
        setLocations([])
        setSearchAddress("")
        setIsAddingLocation(false)
    }

    const deliveryLocationList = deliveryLocations.map((location, index) => (
        <DeliveryLocationCard key={location.clientId} number={index + 1} name={location.display_name}
            type={location.type} lon={location.lon} lat={location.lat} />
    ))

    const locationList = locations.map(location => (
        <LocationCard key={location.place_id} name={location.display_name} type={location.type}
            lon={location.lon} lat={location.lat} place_id={location.place_id}
            fun={handleLocationSelect} disabled={savingPlaceId !== null} />
    ))

    function handleClick(){
        const deliveryCoordinates = deliveryLocations.map(location =>
        [Number(location.lon), Number(location.lon)])

        const coordinates = [
            [Number(warehouseDetail.longitude),Number(warehouseDetail.latitude)],
            ...deliveryCoordinates,
        ]
        const response = await fetch("get_route_url",{
            method:"POST",
            credentials:"include",
            headers:{
                "Content-Type" : "application/json",
                "X-CSRFToken" : requestCsrfToken

            },
            body : JSON.stringify({coordinates}),

            // handling the response (displaying it in leaflet)



        })
           
    
    }

    return (
        <main className="use-warehouse-page">
            <header className="use-warehouse-page__header">
                <p className="eyebrow">Plan a delivery route</p>
                <h1>{warehouseDetail.name || "Your warehouse"}</h1>
                <p>{warehouseDetail.address || "Add the delivery stops for this route."}</p>
            </header>

            <section className="delivery-locations-section">
                <div className="delivery-locations-section__heading">
                    <div>
                        <span>{deliveryLocations.length} {deliveryLocations.length === 1 ? "stop" : "stops"}</span>
                        <h2>Delivery locations</h2>
                    </div>
                    {!isAddingLocation && <button type="button" onClick={openLocationForm}>+ Add delivery location</button>}
                </div>

                {deliveryLocations.length > 0 ? (
                    <div className="delivery-location-list">{deliveryLocationList}</div>
                ) : (
                    <div className="delivery-locations-empty">
                        <span aria-hidden="true">⌖</span>
                        <h3>No delivery locations yet</h3>
                        <p>Add your first stop to start building this route.</p>
                    </div>
                )}

                {isAddingLocation && (
                    <div className="delivery-location-picker">
                        <div className="delivery-location-picker__heading">
                            <div>
                                <h3>Add a delivery location</h3>
                                <p>Search for the address, then select the correct result.</p>
                            </div>
                            <button type="button" onClick={closeLocationForm}>Cancel</button>
                        </div>
                        <form className="delivery-location-search" onSubmit={handleLocationSearch}>
                            <label htmlFor="delivery-address">Delivery address</label>
                            <div>
                                <input id="delivery-address" type="text" value={searchAddress}
                                    onChange={event => setSearchAddress(event.target.value)}
                                    placeholder="Enter an address or area" autoFocus required />
                                <button type="submit" disabled={isSearching || savingPlaceId !== null}>
                                    {isSearching ? "Searching…" : "Search"}
                                </button>
                            </div>
                        </form>
                        {locations.length > 0 && (
                            <div className="delivery-location-results" aria-label="Delivery location results">{locationList}</div>
                        )}
                    </div>
                )}

                {error && <p className="use-warehouse-error" role="alert">{error}</p>}
            </section>
            <button className="get-route-button" type="button" onClick={handleClick}>Get route</button>
        </main>
    )
}
