"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { FilterState } from "@/components/map/map-filters";

export interface MapViewState {
  center: [number, number];
  zoom: number;
  style: string;
}

interface MapStateContextType {
  filters: FilterState;
  mapViewState: MapViewState;
  setFilters: (filters: FilterState) => void;
  setMapViewState: (mapState: MapViewState) => void;
}

// Default NYC coordinates centered on Manhattan
const DEFAULT_MAP_VIEW_STATE: MapViewState = {
  center: [-73.98, 40.73],
  zoom: 12,
  style: "streets-v12",
};

const DEFAULT_FILTERS: FilterState = {
  minPrice: "",
  maxPrice: "",
  bedrooms: ["any"],
  bathrooms: "any",
};

const MapStateContext = createContext<MapStateContextType | undefined>(undefined);

// Storage keys
const FILTERS_STORAGE_KEY = "firstmover-map-filters";
const MAP_VIEW_STORAGE_KEY = "firstmover-map-view";

// Helper functions to save/retrieve from localStorage
function saveToStorage(key: string, data: any) {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

function getFromStorage<T>(key: string, fallback: T): T {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved) as T;
      }
    } catch (e) {
      console.error(`Error retrieving ${key} from storage:`, e);
    }
  }
  return fallback;
}

export function MapStateProvider({ children }: { children: ReactNode }) {
  const [filters, setFiltersState] = useState<FilterState>(DEFAULT_FILTERS);
  const [mapViewState, setMapViewStateLocal] = useState<MapViewState>(DEFAULT_MAP_VIEW_STATE);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved state on initial render
  useEffect(() => {
    const savedFilters = getFromStorage<FilterState>(FILTERS_STORAGE_KEY, DEFAULT_FILTERS);
    const savedMapView = getFromStorage<MapViewState>(MAP_VIEW_STORAGE_KEY, DEFAULT_MAP_VIEW_STATE);
    
    setFiltersState(savedFilters);
    setMapViewStateLocal(savedMapView);
    setIsInitialized(true);
  }, []);

  // Wrapper functions that save to localStorage
  const setFilters = (filters: FilterState) => {
    setFiltersState(filters);
    saveToStorage(FILTERS_STORAGE_KEY, filters);
  };

  const setMapViewState = (mapState: MapViewState) => {
    setMapViewStateLocal(mapState);
    saveToStorage(MAP_VIEW_STORAGE_KEY, mapState);
  };

  return (
    <MapStateContext.Provider
      value={{
        filters,
        mapViewState,
        setFilters,
        setMapViewState,
      }}
    >
      {isInitialized && children}
    </MapStateContext.Provider>
  );
}

export function useMapState() {
  const context = useContext(MapStateContext);
  if (context === undefined) {
    throw new Error("useMapState must be used within a MapStateProvider");
  }
  return context;
}
