import "./DeliveryLocationCard.css"

export default function DeliveryLocationCard({ number, name, type, lon, lat }) {
    return (
        <article className="delivery-location-card">
            <span className="delivery-location-card__number">{number}</span>
            <div className="delivery-location-card__content">
                <span>{type || "Delivery stop"}</span>
                <h3>{name}</h3>
                <p>Lat {Number(lat).toFixed(5)} · Lng {Number(lon).toFixed(5)}</p>
            </div>
            <span className="delivery-location-card__status">Added</span>
        </article>
    )
}
