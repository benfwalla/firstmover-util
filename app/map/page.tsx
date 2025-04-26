"use client";

import { useRef } from "react";

import MapProvider from "@/lib/mapbox/provider";
import MapControls from "@/components/map/map-controls";
import MapStyles from "@/components/map/map-styles";
import OpenHouseMarkers from "@/components/open-house-markers";

export default function MapPage() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="map-iframe-container">
      <div
        id="map-container"
        ref={mapContainerRef}
        className="absolute inset-0 h-full w-full"
      />

      <MapProvider
        mapContainerRef={mapContainerRef}
        initialViewState={{
          // New York City coordinates
          longitude: -73.9857,
          latitude: 40.7484,
          zoom: 12,
        }}
      >
        <MapControls />
        <MapStyles />
        <OpenHouseMarkers />
      </MapProvider>
    </div>
  );
}
