"use client";

import * as React from "react";
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

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [priceRange, setPriceRange] = React.useState([0, 500]);
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = React.useState<string[]>([]);
  const [selectedColors, setSelectedColors] = React.useState<string[]>([]);
  const [showInStockOnly, setShowInStockOnly] = React.useState(false);

  const [allProducts, setAllProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [hasNextPage, setHasNextPage] = React.useState(false);
  const [showFiltersMobile, setShowFiltersMobile] = React.useState(false);

  const activeFiltersCount =
    selectedCategories.length +
    selectedSizes.length +
    selectedColors.length +
    (showInStockOnly ? 1 : 0);

  // Call fetchCategories on mount
  React.useEffect(() => {
    fetchCategories();
  }, []);

  // Parse filters from URL on mount or URL change
  React.useEffect(() => {
    const categoryParams = searchParams.get("category");
    if (categoryParams) {
      setSelectedCategories(categoryParams.split(","));
    } else {
      setSelectedCategories([]);
    }
    setCurrentPage(1);
  }, [searchParams]);

  // Update URL query params when categories change
  const updateURL = (categories: string[]) => {
    const params = new URLSearchParams(window.location.search);
    if (categories.length > 0) {
      params.set("category", categories.join(","));
    } else {
      params.delete("category");
    }
    // Reset pagination on filter change
    params.delete("page");
    router.replace(`${window.location.pathname}?${params.toString()}`);
  };

  const onCategoryChange = (categorySlug: string, checked: boolean) => {
    const newCategories = checked
      ? [...selectedCategories, categorySlug]
      : selectedCategories.filter((c) => c !== categorySlug);
    setSelectedCategories(newCategories);
    updateURL(newCategories);
    setCurrentPage(1);
  };

  // Similar handler can be created for sizes/colors if you want URL sync for them

  const fetchProducts = React.useCallback(async () => {
    try {
      const offset = (currentPage - 1) * ITEMS_PER_PAGE;
      const products = await getProducts({
        categorySlug: selectedCategories.length === 1 ? selectedCategories[0] : undefined,
        colors: selectedColors,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        inStock: showInStockOnly,
        limit: ITEMS_PER_PAGE + 1,
        offset,
      });

      const filteredProducts = products.filter(
        (product) =>
          selectedSizes.length === 0 ||
          product.product_variants?.some((variant) =>
            selectedSizes.includes(variant.size || "")
          )
      );

      const hasMore = filteredProducts.length > ITEMS_PER_PAGE;
      setHasNextPage(hasMore);

      const productsToDisplay = hasMore
        ? filteredProducts.slice(0, ITEMS_PER_PAGE)
        : filteredProducts;

      const productsWithImages = productsToDisplay.map((p) => ({
        ...p,
        image_url: p.product_images?.[0]?.image_url || "",
        discount_price: p.discount_price ?? undefined,
      }));

      setAllProducts(productsWithImages);
    } catch {
      setAllProducts([]);
      setHasNextPage(false);
    }
  }, [currentPage, selectedCategories, selectedSizes, selectedColors, priceRange, showInStockOnly]);

  React.useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  async function fetchCategories() {
    try {
      const cats = await getCategories();
      setCategories(cats);
    } catch {
      setCategories([]);
    }
  }

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setShowInStockOnly(false);
    setPriceRange([0, 500]);
    setCurrentPage(1);
    updateURL([]); // Clear category from URL too
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-brand-dark mb-3">Category</h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center">
              <Checkbox
                id={`category-${category.id}`}
                checked={selectedCategories.includes(category.slug)}
                onCheckedChange={(checked) => onCategoryChange(category.slug, checked as boolean)}
              />
              <Label htmlFor={`category-${category.id}`} className="ml-2 flex-1 cursor-pointer">
                {category.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-brand-dark mb-3">Price Range</h4>
        <div className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={(value) => {
              setPriceRange(value);
              setCurrentPage(1);
            }}
            min={0}
            max={500}
            step={10}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm text-text-medium">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-brand-dark mb-3">Size</h4>
        <div className="grid grid-cols-3 gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => {
                if (selectedSizes.includes(size)) {
                  setSelectedSizes(selectedSizes.filter((s) => s !== size));
                } else {
                  setSelectedSizes([...selectedSizes, size]);
                }
                setCurrentPage(1);
              }}
              className={`px-3 py-2 rounded-md border-2 transition-colors ${
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
        <h4 className="text-brand-dark mb-3">Color</h4>
        <div className="grid grid-cols-5 gap-2">
          {colors.map((color) => (
            <button
              key={color.name}
              onClick={() => {
                if (selectedColors.includes(color.name)) {
                  setSelectedColors(selectedColors.filter((c) => c !== color.name));
                } else {
                  setSelectedColors([...selectedColors, color.name]);
                }
                setCurrentPage(1);
              }}
              className={`w-10 h-10 rounded-full border-2 transition-all ${
                selectedColors.includes(color.name)
                  ? "border-brand-dark scale-110"
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
            onCheckedChange={(checked) => {
              setShowInStockOnly(checked as boolean);
              setCurrentPage(1);
            }}
          />
          <Label htmlFor="in-stock" className="ml-2 cursor-pointer">
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
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-brand-dark mb-2">All Products</h1>
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

          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-brand-dark">Filters</h3>
                  {activeFiltersCount > 0 && <CustomBadge variant="default">{activeFiltersCount}</CustomBadge>}
                </div>
                <FilterContent />
              </div>
            </aside>

            <section className="flex-1 relative">
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {allProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <div className="mt-12 flex justify-center gap-2">
                <CustomButton
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </CustomButton>
                <CustomButton variant="primary" size="sm">
                  {currentPage}
                </CustomButton>
                <CustomButton
                  variant="outline"
                  size="sm"
                  disabled={!hasNextPage}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </CustomButton>
              </div>

              {showFiltersMobile && (
                <div
                  className="fixed inset-0 z-50 bg-black bg-opacity-50 flex"
                  onClick={() => setShowFiltersMobile(false)}
                >
                  <div
                    className="bg-white w-64 p-6 overflow-auto max-h-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="mb-4 flex justify-between items-center">
                      <h3 className="font-semibold text-lg">Filters</h3>
                      <button
                        onClick={() => setShowFiltersMobile(false)}
                        className="text-red-600 font-bold"
                      >
                        Close
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
