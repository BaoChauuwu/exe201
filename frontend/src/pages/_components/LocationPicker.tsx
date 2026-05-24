import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png'

let DefaultIcon = L.icon({
    iconUrl: icon,
    iconRetinaUrl: iconRetina,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerProps {
  longitude: number
  latitude: number
  onChange: (lng: number, lat: number) => void
}

const MapEvents = ({ setPosition, onChange }: { setPosition: any, onChange: any }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      setPosition({ lat, lng })
      onChange(lng, lat)
    }
  })
  return null
}

const RecenterMap = ({ lat, lng }: { lat: number, lng: number }) => {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng])
  }, [lat, lng, map])
  return null
}

export const LocationPicker = ({ longitude, latitude, onChange }: LocationPickerProps) => {
  const [position, setPosition] = useState({ lat: latitude, lng: longitude })

  useEffect(() => {
    setPosition({ lat: latitude, lng: longitude })
  }, [latitude, longitude])

  return (
    <div style={{ height: '350px', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(14, 165, 233, 0.2)', marginBottom: '1rem', zIndex: 0, position: 'relative' }}>
      <MapContainer center={[position.lat, position.lng]} zoom={13} style={{ height: '100%', width: '100%', zIndex: 1 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} />
        <MapEvents setPosition={setPosition} onChange={onChange} />
        <RecenterMap lat={position.lat} lng={position.lng} />
      </MapContainer>
    </div>
  )
}
