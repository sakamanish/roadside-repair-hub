
// Add a helper function to normalize services
const getServicesArray = (services?: string[] | string): string[] => {
  if (!services) return [];
  if (typeof services === 'string') return services.split(',').map(s => s.trim());
  return services;
};

// Then use this helper in the component where services are displayed
const servicesArray = getServicesArray(mechanic.services);
