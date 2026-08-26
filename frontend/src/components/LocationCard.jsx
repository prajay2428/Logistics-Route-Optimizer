export default function LocationCard(props){
    return (
        <>
        <h3>{props.name}</h3>
        <h2> {props.type}</h2>
        <h2> {props.lon}</h2>
        <h2> {props.lat}</h2>
        <h2> {props.place_id} </h2>
        <button onClick = {() => {return props.fun(props.place_id)}}>select this location </button>
        </>
    )
}