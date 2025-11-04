"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/layout/Footer";
import { ProductCard, type Product } from "../../components/ui/ProductCard";
import { CustomButton } from "../../components/ui/CustomButton";
import { CustomBadge } from "../../components/ui/CustomBadge";
import { Checkbox } from "../../components/ui/checkbox";
import { Label } from "../../components/ui/label";
import { Slider } from "../../components/ui/slider";

import { getProducts } from "../../lib/supabase/products";
import { getCategories } from "../../lib/supabase/categories";

import type { Category } from "../../lib/types";

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
const colors = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Red", hex: "#DC2626" },
  { name: "Blue", hex: "#2563EB" },
  { name: "Green", hex: "#16A34A" },
];

const ITEMS_PER_PAGE = 12;

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [priceRange, setPriceRange] = React.useState([300, 5000]);
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = React.useState<string[]>([]);
  const [selectedColors, setSelectedColors] = React.useState<string[]>([]);
  const [showInStockOnly, setShowInStockOnly] = React.useState(false);

  const [allProducts, setAllProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [hasNextPage, setHasNextPage] = React.useState(false);
  const [showFiltersMobile, setShowFiltersMobile] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [totalProducts, setTotalProducts] = React.useState(0);

  const activeFiltersCount =
    selectedCategories.length +
    selectedSizes.length +
    selectedColors.length +
    (showInStockOnly ? 1 : 0);

  // Fetch categories on mount
  React.useEffect(() => {
    async function fetchCategoriesData() {
      try {
        console.log("[Products] Fetching categories...");
        const cats = await getCategories();
        console.log("[Products] Categories fetched:", cats.length);
        setCategories(cats);
      } catch (err) {
        console.error("[Products] Failed to fetch categories:", err);
        setCategories([]);
      }
    }
    fetchCategoriesData();
  }, []);

  // Parse filters from URL
  React.useEffect(() => {
    const categoryParams = searchParams.get("category");
    if (categoryParams) {
      setSelectedCategories(categoryParams.split(","));
    } else {
      setSelectedCategories([]);
    }
    setCurrentPage(1);
  }, [searchParams]);

  // Update URL query params
  const updateURL = React.useCallback(
    (categories: string[]) => {
      const params = new URLSearchParams(window.location.search);
      if (categories.length > 0) {
        params.set("category", categories.join(","));
      } else {
        params.delete("category");
      }
      params.delete("page");
      router.replace(`${window.location.pathname}?${params.toString()}`);
    },
    [router]
  );

  const onCategoryChange = (categorySlug: string, checked: boolean) => {
    const newCategories = checked
      ? [...selectedCategories, categorySlug]
      : selectedCategories.filter(c => c !== categorySlug);
    setSelectedCategories(newCategories);
    updateURL(newCategories);
    setCurrentPage(1);
  };

  const fetchProductsData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const offset = (currentPage - 1) * ITEMS_PER_PAGE;

      console.log("[Products] Fetching with options:", {
        categorySlug: selectedCategories.length === 1 ? selectedCategories[0] : undefined,
        colors: selectedColors,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        inStock: showInStockOnly,
        limit: ITEMS_PER_PAGE + 1,
        offset,
      });

      const products = await getProducts({
        categorySlug: selectedCategories.length === 1 ? selectedCategories[0] : undefined,
        colors: selectedColors,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        inStock: showInStockOnly,
        limit: ITEMS_PER_PAGE + 1,
        offset,
      });

      console.log("[Products] Raw products returned:", products.length);

      // Filter by selected sizes (client-side)
      const filteredProducts = products.filter(product =>
        selectedSizes.length === 0 ||
        product.product_variants?.some(variant => selectedSizes.includes(variant.size || ""))
      );

      console.log("[Products] After size filtering:", filteredProducts.length);

      const hasMore = filteredProducts.length > ITEMS_PER_PAGE;
      setHasNextPage(hasMore);

      const productsToDisplay = hasMore
        ? filteredProducts.slice(0, ITEMS_PER_PAGE)
        : filteredProducts;

      // Map products with correct image_url - prefer gallery first, then main image
      const productsWithImages = productsToDisplay.map(p => ({
        ...p,
        image_url: p.product_images?.[0]?.image_url || p.image_url || "",
        discount_price: p.discount_price ?? undefined,
      }));

      console.log("[Products] Products with images:", productsWithImages.length);
      console.log(
        "[Products] Sample product:",
        productsWithImages[0]
          ? {
              id: productsWithImages[0].id,
              name: productsWithImages[0].name,
              image_url: productsWithImages[0].image_url,
            }
          : "No products"
      );

      setTotalProducts(filteredProducts.length);
      setAllProducts(productsWithImages);
    } catch (err) {
      console.error("[Products] Failed to fetch products:", err);
      setError("Failed to load products. Please try again.");
      setAllProducts([]);
      setHasNextPage(false);
      setTotalProducts(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, selectedCategories, selectedSizes, selectedColors, priceRange, showInStockOnly]);

  // ✅ Fetch on mount and when filters change
  React.useEffect(() => {
    console.log("[Products] Triggering fetchProductsData");
    fetchProductsData();
  }, [fetchProductsData]);

  // ✅ Periodic refresh for real-time updates
  React.useEffect(() => {
    const interval = setInterval(() => {
      console.log("[Products] Periodic refresh triggered");
      fetchProductsData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [fetchProductsData]);

  const clearAllFilters = () => {
    console.log("[Products] Clearing all filters");
    setSelectedCategories([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setShowInStockOnly(false);
    setPriceRange([300, 5000]);
    setCurrentPage(1);
    updateURL([]);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-brand-dark mb-3 font-semibold">Category</h4>
        <div className="space-y-2">
          {categories.length > 0 ? (
            categories.map(category => (
              <div key={category.id} className="flex items-center">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={selectedCategories.includes(category.slug)}
                  onCheckedChange={checked =>
                    onCategoryChange(category.slug, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`category-${category.id}`}
                  className="ml-2 flex-1 cursor-pointer text-text-dark"
                >
                  {category.name}
                </Label>
              </div>
            ))
          ) : (
            <p className="text-sm text-text-medium">No categories available</p>
          )}
        </div>
      </div>

      <div>
  <h4 className="text-brand-dark mb-4 font-semibold">Price Range (EGP)</h4>
  <div className="space-y-4">
    {/* ✅ NEW: Input fields for precise control */}
    <div className="flex gap-3 items-center">
      <div className="flex-1">
        <label className="text-xs text-text-medium block mb-1">Min</label>
        <input
          type="number"
          value={priceRange[0]}
          onChange={(e) => {
            const newMin = Math.max(300, Math.min(parseInt(e.target.value) || 300, priceRange[1]));
            setPriceRange([newMin, priceRange[1]]);
            setCurrentPage(1);
          }}
          min={300}
          max={5000}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-brand-dark"
        />
      </div>
      <div className="flex items-center justify-center mt-5">
        <span className="text-text-medium font-medium">—</span>
      </div>
      <div className="flex-1">
        <label className="text-xs text-text-medium block mb-1">Max</label>
        <input
          type="number"
          value={priceRange[1]}
          onChange={(e) => {
            const newMax = Math.min(5000, Math.max(parseInt(e.target.value) || 5000, priceRange[0]));
            setPriceRange([priceRange[0], newMax]);
            setCurrentPage(1);
          }}
          min={300}
          max={5000}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-brand-dark"
        />
      </div>
    </div>

    {/* ✅ Visual slider with better styling */}
    <Slider
      value={priceRange}
      onValueChange={(value) => {
        console.log("[Products] Price range changed:", value);
        setPriceRange(value);
        setCurrentPage(1);
      }}
      min={300}
      max={5000}
      step={50}
      className="w-full"
    />

    {/* ✅ Better price display */}
    <div className="bg-brand-dark/5 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-dark font-medium">Selected Range:</span>
        <span className="text-lg font-bold text-brand-dark">
          £{priceRange[0].toLocaleString()} — £{priceRange[1].toLocaleString()}
        </span>
      </div>
    </div>

    {/* ✅ Quick preset buttons */}
    <div className="grid grid-cols-2 gap-2">
      <button
        onClick={() => {
          setPriceRange([300, 1000]);
          setCurrentPage(1);
        }}
        className={`px-3 py-2 rounded-md text-xs font-medium transition-colors ${
          priceRange[0] === 300 && priceRange[1] === 1000
            ? "bg-brand-dark text-white"
            : "bg-gray-100 text-text-dark hover:bg-gray-200"
        }`}
      >
        £300 — £1000
      </button>
      <button
        onClick={() => {
          setPriceRange([1000, 2500]);
          setCurrentPage(1);
        }}
        className={`px-3 py-2 rounded-md text-xs font-medium transition-colors ${
          priceRange[0] === 1000 && priceRange[1] === 2500
            ? "bg-brand-dark text-white"
            : "bg-gray-100 text-text-dark hover:bg-gray-200"
        }`}
      >
        £1000 — £2500
      </button>
      <button
        onClick={() => {
          setPriceRange([2500, 4000]);
          setCurrentPage(1);
        }}
        className={`px-3 py-2 rounded-md text-xs font-medium transition-colors ${
          priceRange[0] === 2500 && priceRange[1] === 4000
            ? "bg-brand-dark text-white"
            : "bg-gray-100 text-text-dark hover:bg-gray-200"
        }`}
      >
        £2500 — £4000
      </button>
      <button
        onClick={() => {
          setPriceRange([4000, 5000]);
          setCurrentPage(1);
        }}
        className={`px-3 py-2 rounded-md text-xs font-medium transition-colors ${
          priceRange[0] === 4000 && priceRange[1] === 5000
            ? "bg-brand-dark text-white"
            : "bg-gray-100 text-text-dark hover:bg-gray-200"
        }`}
      >
        £300 — £5000
      </button>
    </div>
  </div>
</div>


      <div>
        <h4 className="text-brand-dark mb-3 font-semibold">Size</h4>
        <div className="grid grid-cols-3 gap-2">
          {sizes.map(size => (
            <button
              key={size}
              onClick={() => {
                const newSizes = selectedSizes.includes(size)
                  ? selectedSizes.filter(s => s !== size)
                  : [...selectedSizes, size];
                console.log("[Products] Size changed:", newSizes);
                setSelectedSizes(newSizes);
                setCurrentPage(1);
              }}
              className={`px-3 py-2 rounded-md border-2 transition-colors text-sm font-medium ${
                selectedSizes.includes(size)
                  ? "border-brand-dark bg-brand-dark text-white"
                  : "border-gray-300 hover:border-brand-dark"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-brand-dark mb-3 font-semibold">Color</h4>
        <div className="grid grid-cols-5 gap-2">
          {colors.map(color => (
            <button
              key={color.name}
              onClick={() => {
                const newColors = selectedColors.includes(color.name)
                  ? selectedColors.filter(c => c !== color.name)
                  : [...selectedColors, color.name];
                console.log("[Products] Color changed:", newColors);
                setSelectedColors(newColors);
                setCurrentPage(1);
              }}
              className={`w-10 h-10 rounded-full border-2 transition-all ${
                selectedColors.includes(color.name)
                  ? "border-brand-dark scale-110 shadow-lg"
                  : "border-gray-300 hover:scale-105"
              }`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center">
          <Checkbox
            id="in-stock"
            checked={showInStockOnly}
            onCheckedChange={checked => {
              console.log("[Products] In stock filter changed:", checked);
              setShowInStockOnly(checked as boolean);
              setCurrentPage(1);
            }}
          />
          <Label htmlFor="in-stock" className="ml-2 cursor-pointer text-text-dark">
            In Stock Only
          </Label>
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <CustomButton variant="outline" onClick={clearAllFilters} className="w-full">
          Clear All Filters
        </CustomButton>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-brand-dark mb-2">All Products</h1>
              <p className="text-text-medium">
                {isLoading
                  ? "Loading products..."
                  : allProducts.length > 0
                  ? `Showing ${allProducts.length} of ${totalProducts} products`
                  : "No products found"}
              </p>
            </div>
            <CustomButton
              variant="outline"
              className="lg:hidden"
              onClick={() => setShowFiltersMobile(true)}
            >
              Filters
              {activeFiltersCount > 0 && (
                <CustomBadge variant="default" className="ml-2">
                  {activeFiltersCount}
                </CustomBadge>
              )}
            </CustomButton>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-brand-dark">Filters</h3>
                  {activeFiltersCount > 0 && (
                    <CustomBadge variant="default">{activeFiltersCount}</CustomBadge>
                  )}
                </div>
                <FilterContent />
              </div>
            </aside>

            <section className="flex-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-dark mb-4"></div>
                    <p className="text-text-medium">Loading products...</p>
                  </div>
                </div>
              ) : allProducts.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {allProducts.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  <div className="mt-12 flex justify-center gap-2">
                    <CustomButton
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => {
                        console.log("[Products] Going to previous page");
                        setCurrentPage(currentPage - 1);
                      }}
                    >
                      Previous
                    </CustomButton>
                    <CustomButton variant="primary" size="sm" disabled>
                      Page {currentPage}
                    </CustomButton>
                    <CustomButton
                      variant="outline"
                      size="sm"
                      disabled={!hasNextPage}
                      onClick={() => {
                        console.log("[Products] Going to next page");
                        setCurrentPage(currentPage + 1);
                      }}
                    >
                      Next
                    </CustomButton>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-brand-dark mb-2">No products found</p>
                    <p className="text-text-medium mb-6">
                      Try adjusting your filters or search criteria
                    </p>
                    <CustomButton variant="outline" onClick={clearAllFilters}>
                      Clear Filters and Try Again
                    </CustomButton>
                  </div>
                </div>
              )}

              {showFiltersMobile && (
                <div
                  className="fixed inset-0 z-50 bg-black bg-opacity-50 flex"
                  onClick={() => setShowFiltersMobile(false)}
                >
                  <div
                    className="bg-white w-64 p-6 overflow-auto max-h-full ml-auto"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="mb-4 flex justify-between items-center">
                      <h3 className="font-semibold text-lg text-brand-dark">Filters</h3>
                      <button
                        onClick={() => setShowFiltersMobile(false)}
                        className="text-red-600 font-bold hover:text-red-700 text-2xl leading-none"
                      >
                        ✕
                      </button>
                    </div>
                    <FilterContent />
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-dark mb-4"></div>
            <p className="text-text-medium">Loading products...</p>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
