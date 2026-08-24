import React from "react"
import { useAuth } from "../context/AuthContext"
import WarehouseCard from "../components/WarehouseCard"
import "./Warehouse.css"

export default function Warehouse(){
    const { accessToken } = useAuth()
    const [warehouses,setWarehouse] = React.useState([])
    React.useEffect(()=> {
        fetch(
    "http://127.0.0.1:8000/api/routing/warehouses/",
    {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        }
    }).then(response => response.json()).then(data => setWarehouse(data))

    console.log(warehouses)

    },[])
    const warehouseList = warehouses.map((warehouse) =>
    {
        return <WarehouseCard key={warehouse.id} name={warehouse.name} address={warehouse.address} />

    })

    return (
        <section className="warehouse-page">
            <header className="warehouse-page__header">
                <p className="eyebrow">Your network</p>
                <h1>Warehouses</h1>
                <p>Select a warehouse to start planning your route.</p>
            </header>

            <div className="warehouse-grid">
                {warehouseList}
            </div>

            <div className="warehouse-page__footer">
                <button className="add-warehouse-button" type="button">
                    <span aria-hidden="true">+</span>
                    Add warehouse
                </button>
            </div>
        </section>
    )
}
