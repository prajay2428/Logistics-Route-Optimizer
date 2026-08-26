import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"

function ClickHandler(){
    useMapEvents({click(e) {
        const {lat,lng} = e.latlng
        console.log(lng)
        console.log(lat)
    }})
}



export default function SimpleMap({latitude, longitude}) {

    return (
        <MapContainer
            center={[Number(latitude), Number(longitude)]}
            zoom={15}
            style={{
                height: "700px",
                width: "80%"
            }}
        >
            <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ClickHandler />
        </MapContainer>
    )
}