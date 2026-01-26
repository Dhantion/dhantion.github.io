'use client';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, useMapEvents } from 'react-leaflet';
import { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Icons will be initialized inside the component
let icon: L.Icon | undefined;
let selectedIcon: L.Icon | undefined;

interface MapProps {
    markers?: { position: [number, number]; popup?: string; isSelected?: boolean }[];
    center?: [number, number];
    zoom?: number;
    onMarkerClick?: (name: string) => void;
}

// Component to update map center programmatically
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();
    map.setView(center, zoom);
    return null;
}

import { LOCATIONS } from '../constants/locations';

// Click handler component
function MapClickHandler({ onMapClick }: { onMapClick: (pos: [number, number]) => void }) {
    useMapEvents({
        click(e) {
            console.log("Clicked at:", [e.latlng.lat, e.latlng.lng]);
            onMapClick([e.latlng.lat, e.latlng.lng]);
        },
    });
    return null;
}

export default function RideMap({ markers = [], center = [39.8681, 32.7483], zoom = 13, onMarkerClick }: MapProps) {

    // Initialize icons safely on client-side
    if (typeof window !== 'undefined' && !icon) {
        icon = L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
        });

        selectedIcon = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
    }

    // State for the real driving path
    const [routePath, setRoutePath] = useState<[number, number][]>([]);

    useEffect(() => {
        if (!markers || markers.length < 2) {
            setRoutePath([]);
            return;
        }

        const start = markers[0].position;
        const end = markers[1].position;

        // OSRM requires "lon,lat" format
        const startCoords = `${start[1]},${start[0]}`;
        const endCoords = `${end[1]},${end[0]}`;

        fetch(`https://router.project-osrm.org/route/v1/driving/${startCoords};${endCoords}?overview=full&geometries=geojson`)
            .then(res => res.json())
            .then(data => {
                if (data.routes && data.routes.length > 0) {
                    // Convert GeoJSON [lon, lat] pairs to Leaflet [lat, lon] pairs
                    const coords = data.routes[0].geometry.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number]);
                    setRoutePath(coords);
                }
            })
            .catch(err => console.error("Routing error:", err));

    }, [markers]);

    return (
        <MapContainer center={center} zoom={zoom} style={{ height: '300px', width: '100%', borderRadius: '12px' }}>
            <ChangeView center={center} zoom={zoom} />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Show predefined locations if onMarkerClick is provided (selection mode) */}
            {onMarkerClick && Object.entries(LOCATIONS).map(([name, pos]) => (
                <Marker
                    key={name}
                    position={pos}
                    icon={icon as L.Icon}
                    eventHandlers={{
                        click: () => onMarkerClick(name),
                    }}
                >
                    <Popup>{name} (Click to Select)</Popup>
                </Marker>
            ))}

            {/* Show active markers (Current ride / Request) */}
            {markers.map((m, idx) => (
                <Marker key={idx} position={m.position} icon={(m.isSelected ? selectedIcon : icon) as L.Icon}>
                    {m.popup && <Popup>{m.popup}</Popup>}
                </Marker>
            ))}

            {/* Draw Real Route Polyline if available */}
            {routePath.length > 0 && (
                <Polyline
                    positions={routePath}
                    color="#43e97b" // Bright Green/Teal
                    weight={6}
                    opacity={0.9}
                />
            )}



        </MapContainer>
    );
}
