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

// Other utility functions can be added here
