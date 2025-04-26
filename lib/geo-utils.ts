import { OpenHouseData } from './supabase';
import { OpenHouseListing } from './mapbox/utils';

// Function to geocode an address using Mapbox Geocoding API
export async function geocodeAddress(address: string): Promise<[number, number] | null> {
  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&country=US&limit=1`
    );
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      // Return [longitude, latitude] as required by Mapbox
      return data.features[0].geometry.coordinates as [number, number];
    }
    
    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
}

// Format open house date and time into user-friendly format
// Expects input in format MM/DD/YYYY HH:MI AM/PM
export function formatOpenHouseDateTime(
  startTime: string,
  endTime: string
): { date: string, time: string } {
  try {
    // Parse the date strings (format: MM/DD/YYYY HH:MI AM or military time)
    const parseDateTime = (dateTimeStr: string) => {
      // Check if the format is MM/DD/YYYY HH:MI AM/PM or MM/DD/YYYY HH:MI (military)
      const parts = dateTimeStr.split(' ');
      const datePart = parts[0]; // MM/DD/YYYY
      
      // If it already has AM/PM, use it as is
      if (parts.length > 2 && (parts[2] === 'AM' || parts[2] === 'PM')) {
        return new Date(dateTimeStr);
      }
      
      // Otherwise convert from military time format
      const timeParts = parts[1].split(':');
      const hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);
      
      const [month, day, year] = datePart.split('/');
      const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), hours, minutes);
      return date;
    };
    
    const startDate = parseDateTime(startTime);
    const endDate = parseDateTime(endTime);
    
    // Get today and tomorrow dates for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Format for display
    let dateString;
    if (startDate.getTime() >= today.getTime() && startDate.getTime() < tomorrow.getTime()) {
      dateString = 'Today';
    } else if (startDate.getTime() >= tomorrow.getTime() && startDate.getTime() < tomorrow.getTime() + 86400000) {
      dateString = 'Tomorrow';
    } else {
      const dateOptions: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      };
      dateString = startDate.toLocaleDateString('en-US', dateOptions);
    }
    
    const timeOptions: Intl.DateTimeFormatOptions = { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    };
    
    const formattedStartTime = startDate.toLocaleTimeString('en-US', timeOptions);
    const formattedEndTime = endDate.toLocaleTimeString('en-US', timeOptions);
    
    return {
      date: dateString,
      time: `${formattedStartTime} - ${formattedEndTime}`
    };
  } catch (error) {
    console.error('Error formatting date time:', error);
    // Fallback to basic formatting
    return {
      date: startTime.split(' ')[0], // Just the date part
      time: `${startTime.split(' ')[1]} - ${endTime.split(' ')[1]}` // Just the time parts
    };
  }
}

// Convert OpenHouseData to OpenHouseListing for the map
export async function convertToMapListing(openHouse: OpenHouseData): Promise<OpenHouseListing | null> {
  try {
    // Build the full address for geocoding
    const fullAddress = `${openHouse.street}${openHouse.unit ? ' ' + openHouse.unit : ''}, ${openHouse.area_name}, ${openHouse.state} ${openHouse.zip_code}`;
    
    // Use cached coordinates if available, otherwise geocode
    let coordinates: [number, number] | null;
    if (openHouse.latitude && openHouse.longitude) {
      coordinates = [openHouse.longitude, openHouse.latitude];
    } else {
      coordinates = await geocodeAddress(fullAddress);
    }
    
    if (!coordinates) {
      console.warn(`Could not geocode address: ${fullAddress}`);
      return null;
    }
    
    // Get formatted date/time
    const { date: formattedDate, time: timeRange } = formatOpenHouseDateTime(
      openHouse.open_house_start_et, 
      openHouse.open_house_end_et
    );
    
    // Create photo URL from lead_media_photo
    const photoUrl = openHouse.lead_media_photo ? 
      `https://photos.zillowstatic.com/fp/${openHouse.lead_media_photo}-se_large_800_400.webp` : 
      '';
      
    // Format price to display as currency
    const formatPrice = (price: string | number): string => {
      if (!price) return '';
      const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
      return new Intl.NumberFormat('en-US', {
        style: 'currency', 
        currency: 'USD', 
        maximumFractionDigits: 0
      }).format(numericPrice);
    };
    
    const formattedPrice = formatPrice(openHouse.price);
      
    // Format bedrooms and bathrooms for display
    const formatBedBath = (count: number, isBedroomField: boolean = false): string => {
      // For bedrooms, show "Studio" if count is 0
      if (isBedroomField && count === 0) {
        return "Studio";
      }
      // Show as integers if they're whole numbers (1.0 → 1)
      // otherwise show with 1 decimal place (1.5 → 1.5)
      return count % 1 === 0 ? count.toFixed(0) : count.toFixed(1);
    };
      
    // Create the OpenHouseListing object
    const listing: OpenHouseListing = {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: coordinates
      },
      properties: {
        mapbox_id: `oh-${openHouse.street.replace(/[^a-zA-Z0-9]/g, '')}-${openHouse.unit || ''}`,
        name: `${openHouse.street}${openHouse.unit ? ' ' + openHouse.unit : ''}`,
        feature_type: "address",
        address: `${openHouse.street}${openHouse.unit ? ' ' + openHouse.unit : ''}`,
        full_address: fullAddress,
        context: {},
        coordinates: {
          latitude: coordinates[1],
          longitude: coordinates[0]
        },
        openHouseDate: formattedDate,
        openHouseTime: timeRange,
        bedrooms: openHouse.total_bedrooms || 0,
        bathrooms: openHouse.bathroom_count || 0,
        bedroomsDisplay: formatBedBath(openHouse.total_bedrooms || 0, true),
        bathroomsDisplay: formatBedBath(openHouse.bathroom_count || 0),
        availableAt: openHouse.available_at,
        photoUrl: photoUrl,
        price: typeof openHouse.price === 'string' ? parseFloat(openHouse.price) : (openHouse.price || 0),
        priceDisplay: formattedPrice,
        propertyType: "Apartment",
        // Add a link to the StreetEasy listing
        external_ids: {
          website: openHouse.url
        }
      }
    };
    
    return listing;
  } catch (error) {
    console.error('Error converting to map listing:', error);
    return null;
  }
}
