'use client';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { CaretLeft, ShoppingBag, Truck, ArrowsClockwise, X, Lightning } from 'phosphor-react';
import { useCart } from '@/context/CartContext';
import { useProduct } from '@/hooks/useProduct';
// import { useImageValidation } from '@/hooks/useImageValidation';

const DEFAULT_PLACEHOLDER = '/placeholder.png';

export default function ProductDetail({ id }) {
  const router = useRouter();
  const { addToCart } = useCart();
  
  // Debug log
  console.log('Product ID in Detail:', id);
  
  const { product, loading, error } = useProduct(id);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const [slidePosition, setSlidePosition] = useState(0);

  // Add debug log for product data
  useEffect(() => {
    console.log('Product Data:', { id, product, loading, error });
  }, [id, product, loading, error]);

  // Update selections when product data changes
  useEffect(() => {
    console.log('Product:', product);
    if (!product) return;

    // Set size if available
    const sizes = product.sizes || [];
    if (sizes.length > 0) {
      setSelectedSize(sizes[0]);
    }

    // Set color if available
    const colors = product.colors || [];
    if (colors.length > 0) {
      setSelectedColor(colors[0]);
    }
  }, [product]);

  // Update the render conditions
  if (loading) {
    // ...existing loading state...
  }

  if (error || !product) {
    // ...existing error state...
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* ...existing header code... */}

      <div className="grid md:grid-cols-2 gap-8">
        {/* ...existing image gallery code... */}

        <div className="space-y-6">
          {/* ...existing price section... */}

          {/* Conditional Size Selection - Updated */}
          {Array.isArray(product?.sizes) && product.sizes.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Select Size</h3>
              <div className="flex gap-3">
                {product.sizes.map((size) => (
                  // ...existing size button code...
                ))}
              </div>
            </div>
          )}

          {/* Conditional Color Selection - Updated */}
          {Array.isArray(product?.colors) && product.colors.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Select Color</h3>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  // ...existing color button code...
                ))}
              </div>
            </div>
          )}

          {/* ...rest of the existing JSX... */}
        </div>
      </div>
    </div>
  );
}
