
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GeocodeRequest {
  address: string;
  userId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header missing' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Get data from request
    const { address, userId } = await req.json() as GeocodeRequest;

    if (!address || !userId) {
      return new Response(
        JSON.stringify({ error: 'Address and userId are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // For now, we'll use a simple mock geocoding function
    // In a real app, you would call a geocoding service like Google Maps API
    const coordinates = mockGeocode(address);

    // Update the mechanic profile with the geocoded coordinates
    const { data, error } = await supabaseClient
      .from('mechanic_profiles')
      .update({
        latitude: coordinates.lat,
        longitude: coordinates.lng
      })
      .eq('id', userId)
      .select();

    if (error) {
      console.error('Error updating mechanic profile:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to update mechanic location' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        coordinates,
        profile: data?.[0] ?? null
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error) {
    console.error('Error in geocoding function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});

// Mock geocoding function - in a real app, replace with an actual geocoding service
function mockGeocode(address: string) {
  // Generate somewhat random coordinates based on the address string
  // This is just for demonstration - not for production use
  const hash = address.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  
  // Base coordinates (NYC)
  const baseLat = 40.7128;
  const baseLng = -74.0060;
  
  // Add some "randomness" based on the address hash
  const lat = baseLat + (hash % 100) * 0.001;
  const lng = baseLng + (hash % 100) * 0.001;
  
  return { lat, lng };
}
