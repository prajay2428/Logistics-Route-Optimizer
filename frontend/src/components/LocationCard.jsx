import "./LocationCard.css"

export default function LocationCard({ name, type, lon, lat, place_id, fun }) {
    return (
        <article className="location-card">
            <div className="location-card__content">
                <span className="location-card__type">{type || "Location"}</span>
                <h3>{name}</h3>
                <p className="location-card__coordinates">
                    <span>Lat {Number(lat).toFixed(5)}</span>
                    <span>Lng {Number(lon).toFixed(5)}</span>
                </p>
            </div>
            <button className="location-card__button" type="button" onClick={() => fun(place_id)}>
                Select location
            </button>
        </article>
    )
}
