import { useState, useEffect } from "react";

export const useImageValidation = (
  imageUrl,
  fallbackUrl = "/placeholder.png"
) => {
  const [validatedSrc, setValidatedSrc] = useState(fallbackUrl);

  useEffect(() => {
    if (!imageUrl || imageUrl === "") {
      setValidatedSrc(fallbackUrl);
      return;
    }

    const img = new Image();
    img.onload = () => setValidatedSrc(imageUrl);
    img.onerror = () => setValidatedSrc(fallbackUrl);
    img.src = imageUrl;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl, fallbackUrl]);

  return validatedSrc;
};
