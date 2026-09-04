import React from "react"
import { useParams } from "react-router-dom"
import { divIcon } from "leaflet"
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { API_BASE_URL } from "../api"
import { useAuth } from "../context/AuthContext"
import DeliveryLocationCard from "../components/DeliveryLocationCard"
import LocationCard from "../components/LocationCard"
import "./UseWarehouse.css"

const warehouseIcon = divIcon({
    className: "route-marker route-marker--warehouse",
    html: "<span>W</span>",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
})

const deliveryIcon = divIcon({
    className: "route-marker route-marker--delivery",
    html: "<span></span>",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
})

const startIcon = divIcon({
    className: "route-endpoint route-endpoint--start",
    html: "<span>S</span>",
    iconSize: [30, 30],
    iconAnchor: [32, 15],
})

const endIcon = divIcon({
    className: "route-endpoint route-endpoint--end",
    html: "<span>E</span>",
    iconSize: [30, 30],
    iconAnchor: [-2, 15],
})

function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.round((seconds % 3600) / 60)
    return `${hours ? `${hours} hr ` : ""}${minutes} min`
}

function formatDistance(meters) {
    return `${(meters / 1000).toFixed(2)} km`
}

function RouteBounds({ positions }) {
    const map = useMap()

    React.useEffect(() => {
        if (positions.length > 1) map.fitBounds(positions, { padding: [24, 24] })
    }, [map, positions])

    return null
}

function RouteArrows({ positions }) {
    const map = useMap()
    const [arrows, setArrows] = React.useState([])

    React.useEffect(() => {
        function updateArrows() {
            const nextArrows = []
            const spacing = 120
            let distanceUntilArrow = spacing / 2

            for (let index = 1; index < positions.length; index += 1) {
                const start = map.latLngToLayerPoint(positions[index - 1])
                const end = map.latLngToLayerPoint(positions[index])
                const deltaX = end.x - start.x
                const deltaY = end.y - start.y
                const segmentLength = Math.hypot(deltaX, deltaY)

                while (segmentLength >= distanceUntilArrow) {
                    const ratio = distanceUntilArrow / segmentLength
                    nextArrows.push({
                        position: map.layerPointToLatLng([
                            start.x + deltaX * ratio,
                            start.y + deltaY * ratio,
                        ]),
                        angle: Math.atan2(deltaY, deltaX) * 180 / Math.PI + 90,
                    })
                    distanceUntilArrow += spacing
                }

                distanceUntilArrow -= segmentLength
            }

            setArrows(nextArrows)
        }

        updateArrows()
        map.on("zoomend moveend", updateArrows)
        return () => map.off("zoomend moveend", updateArrows)
    }, [map, positions])

    return arrows.map((arrow, index) => (
        <Marker
            key={`${index}-${arrow.position.lat}-${arrow.position.lng}`}
            position={arrow.position}
            interactive={false}
            icon={divIcon({
                className: "route-arrow",
                html: `<span style="transform: rotate(${arrow.angle}deg)">▲</span>`,
                iconSize: [18, 18],
                iconAnchor: [9, 9],
            })}
        />
    ))
}

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
    const [distance,setDistance] = React.useState(null)
    const [duration,setDuration] = React.useState(null)
    const [geometry,setGeometry] = React.useState([])
    const [unoptimizedDistance, setUnoptimizedDistance] = React.useState(null)
    const [unoptimizedDuration, setUnoptimizedDuration] = React.useState(null)
    const [routeOrder, setRouteOrder] = React.useState([])

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

    async function handleClick() {
    const requestCsrfToken = await getRequestCsrfToken()

    const deliveryCoordinates = deliveryLocations.map(location => ({
        name: location.display_name,
        coordinates: [
            Number(location.lon),
            Number(location.lat),
        ],
    }))

    const coordinates = [
        {
            name: warehouseDetail.name,
            coordinates: [
                Number(warehouseDetail.longitude),
                Number(warehouseDetail.latitude),
            ],
        },
        ...deliveryCoordinates,
    ]
    console.log(coordinates)
    try{

    const response = await fetch(`${API_BASE_URL}/api/routing/get/route/`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": requestCsrfToken,
        },
        body: JSON.stringify(coordinates ),
    })
    const routePath = await response.json()
    if(!response.ok){
        throw new Error(routePath.detail || "error in the response")
    }
    console.log(routePath)
    setDistance(routePath.optimized.distance)
    setDuration(routePath.optimized.duration)
    setGeometry(routePath.optimized.geometry)
    setUnoptimizedDistance(routePath.unoptimized.distance)
    setUnoptimizedDuration(routePath.unoptimized.duration)
    setRouteOrder(routePath.route.map(index => ({
        locationIndex: index,
        name: index === 0 ? "Warehouse" : coordinates[index].name.trim().split(/\s+/)[0],
    })))
}
catch(requestError){
    console.error("error in the response", requestError)

}

    
}

    const routePositions = geometry?.coordinates?.map(([longitude, latitude]) => (
        [Number(latitude), Number(longitude)]
    )) || []

    const savedDistance = unoptimizedDistance - distance
    const savedDuration = unoptimizedDuration - duration

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
            {routePositions.length > 0 && (
                <section className="route-result">
                    <div className="route-result__heading">
                        <div>
                            <span>Optimized route</span>
                            <h2>Your delivery plan</h2>
                        </div>
                        <strong>{deliveryLocations.length} {deliveryLocations.length === 1 ? "stop" : "stops"}</strong>
                    </div>
                    <div className="route-navigation" aria-label="Optimized route order">
                        <p>Route order</p>
                        <ol>
                            {routeOrder.map((routeStop, index) => (
                                <li key={`${routeStop.locationIndex}-${index}`}>
                                    <span>{index === 0 ? "S" : index === routeOrder.length - 1 ? "E" : index}</span>
                                    <strong>{routeStop.name}</strong>
                                </li>
                            ))}
                        </ol>
                    </div>
                    <div className="route-metrics">
                        <article className="route-metric route-metric--optimized">
                            <span>Optimized</span>
                            <strong>{formatDistance(distance)}</strong>
                            <small>{formatDuration(duration)}</small>
                        </article>
                        <article className="route-metric">
                            <span>Original route</span>
                            <strong>{formatDistance(unoptimizedDistance)}</strong>
                            <small>{formatDuration(unoptimizedDuration)}</small>
                        </article>
                        <article className="route-metric route-metric--saved">
                            <span>You save</span>
                            <strong>{formatDistance(savedDistance)}</strong>
                            <small>{formatDuration(savedDuration)}</small>
                        </article>
                    </div>
                    <div className="route-map-wrap">
                        <div className="route-map-legend" aria-label="Map legend">
                            <span><i className="route-map-legend__warehouse">W</i>Warehouse</span>
                            <span><i className="route-map-legend__stop"></i>Delivery</span>
                            <span><i className="route-map-legend__start">S</i>Start</span>
                            <span><i className="route-map-legend__end">E</i>End</span>
                        </div>
                        <MapContainer center={routePositions[0]} zoom={13} className="route-map">
                            <TileLayer
                                attribution="&copy; OpenStreetMap contributors"
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Polyline positions={routePositions} pathOptions={{ color: "#e87625", weight: 5 }} />
                            <RouteArrows positions={routePositions} />
                            <Marker position={routePositions[0]} icon={startIcon}>
                                <Popup><strong>Warehouse</strong><br />Route start</Popup>
                            </Marker>
                            <Marker position={routePositions[routePositions.length - 1]} icon={endIcon}>
                                <Popup><strong>Warehouse</strong><br />Route end</Popup>
                            </Marker>
                            <Marker
                                position={[Number(warehouseDetail.latitude), Number(warehouseDetail.longitude)]}
                                icon={warehouseIcon}
                            >
                                <Popup><strong>Warehouse</strong></Popup>
                            </Marker>
                            {routeOrder.slice(1, -1).map((routeStop, index) => {
                                const location = deliveryLocations[routeStop.locationIndex - 1]
                                return (
                                <Marker
                                    key={location.clientId}
                                    position={[Number(location.lat), Number(location.lon)]}
                                    icon={deliveryIcon}
                                >
                                    <Popup><strong>Stop {index + 1}</strong><br />{location.display_name}</Popup>
                                </Marker>
                                )
                            })}
                            <RouteBounds positions={routePositions} />
                        </MapContainer>
                    </div>
                </section>
            )}
        </main>
    )
}
