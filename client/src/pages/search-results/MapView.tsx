import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

import type { ZipCodeData } from "./types"
import { ZipCodeCard } from "./ZipCodeCard"

import homeluminaPin from '@/assets/homelumina-pin.svg'

const homeluminaIcon = L.icon({
  iconUrl: homeluminaPin,
});

export function MapView({ zipCodeSummaries, currentHealthMeasure }: { zipCodeSummaries: ZipCodeData[], currentHealthMeasure: string }) {
  return (
    <MapContainer
        center={[zipCodeSummaries[0].latitude, zipCodeSummaries[0].longitude]}
        zoom={13}
        style={{ height: "1000px", width: "100%", borderRadius: "15px" }}
        attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='© <a href="https://carto.com/">CARTO</a> © OpenStreetMap'
      />
      {zipCodeSummaries.map(zipCodeSummary => (
        <Marker 
            key={zipCodeSummary.zipcode}
            icon={homeluminaIcon}
            position={[zipCodeSummary.latitude, zipCodeSummary.longitude]}
        >
            <Popup closeButton={false}>
                <ZipCodeCard isMapPopup item={zipCodeSummary} currentHealthMeasure={currentHealthMeasure} />
            </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};