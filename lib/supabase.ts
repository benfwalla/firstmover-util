import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Create a single supabase client for the entire app
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false, // We're only using the anon key for public data
    },
  }
);

// Type definition for the open house data returned from the RPC function
export type OpenHouseData = {
  street: string;
  unit: string | null;
  area_name: string;
  zip_code: string;
  state: string;
  url: string;
  open_house_start_et: string;
  open_house_end_et: string;
  bathroom_count: number;
  total_bedrooms: number;
  price: string | number;  // Can be either string or number depending on how Postgres returns it
  available_at: string;
  lead_media_photo: string;
  // These properties will be added after geocoding
  latitude?: number;
  longitude?: number;
};

// Function to fetch upcoming open houses data from Supabase
export async function fetchUpcomingOpenHouses(): Promise<OpenHouseData[]> {
  try {
    // Using the RPC function now that it's fixed to return integer for price
    const { data, error } = await supabase.rpc('upcoming_open_houses');
    
    if (error) {
      console.error('Error fetching open houses:', error.message || error);
      console.error('Error details:', JSON.stringify(error));
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log('No upcoming open houses found');
      return [];
    }
    
    // Log the first item to debug
    if (data.length > 0) {
      console.log('Sample open house data:', JSON.stringify(data[0], null, 2));
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching open houses:', error);
    // Return empty array instead of throwing to avoid breaking the UI
    return [];
  }
}
