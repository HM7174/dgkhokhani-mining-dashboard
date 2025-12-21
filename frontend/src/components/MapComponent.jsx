import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../services/api';

// Fix for default marker icon in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Custom vehicle marker icons based on status
const createVehicleIcon = (status) => {
    const getColor = () => {
        switch (status) {
            case 'moving':
            case 'active':
                return '#10b981'; // Green
            case 'idle':
                return '#f59e0b'; // Amber
            case 'stopped':
                return '#6b7280'; // Gray
            default:
                return '#3b82f6'; // Blue
        }
    };

    const color = getColor();

    const svgIcon = `
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="12" fill="${color}" opacity="0.3"/>
            <circle cx="16" cy="16" r="8" fill="${color}" stroke="white" stroke-width="2"/>
            <path d="M12 12 L20 12 L20 16 L19 17 L19 19 L17 19 L17 18 L15 18 L15 19 L13 19 L13 17 L12 16 Z" 
                  fill="white" opacity="0.9"/>
        </svg>
    `;

    return L.divIcon({
        className: 'custom-vehicle-marker',
        html: svgIcon,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
    });
};

// Default site marker
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

// Auto-center map component
function AutoCenterMap({ positions }) {
    const map = useMap();

    useEffect(() => {
        if (positions && positions.length > 0) {
            const bounds = L.latLngBounds(positions.map(pos => [pos.lat, pos.lng]));
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
        }
    }, [positions, map]);

    return null;
}

const MapComponent = ({ liveLocations = [], isLoading = false }) => {
    const [sites, setSites] = useState([]);
    const [mapKey, setMapKey] = useState(0);

    useEffect(() => {
        const fetchSites = async () => {
            try {
                const response = await api.get('/sites');
                setSites(response.data);
            } catch (error) {
                console.error('Error fetching sites:', error);
            }
        };
        fetchSites();
    }, []);

    // Force map re-render when locations change significantly
    useEffect(() => {
        setMapKey(prev => prev + 1);
    }, [liveLocations.length]);

    // Calculate center based on live locations or default to India
    const getMapCenter = () => {
        if (liveLocations && liveLocations.length > 0) {
            const validLocations = liveLocations.filter(loc => loc.lat && loc.lng);
            if (validLocations.length > 0) {
                const lat = validLocations.reduce((sum, loc) => sum + loc.lat, 0) / validLocations.length;
                const lng = validLocations.reduce((sum, loc) => sum + loc.lng, 0) / validLocations.length;
                return [lat, lng];
            }
        }
        return [23.5, 85.5]; // Default to India
    };

    const center = getMapCenter();
    const allPositions = liveLocations.filter(loc => loc.lat && loc.lng);

    return (
        <MapContainer
            key={mapKey}
            center={center}
            zoom={liveLocations.length > 0 ? 8 : 6}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Auto-center to show all vehicles */}
            {allPositions.length > 0 && <AutoCenterMap positions={allPositions} />}

            {/* Live Vehicle Markers */}
            {!isLoading && liveLocations.map((location, index) => {
                if (!location.lat || !location.lng) return null;

                return (
                    <Marker
                        key={`vehicle-${location.vehicle_id}-${index}`}
                        position={[location.lat, location.lng]}
                        icon={createVehicleIcon(location.status || 'active')}
                    >
                        <Popup>
                            <div className="font-sans">
                                <div className="font-bold text-slate-800 mb-1">
                                    {location.vehicle_id || 'Unknown Vehicle'}
                                </div>
                                <div className="text-xs space-y-1 text-slate-600">
                                    {location.speed !== undefined && (
                                        <div>⚡ Speed: <span className="font-semibold">{location.speed} km/h</span></div>
                                    )}
                                    {location.heading !== undefined && (
                                        <div>🧭 Heading: <span className="font-semibold">{location.heading}°</span></div>
                                    )}
                                    {location.timestamp && (
                                        <div className="text-slate-400 mt-2">
                                            📅 {new Date(location.timestamp).toLocaleString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}

            {/* Site Markers */}
            {sites.map(site => (
                site.location_lat && site.location_lng && (
                    <Marker
                        key={`site-${site.id}`}
                        position={[site.location_lat, site.location_lng]}
                        icon={DefaultIcon}
                    >
                        <Popup>
                            <div className="font-sans">
                                <div className="font-semibold text-slate-800">{site.name}</div>
                                <div className="text-xs text-slate-500">Site Manager: {site.site_manager}</div>
                            </div>
                        </Popup>
                    </Marker>
                )
            ))}
        </MapContainer>
    );
};

export default MapComponent;

