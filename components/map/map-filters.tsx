"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, SlidersHorizontal, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { OpenHouseListing } from "@/lib/mapbox/utils";

// Define the filter options
const BEDROOM_OPTIONS = [
  { value: "any", label: "Any" },
  { value: "studio", label: "Studio" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4+", label: "4+" },
];

const BATHROOM_OPTIONS = [
  { value: "any", label: "Any" },
  { value: "1+", label: "1+" },
  { value: "1.5+", label: "1.5+" },
  { value: "2+", label: "2+" },
  { value: "3+", label: "3+" },
];

export type FilterState = {
  minPrice: string;
  maxPrice: string;
  bedrooms: string[];
  bathrooms: string;
};

const DEFAULT_FILTERS: FilterState = {
  minPrice: "",
  maxPrice: "",
  bedrooms: ["any"],
  bathrooms: "any",
};

// Removed localStorage utility functions - now handled by context

interface MapFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  onExpand?: () => void; // Add callback for when filter expands to dismiss popups
  onCollapse?: () => void; // Add callback for when filter collapses
  isExpanded?: boolean; // Allow external control of expanded state
  setIsExpanded?: React.Dispatch<React.SetStateAction<boolean>>; // Allow external setting of expanded state
}

export default function MapFilters({ 
  onFiltersChange, 
  onExpand, 
  onCollapse,
  isExpanded: externalIsExpanded, 
  setIsExpanded: externalSetIsExpanded 
}: MapFiltersProps) {
  const [internalIsExpanded, setInternalIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  
  // Use either external or internal expanded state
  const isExpanded = externalIsExpanded !== undefined ? externalIsExpanded : internalIsExpanded;
  const setIsExpanded = externalSetIsExpanded || setInternalIsExpanded;
  
  // Handle expansion and trigger callback
  const handleExpand = () => {
    setIsExpanded(true);
    if (onExpand) onExpand();
  };
  
  // Handle collapse and trigger callback
  const handleCollapse = () => {
    setIsExpanded(false);
    if (onCollapse) onCollapse();
  };

  // No longer loading filters from localStorage directly - now handled by context

  // Handle min price change
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow numbers
    const newFilters = { ...filters, minPrice: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // Handle max price change
  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow numbers
    const newFilters = { ...filters, maxPrice: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // Handle bedroom selection
  const handleBedroomChange = (value: string) => {
    let newBedrooms: string[];
    
    // If clicking "Any", deselect all others
    if (value === "any") {
      newBedrooms = ["any"];
    } 
    // If any other value is clicked and "Any" was selected, replace "Any" with the new value
    else if (filters.bedrooms.includes("any")) {
      newBedrooms = [value];
    }
    // If the value is already selected, remove it
    else if (filters.bedrooms.includes(value)) {
      newBedrooms = filters.bedrooms.filter(bed => bed !== value);
      
      // If nothing is selected, default back to "Any"
      if (newBedrooms.length === 0) {
        newBedrooms = ["any"];
      }
    } 
    // Otherwise add the value to the selection
    else {
      newBedrooms = [...filters.bedrooms, value];
    }
    
    const newFilters = { ...filters, bedrooms: newBedrooms };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // Handle bathroom selection
  const handleBathroomChange = (value: string) => {
    const newFilters = { ...filters, bathrooms: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // Reset all filters
  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    onFiltersChange(DEFAULT_FILTERS);
  };

  // Count active filters for the badge
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    if (!filters.bedrooms.includes('any')) count++;
    if (filters.bathrooms !== 'any') count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className={cn(
      "absolute top-4 z-10 transition-all duration-200",
      // Mobile: Center horizontally
      "left-1/2 -translate-x-1/2",
      // Desktop: Align exactly 16px from left, matching the listing panel
      "sm:left-[16px] sm:translate-x-0",
      // Width adjustments: Expanded takes 340px on desktop, Collapsed takes auto width but limited max-width
      isExpanded 
        ? "w-[90vw] sm:w-[340px]" 
        : activeFilterCount > 0 
          ? "w-auto max-w-[240px]" // Increased max-width when filters are active and collapsed
          : "w-auto max-w-[120px]" // Original smaller max-width when no filters are active
    )}>
      <Card className="shadow-lg overflow-hidden">
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Button 
                variant="ghost" 
                size="sm"
                className="flex items-center gap-1 bg-white hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                onClick={() => isExpanded ? handleCollapse() : handleExpand()}
              >
                <SlidersHorizontal className="h-4 w-4 text-gray-800 dark:text-white" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1 bg-background">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </div>
            {/* Always show Reset button when filters are active, regardless of expanded state */}
            {activeFilterCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleReset}
                className="flex-shrink-0 flex items-center whitespace-nowrap px-2 h-8"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Reset
              </Button>
            )}
          </div>
          {isExpanded && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={handleCollapse}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {isExpanded && (
          <CardContent className="pb-3 pt-0 grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm mb-1.5 font-medium">Min Price ($)</p>
                <Input 
                  placeholder="2500"
                  value={filters.minPrice}
                  onChange={handleMinPriceChange}
                />
              </div>
              <div>
                <p className="text-sm mb-1.5 font-medium">Max Price ($)</p>
                <Input 
                  placeholder="5000"
                  value={filters.maxPrice} 
                  onChange={handleMaxPriceChange}
                />
              </div>
            </div>
            
            <div>
              <p className="text-sm mb-1.5 font-medium">Bedrooms</p>
              <div className="grid grid-cols-6 gap-1.5"> {/* Force 6 columns to fit all options in one row */}
                {BEDROOM_OPTIONS.map(option => (
                  <Button
                    key={option.value}
                    variant={filters.bedrooms.includes(option.value) ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "flex-1 min-w-[40px]",
                      filters.bedrooms.includes(option.value)
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-white hover:bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600",
                      option.value === "studio" ? "px-3" : "" // Add more padding specifically for Studio
                    )}
                    onClick={() => handleBedroomChange(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <p className="text-sm mb-1.5 font-medium">Bathrooms</p>
              <div className="grid grid-cols-5 gap-1.5"> {/* Force 5 columns for all bathroom options in one row */}
                {BATHROOM_OPTIONS.map(option => (
                  <Button
                    key={option.value}
                    variant={filters.bathrooms === option.value ? "default" : "outline"}
                    size="sm"
                    className="w-full px-2.5" // Increased px
                    onClick={() => handleBathroomChange(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="text-xs text-center text-muted-foreground mt-1">
              Specific times might be out of date. Please check the listing&apos;s StreetEasy page to confirm.
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

// Helper function to filter listings based on filters
export function filterListings(listings: OpenHouseListing[], filters: FilterState): OpenHouseListing[] {
  return listings.filter(listing => {
    const price = listing.properties.price;
    const bedrooms = listing.properties.bedrooms;
    const bathrooms = listing.properties.bathrooms;
    
    // Filter by price
    if (filters.minPrice && price < parseInt(filters.minPrice)) return false;
    if (filters.maxPrice && price > parseInt(filters.maxPrice)) return false;
    
    // Filter by bedrooms
    let bedroomsMatch = true;
    if (!filters.bedrooms.includes('any')) {
      bedroomsMatch = false; // Default to false unless we match below
      
      // Studio (0 bedrooms)
      if (filters.bedrooms.includes('studio') && bedrooms === 0) {
        bedroomsMatch = true;
      }
      // 4+ bedrooms
      else if (filters.bedrooms.includes('4+') && bedrooms >= 4) {
        bedroomsMatch = true;
      }
      // Standard bedroom numbers
      else if (filters.bedrooms.includes(bedrooms.toString())) {
        bedroomsMatch = true;
      }
      
      // If bedrooms don't match any criteria, filter it out
      if (!bedroomsMatch) return false;
    }
    
    // Filter by bathrooms
    if (filters.bathrooms !== 'any') {
      const minBathrooms = parseFloat(filters.bathrooms.replace('+', ''));
      if (bathrooms < minBathrooms) return false;
    }
    
    return true;
  });
}
