
// Edge function to properly handle user sign up with services data
// This is registered as a hook for auth.create_user event in Supabase

export async function handleUserSignup(event, context) {
  const { data } = event;
  const { user, raw_user_meta_data } = data;
  
  // Safety check for required data
  if (!user || !user.id || !raw_user_meta_data) {
    console.error('Missing required user data');
    return;
  }
  
  try {
    const supabaseClient = context.supabase;
    
    // Insert into profiles table
    await supabaseClient
      .from('profiles')
      .insert({
        id: user.id,
        name: raw_user_meta_data.name || 'New User',
        email: user.email,
        role: raw_user_meta_data.role || 'customer',
        phone_number: raw_user_meta_data.phoneNumber
      });
      
    // If role is mechanic, create mechanic profile
    if (raw_user_meta_data.role === 'mechanic') {
      // Handle services correctly - ensure it's an array
      let services = [];
      
      if (raw_user_meta_data.services) {
        if (typeof raw_user_meta_data.services === 'string') {
          // Parse string services
          services = raw_user_meta_data.services.split(',').map(s => s.trim());
        } else if (Array.isArray(raw_user_meta_data.services)) {
          // Already an array
          services = raw_user_meta_data.services;
        }
      }
      
      await supabaseClient
        .from('mechanic_profiles')
        .insert({
          id: user.id,
          services: services,
          address: raw_user_meta_data.address || '',
          availability: raw_user_meta_data.availability || ''
        });
    }
    
    console.log('User profile created successfully:', user.id);
  } catch (error) {
    console.error('Error creating user profile:', error);
  }
}
