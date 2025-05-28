import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DirectionsMap = () => {
  const mapRef = useRef(null);       // To hold the Leaflet map instance
  const mapContainerRef = useRef(null); // To hold the div reference

  useEffect(() => {
    // If map already exists, just return (prevent multiple inits)
    if (mapRef.current) return;

    // Initialize map
    mapRef.current = L.map(mapContainerRef.current, {
      center: [51.505, -0.09], // your coords
      zoom: 13,
      scrollWheelZoom: false,
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapRef.current);

    // Cleanup on unmount
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div
      ref={mapContainerRef}
      className="
        fixed bottom-0 left-0 right-0
        h-64 md:h-96
        bg-gray-900 border-t border-gray-700
        z-20
      "
      style={{ filter: 'brightness(0.8)' }}
    />
  );
};

export default DirectionsMap;
