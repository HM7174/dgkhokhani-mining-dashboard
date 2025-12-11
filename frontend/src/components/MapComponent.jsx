import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../services/api';

// Fix for default marker icon in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapComponent = () => {
    const [sites, setSites] = useState([]);
    const [trucks, setTrucks] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [sitesRes, trucksRes] = await Promise.all([
                    api.get('/sites'),
                    api.get('/trucks')
                ]);
                setSites(sitesRes.data);
                setTrucks(trucksRes.data);
            } catch (error) {
                console.error('Error fetching map data:', error);
            }
        };
        fetchData();
    }, []);

    // Default center (India approx)
    const defaultCenter = [23.5, 85.5];

    return (
        <MapContainer center={defaultCenter} zoom={6} scrollWheelZoom={false} style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Site Markers */}
            {sites.map(site => (
                site.location_lat && site.location_lng && (
                    <Marker key={`site-${site.id}`} position={[site.location_lat, site.location_lng]}>
                        <Popup>
                            <div className="font-semibold">{site.name}</div>
                            <div className="text-xs text-slate-500">Site Manager: {site.site_manager}</div>
                        </Popup>
                    </Marker>
                )
            ))}

            {/* Truck Markers - For now assuming trucks are at their assigned site if no live GPS */}
            {/* In a real app, we would use live GPS coordinates from the truck entity */}
        </MapContainer>
    );
};

export default MapComponent;
