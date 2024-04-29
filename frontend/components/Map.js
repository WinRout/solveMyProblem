'use client'
import { MapContainer, Marker, TileLayer, Tooltip, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"

export default function Map(props) {
  const { locations, zoom } = props

  return <MapContainer className=" h-96 w-full" zoom={zoom} center={[locations[0].Latitude, locations[0].Longitude]} scrollWheelZoom={true}>
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    {locations.map((location, index) => (
    <Marker position={[location.Latitude, location.Longitude]}>
      <Popup>
        Location {index}
      </Popup>
    </Marker>
    ))};
  </MapContainer>
}