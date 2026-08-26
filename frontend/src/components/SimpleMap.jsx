import { useState } from "react"
import {
    MapContainer,
    TileLayer,
    useMapEvents,
} from "react-leaflet"
import "leaflet/dist/leaflet.css"
import LocationMarker from "./LocationMarker"
import "./SimpleMap.css"

function ClickHandler({ onLocationSelect }) {
    useMapEvents({
        click(e) {
            console.log("Map clicked:", e.latlng)
            onLocationSelect(e.latlng)
        },
    })

    return null
}

export default function SimpleMap({ latitude, longitude, onPositionChange }) {
    const [selectedPosition, setSelectedPosition] = useState(null)

    function handleLocationSelect(position) {
        setSelectedPosition(position)
        onPositionChange(position)
        console.log("Marker position selected:", position)
    }

    return (
        <MapContainer
            center={[Number(latitude), Number(longitude)]}
            zoom={15}
            className="warehouse-map"
        >
            <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <ClickHandler onLocationSelect={handleLocationSelect} />

            {selectedPosition && <LocationMarker position={selectedPosition} />}
        </MapContainer>
    )
}
