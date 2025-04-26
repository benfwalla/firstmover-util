"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { LocationFeature, OpenHouseListing } from "@/lib/mapbox/utils";
import { LocationMarker } from "./location-marker";
import { fetchUpcomingOpenHouses } from "@/lib/supabase";
import { convertToMapListing } from "@/lib/geo-utils";
import { useMap } from "@/context/map-context";
import { MapViewState, useMapState } from "@/context/map-state-context";
import ListingDetailPanel from "./listing-detail-panel"; 
import MapFilters, { FilterState, filterListings } from "./map/map-filters";
import mapboxgl from "mapbox-gl";

// Sample data for fallback if Supabase fetch fails
const SAMPLE_OPEN_HOUSES: OpenHouseListing[] = [
  {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [-73.9667, 40.7794] // Upper East Side
    },
    properties: {
      mapbox_id: "oh1",
      name: "Luxury Upper East Side Condo",
      feature_type: "address",
      address: "235 E 73rd St, New York, NY 10021",
      full_address: "235 E 73rd St, New York, NY 10021",
      context: {},
      coordinates: {
        latitude: 40.7794,
        longitude: -73.9667
      },
      openHouseDate: "Saturday, April 26, 2025",
      openHouseTime: "12:00 PM - 2:00 PM",
      price: 1250000,
      priceDisplay: "$1,250,000",
      bedrooms: 2,
      bathrooms: 2,
      bedroomsDisplay: "2",
      bathroomsDisplay: "2",
      availableAt: "2025-05-01",
      photoUrl: "https://photos.zillowstatic.com/fp/ad59ed2033d6ee4a930bac5637ff8b5e-se_large_800_400.webp",
      propertyType: "Condo",
      external_ids: {
        website: "https://streeteasy.com/building/235-east-73-street-new_york/3a"
      }
    }
  },
  {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [-73.9814, 40.7348] // Gramercy Park
    },
    properties: {
      mapbox_id: "oh2",
      name: "Gramercy Park Studio",
      feature_type: "address",
      address: "210 E 21st St, New York, NY 10010",
      full_address: "210 E 21st St, New York, NY 10010",
      context: {},
      coordinates: {
        latitude: 40.7348,
        longitude: -73.9814
      },
      openHouseDate: "Sunday, April 27, 2025",
      openHouseTime: "11:00 AM - 1:00 PM",
      price: 725000,
      priceDisplay: "$725,000",
      bedrooms: 0,
      bathrooms: 1,
      bedroomsDisplay: "0",
      bathroomsDisplay: "1",
      availableAt: "2025-05-15",
      photoUrl: "https://photos.zillowstatic.com/fp/57e32473585d45035144cc18e20c145c-se_large_800_400.webp",
      propertyType: "Co-op",
      external_ids: {
        website: "https://streeteasy.com/building/gramercy-park-towers/21b"
      }
    }
  },
  {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [-74.0084, 40.7397] // West Village
    },
    properties: {
      mapbox_id: "oh3",
      name: "Historic West Village Brownstone",
      feature_type: "address",
      address: "53 Charles St, New York, NY 10014",
      full_address: "53 Charles St, New York, NY 10014",
      context: {},
      coordinates: {
        latitude: 40.7397,
        longitude: -74.0084
      },
      openHouseDate: "Saturday, April 26, 2025",
      openHouseTime: "2:00 PM - 4:00 PM",
      price: 3875000,
      priceDisplay: "$3,875,000",
      bedrooms: 3,
      bathrooms: 2.5,
      bedroomsDisplay: "3",
      bathroomsDisplay: "2.5",
      availableAt: "2025-06-01",
      photoUrl: "https://photos.zillowstatic.com/fp/334129066df87b2f73c1cace0da30d0f-se_large_800_400.webp",
      propertyType: "Townhouse",
      external_ids: {
        website: "https://streeteasy.com/building/53-charles-street-new_york/townhouse"
      }
    }
  },
  {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [-73.9707, 40.7608] // Midtown East
    },
    properties: {
      mapbox_id: "oh4",
      name: "Luxury Midtown Condo",
      feature_type: "address",
      address: "300 E 55th St, New York, NY 10022",
      full_address: "300 E 55th St, New York, NY 10022",
      context: {},
      coordinates: {
        latitude: 40.7608,
        longitude: -73.9707
      },
      openHouseDate: "Sunday, April 27, 2025",
      openHouseTime: "1:00 PM - 3:00 PM",
      price: 1850000,
      priceDisplay: "$1,850,000",
      bedrooms: 2,
      bathrooms: 2,
      bedroomsDisplay: "2",
      bathroomsDisplay: "2",
      availableAt: "2025-05-15",
      photoUrl: "https://photos.zillowstatic.com/fp/6602125fe0bac23571ada9c448ecf05d-se_large_800_400.webp",
      propertyType: "Condo",
      external_ids: {
        website: "https://streeteasy.com/building/the-milan/15d"
      }
    }
  },
  {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [-73.9445, 40.7769] // Upper East Side
    },
    properties: {
      mapbox_id: "oh5",
      name: "Upper East Side Classic Six",
      feature_type: "address",
      address: "125 E 84th St, New York, NY 10028",
      full_address: "125 E 84th St, New York, NY 10028",
      context: {},
      coordinates: {
        latitude: 40.7769,
        longitude: -73.9445
      },
      openHouseDate: "Saturday, April 26, 2025",
      openHouseTime: "3:00 PM - 5:00 PM",
      price: 2650000,
      priceDisplay: "$2,650,000",
      bedrooms: 3,
      bathrooms: 2,
      bedroomsDisplay: "3",
      bathroomsDisplay: "2",
      availableAt: "2025-06-15",
      photoUrl: "https://photos.zillowstatic.com/fp/dfbd282cbfed1d60df94c0c19ca0d90d-se_large_800_400.webp",
      propertyType: "Co-op",
      external_ids: {
        website: "https://streeteasy.com/building/125-east-84-street-new_york/6a"
      }
    }
  }
];

export default function OpenHouseMarkers() {
  const { map } = useMap();
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const { filters, setFilters, mapViewState, setMapViewState } = useMapState();
  
  // Local state for locations
  const [openHouses, setOpenHouses] = useState<OpenHouseListing[]>([]);
  const [filteredHouses, setFilteredHouses] = useState<OpenHouseListing[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationFeature | null>(null);
  
  // Use a no-op function for hover handling instead of unused state
  const setHoveredLocation = useCallback(() => {
    // Visual feedback handled directly in marker component
  }, []);
  const [error, setError] = useState<string | null>(null);
  // Track filter panel expanded state
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  // Fetch real open house data from Supabase
  useEffect(() => {
    async function fetchOpenHouses() {
      try {
        setError(null);
        
        // Log Supabase URL and key prefix to debug (we'll mask most of the key)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set';
        const anonKeyPrefix = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
          ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 8) + '...' 
          : 'Not set';
        
        console.log('Supabase config:', { 
          url: supabaseUrl,
          keyPrefix: anonKeyPrefix,
        });
        
        const openHouseData = await fetchUpcomingOpenHouses();
        console.log('Open house data fetched:', 
          openHouseData.length > 0 ? `${openHouseData.length} listings` : 'No listings');
        
        // If first item exists, log it to debug format
        if (openHouseData.length > 0) {
          console.log('Sample open house data:', JSON.stringify(openHouseData[0], null, 2));
        }
        
        if (openHouseData.length === 0) {
          console.log('Using sample data due to empty response');
          // If no data returned from API, use sample data
          setOpenHouses(SAMPLE_OPEN_HOUSES);
          // Initialize filtered houses immediately
          setFilteredHouses(filterListings(SAMPLE_OPEN_HOUSES, filters));
          return;
        }

        try {
          // Process each open house listing - properly handling async
          const listings = await Promise.all(
            openHouseData.map(async (item) => {
              const result = await convertToMapListing(item);
              return result; // This will be OpenHouseListing | null
            })
          );
          
          // Filter out nulls
          const validListings = listings.filter((item): item is OpenHouseListing => item !== null);
          
          setOpenHouses(validListings);
          // Immediate filter based on current filters
          setFilteredHouses(filterListings(validListings, filters));
        } catch (error) {
          console.error('Error processing listings:', error);
          // Fallback to sample data
          setOpenHouses(SAMPLE_OPEN_HOUSES);
          setFilteredHouses(filterListings(SAMPLE_OPEN_HOUSES, filters));
        } finally {
        }
        
      } catch (err) {
        console.error('Error fetching open houses:', err);
        setError('Failed to load open houses');
        // Fallback to sample data
        setOpenHouses(SAMPLE_OPEN_HOUSES);
        // Initialize filtered houses immediately with sample data
        setFilteredHouses(filterListings(SAMPLE_OPEN_HOUSES, filters));
      } finally {
      }
    }
    
    fetchOpenHouses();
  }, []);

  // Initialize and apply filters when open houses change or filters change
  useEffect(() => {
    if (openHouses && openHouses.length > 0) {
      setFilteredHouses(filterListings(openHouses, filters));
    }
  }, [openHouses, filters]);

  // Apply map view state (center, zoom, style) on load
  // Initialize map and set up view state management
  useEffect(() => {
    if (!map) return;
    mapRef.current = map;
    
    // Save state when map moves or zooms
    const saveMapState = () => {
      if (!mapRef.current) return;
      
      const center = mapRef.current.getCenter();
      const zoom = mapRef.current.getZoom();
      
      const newState: MapViewState = {
        center: [center.lng, center.lat],
        zoom: zoom,
        style: mapViewState.style
      };
      setMapViewState(newState);
    };
    
    // Wait for map to be loaded before setting initial view
    const initMap = () => {
      // Set center and zoom level
      map.setCenter(mapViewState.center);
      map.setZoom(mapViewState.zoom);
      
      // Set up event handlers
      map.on('moveend', saveMapState);
      map.on('zoomend', saveMapState);
    };
    
    if (map.loaded()) {
      initMap();
    } else {
      map.once('load', initMap);
    }
    
    return () => {
      map.off('moveend', saveMapState);
      map.off('zoomend', saveMapState);
    };
  }, [map, mapViewState, setMapViewState]);
  
  // Handle style changes separately
  useEffect(() => {
    if (!map) return;
    console.log(`Setting map style to: ${mapViewState.style}`);
    
    const changeStyle = () => {
      // Set the style once the map is ready
      map.setStyle(`mapbox://styles/mapbox/${mapViewState.style}`);
    };
    
    if (map.loaded()) {
      changeStyle();
    } else {
      map.once('load', changeStyle);
    }
  }, [map, mapViewState.style]);

  useEffect(() => {
    if (!map) return;
    mapRef.current = map;

    const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
      // If we clicked on the map (not a marker), close any open popup
      if (selectedLocation) {
        // Check if the click target is a marker or part of a popup
        const clickedMarker = e.originalEvent.target instanceof Element && 
          (e.originalEvent.target.closest('.mapboxgl-marker') || 
           e.originalEvent.target.closest('.mapboxgl-popup'));
        
        if (!clickedMarker) {
          setSelectedLocation(null);
        }
      }
    };
    
    map.on('click', handleMapClick);
    
    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, selectedLocation]);

  // Handle marker hover - just updates hover state for visual feedback
  const handleMarkerHover = useCallback((_location: LocationFeature | null) => {
    setHoveredLocation(); // Call with no arguments
  }, [setHoveredLocation]);

  // Handle marker click - shows popup or closes if clicking same pin
  const handleMarkerClick = (location: LocationFeature) => {
    // If user clicks the same pin that's already selected, close the popup
    if (selectedLocation && selectedLocation.properties.mapbox_id === location.properties.mapbox_id) {
      setSelectedLocation(null);
    } else {
      // Otherwise, show the popup for the clicked pin
      setSelectedLocation(location);
      // Auto-collapse filter panel when opening a popup to prevent overlap
      setIsFilterExpanded(false);
    }
  };

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, [setFilters]);
  
  // Handle filter expansion - dismiss any open popups
  const handleFilterExpand = useCallback(() => {
    if (selectedLocation) {
      setSelectedLocation(null);
    }
    setIsFilterExpanded(true);
  }, [selectedLocation]);
  
  // Handle filter collapse
  const handleFilterCollapse = useCallback(() => {
    setIsFilterExpanded(false);
  }, []);

  // Container for detail panel and filters - separate positioning for mobile vs desktop
  const mapPanelStyles = {
    desktop: {
      container: "hidden md:block", // Only visible on desktop (md+)
      filters: "absolute top-4 left-[16px] z-20", // Exact pixel left positioning for perfect alignment
      listing: "absolute top-[100px] left-[16px] z-20 w-[320px]" // Matching exact pixel positioning
    },
    mobile: {
      container: "block md:hidden", // Only visible on mobile
      filters: "absolute top-4 left-4 z-20", // Position filters at top-left
      listing: "fixed bottom-0 left-0 right-0 z-20" // Position listing as bottom sheet
    }
  };

  return (
    <>
      {/* Desktop layout - hidden on mobile */}
      <div className={mapPanelStyles.desktop.container}>
        <div className={mapPanelStyles.desktop.filters}>
          <MapFilters 
            onFiltersChange={handleFiltersChange} 
            onExpand={handleFilterExpand}
            onCollapse={handleFilterCollapse}
            isExpanded={isFilterExpanded}
            setIsExpanded={setIsFilterExpanded}
          />
        </div>
        {selectedLocation && (
          <div className={mapPanelStyles.desktop.listing}>
            <ListingDetailPanel
              selectedLocation={selectedLocation}
              onClose={() => setSelectedLocation(null)} 
            />
          </div>
        )}
      </div>
      
      {/* Mobile layout - hidden on desktop */}
      <div className={mapPanelStyles.mobile.container}>
        <div className={mapPanelStyles.mobile.filters}>
          <MapFilters 
            onFiltersChange={handleFiltersChange} 
            onExpand={handleFilterExpand}
            onCollapse={handleFilterCollapse}
            isExpanded={isFilterExpanded}
            setIsExpanded={setIsFilterExpanded}
          />
        </div>
        {selectedLocation && (
          <div className={mapPanelStyles.mobile.listing}>
            <ListingDetailPanel
              selectedLocation={selectedLocation}
              onClose={() => setSelectedLocation(null)} 
            />
          </div>
        )}
      </div>
    
      {error ? (
        <div className="absolute top-4 left-4 right-4 z-10 bg-destructive/90 text-destructive-foreground p-4 rounded-lg">
          <p className="text-sm font-medium">{error}</p>
        </div>
      ) : null}

      {/* Show individual markers */}
      {filteredHouses.map((location) => {
        const isSelected = selectedLocation?.properties.mapbox_id === location.properties.mapbox_id;
        return (
          <LocationMarker
            key={location.properties.mapbox_id}
            location={location}
            onHover={handleMarkerHover}
            onClick={handleMarkerClick}
            highlight={isSelected} // Pass highlight status to the imported component
          />
        );
      })}
    </>
  );
}
