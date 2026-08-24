export default function WarehouseCard({ name, address }){
    return (
        <article className="warehouse-card">
            <div className="warehouse-card__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M3 10.5 12 4l9 6.5V20H3v-9.5Z" />
                    <path d="M8 20v-6h8v6M7 10h.01M12 10h.01M17 10h.01" />
                </svg>
            </div>

            <div className="warehouse-card__content">
                <p className="warehouse-card__label">Warehouse</p>
                <h2>{name}</h2>
                <p className="warehouse-card__address">{address}</p>
            </div>

            <button className="warehouse-card__button" type="button">
                Use warehouse
                <span aria-hidden="true">→</span>
            </button>
        </article>
    )
}
