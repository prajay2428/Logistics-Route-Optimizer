import React from "react"
import { Link } from "react-router-dom"
import WarehouseCard from "../components/WarehouseCard"
import { API_BASE_URL } from "../api"
import "./Warehouse.css"

export default function Warehouse(){
    const [warehouses,setWarehouse] = React.useState([])
    const [error, setError] = React.useState("")
    React.useEffect(()=> {
        let isCurrent = true

        fetch(`${API_BASE_URL}/api/routing/warehouses/`, {
            credentials: "include",
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Unable to load warehouses. STATUS ${response.status}`)
                }
                return response.json()
            })
            .then((data) => {
                if (isCurrent) setWarehouse(data)
            })
            .catch((requestError) => {
                console.error(requestError)
                if (isCurrent) setError("We couldn't load your warehouses.")
            })

        return () => {
            isCurrent = false
        }
    },[])
    const warehouseList = warehouses.map((warehouse) =>
    {
        return <WarehouseCard key={warehouse.id} name={warehouse.name} address={warehouse.address} id = {warehouse.id} />

    })

    return (
        <section className="warehouse-page">
            <header className="warehouse-page__header">
                <p className="eyebrow">Your network</p>
                <h1>Warehouses</h1>
                <p>Select a warehouse to start planning your route.</p>
            </header>

            <div className="warehouse-grid">
                {error && <p className="form-error" role="alert">{error}</p>}
                {warehouseList}
            </div>

            <div className="warehouse-page__footer">
                <Link className="add-warehouse-button" to="/addwarehouse">
                    <span aria-hidden="true">+</span>
                    Add warehouse
                </Link>
            </div>
        </section>
    )
}
