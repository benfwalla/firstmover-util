"use client";

import { Home, MapPin } from "lucide-react";

import { LocationFeature } from "@/lib/mapbox/utils";
import Marker from "./map/map-marker";

interface LocationMarkerProps {
  location: LocationFeature;
  onHover: (location: LocationFeature | null) => void;
  onClick: (location: LocationFeature) => void;
  highlight?: boolean;
}

export function LocationMarker({ location, onHover, onClick, highlight = false }: LocationMarkerProps) {
  // Check if this is an open house listing with specific properties
  const isOpenHouse = 'openHouseDate' in location.properties;
  return (
    <Marker
      longitude={location.geometry.coordinates[0]}
      latitude={location.geometry.coordinates[1]}
      data={location}
      onHover={({ isHovered, data }) => {
        // Only pass data when hovering, pass null when not hovering
        if (isHovered) {
          onHover(data);
        } else {
          onHover(null); // We'll handle null in the parent component
        }
      }}
      onClick={({ data }) => {
        // Handle click on marker
        onClick?.(data);
      }}
    >
      <div className={`rounded-full flex items-center justify-center transform transition-all duration-200 ${isOpenHouse ? 'bg-[#0171E5]' : 'bg-rose-500'} ${highlight ? 'scale-110 ring-2 ring-white shadow-md' : ''} text-white shadow-lg size-8 cursor-pointer hover:scale-105 hover:shadow-xl relative`}>
        {/* Glow effect on hover */}
        {highlight && (
          <div className="absolute inset-0 rounded-full bg-[#0171E5] opacity-25 blur-sm -z-10 animate-pulse"></div>
        )}
        {isOpenHouse ? (
          <Home className="stroke-[2.5px] size-4.5" />
        ) : (
          <MapPin className="stroke-[2.5px] size-4.5" />
        )}
      </div>
    </Marker>
  );
}
