import { useState, useEffect } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export function useProducts({
  page = 1,
  limit = 12,
  category = "",
  search = "",
} = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(category && { category }),
          ...(search && { search }),
        });

        const response = await fetch(`/api/products?${params}`);
        const data = await response.json();
        // console.log(data);

        if (!data.success) {
          throw new Error(data.message || "Failed to fetch products");
        }

        // const productsWithFullUrls = data.products.map((product) => ({
        //   ...product,
        //   images: Array.isArray(product.images)
        //     ? product.images
        //         .filter(Boolean)
        //         .map((img) => (typeof img === "string" ? img : null))
        //         .filter(Boolean)
        //     : [],
        // }));

        setProducts(data.products);
        setPagination(data.pagination);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page, limit, category, search]);

  return { products, loading, error, pagination };
}
