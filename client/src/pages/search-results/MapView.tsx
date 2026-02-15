import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

import type { ZipCodeData } from "./types"
import { ZipCodeCard } from "./ZipCodeCard"
import { useDarkMode } from "@/providers/DarkModeProvider"

import homeluminaPin from '@/assets/homelumina-pin.svg'

const homeluminaIcon = L.icon({
  iconUrl: homeluminaPin,
});

const DEFAULT_CENTER: [number, number] = [39.8283, -98.5795]; // US center

const CARTO_ATTRIBUTION = '© <a href="https://carto.com/">CARTO</a> © OpenStreetMap';

export function MapView({ zipCodeSummaries, currentHealthMeasure }: { zipCodeSummaries: ZipCodeData[], currentHealthMeasure: string }) {
  const { isDarkMode } = useDarkMode();
  const hasResults = zipCodeSummaries.length > 0;
  const center: [number, number] = hasResults
    ? [zipCodeSummaries[0].latitude, zipCodeSummaries[0].longitude]
    : DEFAULT_CENTER;

  return (
    <div className="relative z-0">
      <MapContainer
        center={center}
        zoom={hasResults ? 12 : 4}
        style={{ height: "1000px", width: "100%", borderRadius: "15px" }}
        attributionControl={false}
      >
      {isDarkMode ? (
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution={CARTO_ATTRIBUTION}
        />
      ) : (
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution={CARTO_ATTRIBUTION}
        />
      )}
      {zipCodeSummaries.map(zipCodeSummary => (
        <Marker
          key={zipCodeSummary.zipcode}
          icon={homeluminaIcon}
          position={[zipCodeSummary.latitude, zipCodeSummary.longitude]}
        >
          <Popup closeButton={false} className="map-popup-theme">
            <ZipCodeCard isMapPopup item={zipCodeSummary} currentHealthMeasure={currentHealthMeasure} />
          </Popup>
        </Marker>
      ))}
      </MapContainer>
    </div>
  );
};