"use client";

import { useState } from "react";
import { useMapState } from "@/context/map-state-context";
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

export type DateRange = 'all' | 'today' | 'tomorrow' | 'week' | 'weekend';

export type FilterState = {
  minPrice: string;
  maxPrice: string;
  bedrooms: string[];
  bathrooms: string;
  dateRange: DateRange;
};

const DEFAULT_FILTERS: FilterState = {
  minPrice: "",
  maxPrice: "",
  bedrooms: ["any"],
  bathrooms: "any",
  dateRange: 'all', // Default to showing all open houses
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
  const { filters, setFilters } = useMapState() || { filters: DEFAULT_FILTERS, setFilters: () => {} };
  
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

  // Handle date range change
  const handleDateRangeChange = (range: DateRange) => {
    const newFilters = { ...filters, dateRange: range };
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
    <div className="relative">
      {/* Overlay for mobile when expanded */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 sm:hidden"
          onClick={handleCollapse}
        />
      )}
      
      {/* Main filters container */}
      <div className={cn(
        "absolute z-50 transition-all duration-200",
        // Position in top left when collapsed
        "top-4 left-4",
        // When expanded on mobile, take full screen
        isExpanded && "fixed inset-0 flex items-start justify-center sm:items-start sm:justify-start sm:absolute sm:inset-auto sm:top-4 sm:left-4"
      )}>
        <Card className={cn(
          // Base styles
          "shadow-lg overflow-y-auto",
          // Background colors
          "bg-white dark:bg-gray-800",
          // Normal card size when collapsed
          !isExpanded && "w-auto max-h-[90vh]",
          // Expanded styles
          isExpanded && [
            "w-full sm:w-[340px] max-h-[90vh]",
            "flex flex-col"
          ]
        )}>
          <div className={cn(
            "p-3 flex items-center justify-between",
            isExpanded && "sticky top-0 bg-white dark:bg-gray-800 z-10 border-b"
          )}>
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
            <div>
              <p className="text-sm mb-1.5 font-medium">When</p>
              <div className="flex flex-wrap gap-1.5 -mx-1.5 px-1.5">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'today', label: 'Today' },
                  { value: 'tomorrow', label: 'Tomorrow' },
                  { value: 'week', label: 'This Week' },
                  { value: 'weekend', label: 'This Weekend' },
                ].map(({ value, label }) => (
                  <Button
                    key={value}
                    variant={filters.dateRange === value ? "secondary" : "secondary"}
                    size="sm"
                    className={cn(
                      "flex-shrink-0 text-center whitespace-nowrap px-2",
                      filters.dateRange === value
                        ? "bg-gray-800 hover:bg-gray-900 text-white"
                        : "bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
                    )}
                    onClick={() => handleDateRangeChange(value as DateRange)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
            
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
              <div className="flex flex-nowrap gap-1.5 w-full overflow-x-auto pb-1"> {/* Flex container that keeps all items in one row */}
                {BEDROOM_OPTIONS.map(option => (
                  <Button
                    key={option.value}
                    variant={filters.bedrooms.includes(option.value) ? "secondary" : "outline"}
                    size="sm"
                    className={cn(
                      "flex-shrink-0 text-center",
                      option.value === "studio" ? "w-15" : "w-10", // Wider for Studio
                      filters.bedrooms.includes(option.value)
                        ? "bg-gray-800 hover:bg-gray-900 text-white"
                        : "bg-white hover:bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
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
                    variant={filters.bathrooms === option.value ? "secondary" : "outline"}
                    size="sm"
                    className={cn(
                      "w-full px-2.5 text-center justify-center",
                      filters.bathrooms === option.value 
                        ? "bg-gray-800 hover:bg-gray-900 text-white"
                        : "bg-white hover:bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    )}
                    onClick={() => handleBathroomChange(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="text-xs text-center text-muted-foreground mt-1 pb-4">
              Specific times might be out of date. Please check the listing&apos;s StreetEasy page to confirm.
            </div>
          </CardContent>
        )}
        </Card>
      </div>
    </div>
  );
}

// Helper function to parse date string in format 'Tuesday, Jul 1' to a Date object
function parseDisplayDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  try {
    // Handle 'Today' and 'Tomorrow' special cases
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dateStr === 'Today') return today;
    
    if (dateStr === 'Tomorrow') {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }
    
    // Handle 'Weekday, Month Day' format (e.g., 'Tuesday, Jul 1')
    const dateParts = dateStr.split(', ');
    if (dateParts.length === 2) {
      const [_, monthDay] = dateParts;
      const [month, day] = monthDay.split(' ');
      
      // Get current year
      const year = today.getFullYear();
      // Create a date in the current year
      const date = new Date(`${month} ${day}, ${year}`);
      
      // If the date is in the past, try next year
      if (date < today) {
        date.setFullYear(year + 1);
      }
      
      return date;
    }
    
    return null;
  } catch (_error) {
    // Handle date parsing error
    return null;
  }
}

// Helper function to check if a date is within a date range
function isDateInRange(dateString: string, range: DateRange): boolean {

  
  // If no date range is selected, include all
  if (range === 'all') return true;
  
  // Parse the listing date
  const listingDate = parseDisplayDate(dateString);
  if (!listingDate) {

    return true; // Include if we can't parse the date
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Calculate date ranges
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // End of week (next Sunday)
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
  
  // Weekend (next Saturday to Sunday)
  const startOfWeekend = new Date(today);
  startOfWeekend.setDate(today.getDate() + (6 - today.getDay()));
  
  const endOfWeekend = new Date(startOfWeekend);
  endOfWeekend.setDate(startOfWeekend.getDate() + 1);
  
  // Convert listing date to start of day for comparison
  const listingDateStart = new Date(listingDate);
  listingDateStart.setHours(0, 0, 0, 0);
  
  // Date comparison values removed
  
  // Compare dates
  switch (range) {
    case 'today':
      return listingDateStart.getTime() === today.getTime();
    case 'tomorrow':
      return listingDateStart.getTime() === tomorrow.getTime();
    case 'weekend':
      return listingDateStart >= startOfWeekend && listingDateStart <= endOfWeekend;
    case 'week':
      return listingDateStart >= today && listingDateStart <= endOfWeek;
    default:
      return true;
  }
}

// Helper function to filter listings based on filters
export function filterListings(listings: OpenHouseListing[], filters: FilterState): OpenHouseListing[] {
  return listings.filter(listing => {
    const price = listing.properties.price;
    const bedrooms = listing.properties.bedrooms;
    const bathrooms = listing.properties.bathrooms;
    const openHouseDate = listing.properties.openHouseDate || '';
    
    // Filter by date range
    if (filters.dateRange && !isDateInRange(openHouseDate, filters.dateRange)) {
      return false;
    }
    
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
