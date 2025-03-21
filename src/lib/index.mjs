// Format price to currency string
export const formatPrice = (price) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
};

// Generate image placeholder
export const getImagePlaceholder = () => {
  return "data:image/svg+xml,...";
};

// Format seconds to human-readable time
export const formatDuration = (seconds) => {
  if (seconds < 60) return `${seconds} sec`;
  if (seconds < 3600)
    return `${Math.floor(seconds / 60)} min ${seconds % 60} sec`;
  return `${Math.floor(seconds / 3600)} hr ${Math.floor(
    (seconds % 3600) / 60
  )} min`;
};

// Format date for analytics charts
export const formatAnalyticsDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
};

// Other utility functions can be added here
