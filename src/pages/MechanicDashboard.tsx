
// Add a helper function to normalize services
const getServicesString = (services?: string[] | string): string => {
  if (!services) return '';
  if (typeof services === 'string') return services;
  return services.join(', ');
};

// Then use this helper in the form submission or display
const servicesValue = getServicesString(mechanic.services);
