"use client";

import mapboxgl, { MarkerOptions } from "mapbox-gl";
import React, { useEffect, useRef, useCallback } from "react";

import { useMap } from "@/context/map-context";
import { LocationFeature } from "@/lib/mapbox/utils";

type Props = {
  longitude: number;
  latitude: number;
  data: LocationFeature;
  onHover?: ({
    isHovered,
    position,
    marker,
    data,
  }: {
    isHovered: boolean;
    position: { longitude: number; latitude: number };
    marker: mapboxgl.Marker;
    data: LocationFeature;
  }) => void;
  onClick?: ({
    position,
    marker,
    data,
  }: {
    position: { longitude: number; latitude: number };
    marker: mapboxgl.Marker;
    data: LocationFeature;
  }) => void;
  children?: React.ReactNode;
} & MarkerOptions;

export default function Marker({
  children,
  latitude,
  longitude,
  data,
  onHover,
  onClick,
  ...props
}: Props) {
  const { map } = useMap();
  const markerRef = useRef<HTMLDivElement | null>(null);
  const markerInstance = useRef<mapboxgl.Marker | null>(null);

  const handleHover = useCallback((isHovered: boolean) => {
    if (onHover && markerInstance.current) {
      onHover({
        isHovered,
        position: { longitude, latitude },
        marker: markerInstance.current,
        data,
      });
    }
  }, [onHover, longitude, latitude, data, markerInstance]);

  const handleClick = useCallback(() => {
    if (onClick && markerInstance.current) {
      onClick({
        position: { longitude, latitude },
        marker: markerInstance.current,
        data,
      });
    }
  }, [onClick, longitude, latitude, data, markerInstance]);

  useEffect(() => {
    const markerEl = markerRef.current;
    if (!map || !markerEl) return;

    markerEl.addEventListener('click', () => handleClick());
    markerEl.addEventListener('mouseenter', () => handleHover(true));
    markerEl.addEventListener('mouseleave', () => handleHover(false));

    const options = {
      element: markerEl,
      ...props,
    };

    markerInstance.current = new mapboxgl.Marker(options)
      .setLngLat([longitude, latitude])
      .addTo(map);

    return () => {
      // Cleanup on unmount
      if (markerInstance.current) markerInstance.current.remove();
      if (markerEl) {
        markerEl.removeEventListener("click", () => handleClick());
        markerEl.removeEventListener("mouseenter", () => handleHover(true));
        markerEl.removeEventListener("mouseleave", () => handleHover(false));
      }
    };
  }, [map, longitude, latitude, props, handleClick, handleHover]);

  return (
    <div>
      <div ref={markerRef}>{children}</div>
    </div>
  );
}
