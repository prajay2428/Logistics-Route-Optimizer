import { Marker, Popup } from "react-leaflet"

export default function LocationMarker({ position }) {
    return (
        <Marker position={position}>
            <Popup>
                <strong>Your warehouse will be here</strong>
                <br />
                {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
            </Popup>
        </Marker>
    )
}
