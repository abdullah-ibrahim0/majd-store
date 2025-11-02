"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Star,
  Heart,
  Minus,
  Plus,
  Check,
  Truck,
  RotateCcw,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Header } from "../../../components/layout/Header";
import { Footer } from "../../../components/layout/Footer";
import { ProductCard } from "../../../components/ui/ProductCard";
import { CustomButton } from "../../../components/ui/CustomButton";
import { CustomBadge } from "../../../components/ui/CustomBadge";
import { cn } from "../../../components/ui/utils";
import { ImageWithFallback } from "../../../components/figma/ImageWithFallback";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { getProductBySlug, getProducts } from "../../../lib/supabase/products";
import { addToCart } from "../../../lib/supabase/cart";
import type { Product, ProductVariant, ProductImage } from "../../../lib/types";

interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  discount_price: number | undefined;
  image_url: string | null;
  category_id: string;
  is_active: boolean;
  created_at: string;
  description?: string | null;
  rating?: number | null;
  reviews_count?: number | null;
  is_featured?: boolean;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [productData, setProductData] = React.useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = React.useState<RelatedProduct[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [addToCartLoading, setAddToCartLoading] = React.useState(false);
  const [addToCartMessage, setAddToCartMessage] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [selectedImage, setSelectedImage] = React.useState(0);
  const [selectedSize, setSelectedSize] = React.useState("");
  const [selectedColor, setSelectedColor] = React.useState("");
  const [quantity, setQuantity] = React.useState(1);
  const [isWishlisted, setIsWishlisted] = React.useState(false);
  const [sessionId, setSessionId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const storedSessionId = localStorage.getItem("cart_session_id");
    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("cart_session_id", newSessionId);
      setSessionId(newSessionId);
    }
  }, []);

  React.useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const product = await getProductBySlug(slug);
        if (!product) {
          setError("Product not found");
          setProductData(null);
          return;
        }

        setProductData(product);

        try {
          const related = await getProducts({ limit: 4 });
          if (related && Array.isArray(related)) {
            const filtered = related
              .filter((p: Product) => p.id !== product.id)
              .slice(0, 4)
              .map((p: Product) => ({
                id: p.id,
                name: p.name,
                slug: p.slug,
                base_price: p.base_price,
                discount_price: p.discount_price ?? undefined,
                image_url: p.image_url ?? null,
                category_id: p.category_id,
                is_active: p.is_active,
                created_at: p.created_at,
                description: p.description ?? null,
                rating: p.rating ?? null,
                reviews_count: p.reviews_count ?? null,
                is_featured: p.is_featured ?? false,
              }));
            setRelatedProducts(filtered);
          }
        } catch {
          setRelatedProducts([]);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product");
        setProductData(null);
      } finally {
        setLoading(false);
      }
    }

    if (slug) fetchData();
  }, [slug]);

  // === CORE LOGIC (must be before any early return) ===
  const isPerfume = React.useMemo(() => productData?.category?.slug === "perfumes", [productData]);

  const variants = React.useMemo(() => (productData?.product_variants ?? []) as ProductVariant[], [productData]);

  const availableSizes = React.useMemo(() => {
    const sizes = variants
      .map((v) => v.size)
      .filter((size): size is string => !!size);
    return [...new Set(sizes)] as string[];
  }, [variants]);

  const availableVolumes = React.useMemo(() => {
    if (!isPerfume) return [];
    const volumes = availableSizes
      .map((v) => parseInt(v.replace("ml", "").trim()))
      .filter((n) => !isNaN(n))
      .sort((a, b) => a - b)
      .map((n) => `${n}ml`);
    return volumes;
  }, [availableSizes, isPerfume]);

  const availableColors = React.useMemo(() => {
    const colors = variants
      .map((v) => v.color)
      .filter((color): color is string => !!color);
    return [...new Set(colors)] as string[];
  }, [variants]);

  const hasNoColor = availableColors.length === 0;
  const displayOptions = isPerfume ? availableVolumes : availableSizes;

  const selectedVariant = React.useMemo(() => {
    if (!selectedSize) return null;
    return variants.find((v) =>
      isPerfume || hasNoColor
        ? v.size === selectedSize
        : v.size === selectedSize && v.color === selectedColor
    );
  }, [variants, selectedSize, selectedColor, isPerfume, hasNoColor]);

  const isOutOfStock = selectedVariant?.stock_quantity === 0;
  const isLowStock = selectedVariant && selectedVariant.stock_quantity > 0 && selectedVariant.stock_quantity < 5;

  const images = React.useMemo(() => (productData?.product_images ?? []) as ProductImage[], [productData]);
  const currentImageUrl = images[selectedImage]?.image_url || "";

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-96">
              <div className="text-text-medium">Loading product...</div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !productData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-96">
              <div className="text-red-600 text-center">
                <p className="text-lg font-semibold mb-2">Oops!</p>
                <p>{error || "Product not found."}</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const hasDiscount = productData.discount_price != null && productData.discount_price < productData.base_price;

const discountPercentage = hasDiscount && productData.discount_price != null
  ? Math.round(((productData.base_price - productData.discount_price) / productData.base_price) * 100)
  : 0;

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      setAddToCartMessage({
        type: "error",
        message: isPerfume || hasNoColor
          ? "Please select a size/volume"
          : "Please select size and color",
      });
      return;
    }

    if (!sessionId) {
      setAddToCartMessage({
        type: "error",
        message: "Session error. Please refresh the page.",
      });
      return;
    }

    try {
      setAddToCartLoading(true);
      setAddToCartMessage(null);

      await addToCart(productData.id, selectedVariant.id, quantity, undefined, sessionId);

      setAddToCartMessage({
        type: "success",
        message: `Added ${quantity} item(s) to cart!`,
      });

      setQuantity(1);
      setSelectedSize("");
      setSelectedColor("");

      setTimeout(() => setAddToCartMessage(null), 3000);
    } catch (err) {
      console.error("Failed to add to cart:", err);
      setAddToCartMessage({
        type: "error",
        message: "Failed to add to cart. Please try again.",
      });
    } finally {
      setAddToCartLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!selectedVariant) {
      setAddToCartMessage({
        type: "error",
        message: isPerfume || hasNoColor
          ? "Please select a size/volume"
          : "Please select size and color",
      });
      return;
    }

    if (!sessionId) {
      setAddToCartMessage({
        type: "error",
        message: "Session error. Please refresh the page.",
      });
      return;
    }

    try {
      setAddToCartLoading(true);
      await addToCart(productData.id, selectedVariant.id, quantity, undefined, sessionId);
      router.push("/checkout");
    } catch (err) {
      console.error("Failed to proceed:", err);
      setAddToCartMessage({
        type: "error",
        message: "Failed to proceed. Please try again.",
      });
      setAddToCartLoading(false);
    }
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length || 0);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length || 0);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
                <ImageWithFallback
                  src={currentImageUrl}
                  alt={productData.name}
                  className="w-full h-full object-cover"
                />

                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {productData.is_featured && <CustomBadge variant="accent">New</CustomBadge>}
                 {hasDiscount && productData.discount_price != null && (
  <CustomBadge variant="error">-{discountPercentage}%</CustomBadge>
)}
                </div>

                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg lg:hidden"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg lg:hidden"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 lg:hidden">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        selectedImage === i ? "bg-white w-6" : "bg-white/50"
                      )}
                    />
                  ))}
                </div>
              </div>

              <div className="hidden lg:grid grid-cols-4 gap-4">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      "aspect-square rounded-lg overflow-hidden border-2 transition-colors",
                      selectedImage === i ? "border-brand-dark" : "border-gray-200"
                    )}
                  >
                    <ImageWithFallback
                      src={img.image_url}
                      alt={`${productData.name} ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h1 className="text-brand-dark">{productData.name}</h1>
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className="w-11 h-11 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-brand-dark transition-colors"
                  >
                    <Heart
                      className={cn(
                        "w-5 h-5",
                        isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
                      )}
                    />
                  </button>
                </div>

                {(productData.rating || productData.reviews_count) && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-4 h-4",
                            i < Math.floor(productData.rating ?? 0)
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-gray-200 text-gray-200"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-text-medium">
                      {productData.rating ?? 0} ({productData.reviews_count ?? 0} reviews)
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  {hasDiscount ? (
                    <>
                      <span className="text-brand-dark text-3xl">
  ${productData.discount_price?.toFixed(2) ?? productData.base_price.toFixed(2)}
</span>
                      <span className="text-text-light line-through text-xl">
                        ${productData.base_price.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="text-brand-dark text-3xl">
                      ${productData.base_price.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              {productData.description && (
                <p className="text-text-medium leading-relaxed">{productData.description}</p>
              )}

              {addToCartMessage && (
                <div
                  className={cn(
                    "p-3 rounded-md text-sm",
                    addToCartMessage.type === "success"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  )}
                >
                  {addToCartMessage.message}
                </div>
              )}

              {/* SIZE / VOLUME SELECTOR */}
              {displayOptions.length > 0 && (
                <div>
                  <h4 className="text-brand-dark mb-3">
                    {isPerfume ? "Select Volume" : "Select Size"}
                    {selectedSize && <span className="text-text-medium">: {selectedSize}</span>}
                  </h4>
                  <div className={cn("grid gap-2", isPerfume ? "grid-cols-2" : "grid-cols-4")}>
                    {displayOptions.map((option) => {
                      const isAvailable = variants
                        .filter((v) => v.size === option)
                        .some((v) => v.stock_quantity > 0);

                      return (
                        <button
                          key={option}
                          onClick={() => isAvailable && setSelectedSize(option)}
                          disabled={!isAvailable}
                          className={cn(
                            "px-4 py-3 rounded-md border-2 transition-all text-sm",
                            selectedSize === option
                              ? "border-brand-dark bg-brand-dark text-white"
                              : isAvailable
                              ? "border-gray-300 hover:border-brand-dark"
                              : "border-gray-200 text-gray-400 line-through cursor-not-allowed"
                          )}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* COLOR SELECTOR – only if has colors */}
              {!(isPerfume || hasNoColor) && availableColors.length > 0 && (
                <div>
                  <h4 className="text-brand-dark mb-3">
                    Select Color
                    {selectedColor && <span className="text-text-medium">: {selectedColor}</span>}
                  </h4>
                  <div className="flex gap-3">
                    {availableColors.map((color) => {
                      const isAvailable = variants
                        .filter((v) => v.color === color && v.size === selectedSize)
                        .some((v) => v.stock_quantity > 0);

                      return (
                        <button
                          key={color}
                          onClick={() => isAvailable && setSelectedColor(color)}
                          disabled={!isAvailable}
                          className={cn(
                            "px-6 py-3 rounded-md border-2 transition-all",
                            selectedColor === color
                              ? "border-brand-dark bg-brand-dark text-white"
                              : isAvailable
                              ? "border-gray-300 hover:border-brand-dark"
                              : "border-gray-200 text-gray-400 line-through cursor-not-allowed"
                          )}
                        >
                          {color}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STOCK STATUS */}
              {selectedVariant && (
                <div>
                  {isOutOfStock ? (
                    <CustomBadge variant="error" className="text-sm py-2 px-3">
                      Out of Stock
                    </CustomBadge>
                  ) : isLowStock ? (
                    <CustomBadge variant="warning" className="text-sm py-2 px-3">
                      Only {selectedVariant.stock_quantity} left!
                    </CustomBadge>
                  ) : (
                    <CustomBadge variant="success" className="text-sm py-2 px-3">
                      <Check className="w-4 h-4" />
                      In Stock
                    </CustomBadge>
                  )}
                </div>
              )}

              {/* QUANTITY */}
              <div>
                <h4 className="text-brand-dark mb-3">Quantity</h4>
                <div className="flex items-center gap-3 border-2 border-gray-300 rounded-md w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-12 h-12 flex items-center justify-center text-brand-dark hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="min-w-[3rem] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={selectedVariant ? quantity >= selectedVariant.stock_quantity : false}
                    className="w-12 h-12 flex items-center justify-center text-brand-dark hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="space-y-3">
                <CustomButton
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleAddToCart}
                  disabled={
                    !selectedSize ||
                    (!(isPerfume || hasNoColor) && !selectedColor) ||
                    isOutOfStock ||
                    addToCartLoading
                  }
                >
                  {addToCartLoading
                    ? "Adding..."
                    : isOutOfStock
                    ? "Out of Stock"
                    : "Add to Cart"}
                </CustomButton>
                <CustomButton
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={handleBuyNow}
                  disabled={
                    !selectedSize ||
                    (!(isPerfume || hasNoColor) && !selectedColor) ||
                    isOutOfStock ||
                    addToCartLoading
                  }
                >
                  {addToCartLoading ? "Processing..." : "Buy Now"}
                </CustomButton>
              </div>

              {/* INFO BADGES */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t">
                <div className="text-center space-y-2">
                  <div className="w-10 h-10 mx-auto bg-brand-dark/10 rounded-full flex items-center justify-center">
                    <Truck className="w-5 h-5 text-brand-dark" />
                  </div>
                  <p className="text-xs text-text-medium">Free Shipping</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-10 h-10 mx-auto bg-brand-dark/10 rounded-full flex items-center justify-center">
                    <RotateCcw className="w-5 h-5 text-brand-dark" />
                  </div>
                  <p className="text-xs text-text-medium">30-Day Returns</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-10 h-10 mx-auto bg-brand-dark/10 rounded-full flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-brand-dark" />
                  </div>
                  <p className="text-xs text-text-medium">Secure Payment</p>
                </div>
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className="mb-16">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                <TabsTrigger
                  value="description"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-dark"
                >
                  Description
                </TabsTrigger>
                {displayOptions.length > 0 && !isPerfume && (
                  <TabsTrigger
                    value="size-guide"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-dark"
                  >
                    Size Guide
                  </TabsTrigger>
                )}
                <TabsTrigger
                  value="shipping"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-dark"
                >
                  Shipping
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-dark"
                >
                  Reviews ({productData.reviews_count ?? 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-6">
                <p className="text-text-medium leading-relaxed">
                  {productData.description || "No description available."}
                </p>
              </TabsContent>

              {displayOptions.length > 0 && !isPerfume && (
                <TabsContent value="size-guide" className="mt-6">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b-2 border-brand-dark">
                          <th className="text-left py-3 px-4">Size</th>
                          <th className="text-left py-3 px-4">Bust (in)</th>
                          <th className="text-left py-3 px-4">Waist (in)</th>
                          <th className="text-left py-3 px-4">Hip (in)</th>
                        </tr>
                      </thead>
                      <tbody className="text-text-medium">
                        <tr className="border-b">
                          <td className="py-3 px-4">XS</td>
                          <td className="py-3 px-4">32-33</td>
                          <td className="py-3 px-4">24-25</td>
                          <td className="py-3 px-4">34-35</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4">S</td>
                          <td className="py-3 px-4">34-35</td>
                          <td className="py-3 px-4">26-27</td>
                          <td className="py-3 px-4">36-37</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4">M</td>
                          <td className="py-3 px-4">36-37</td>
                          <td className="py-3 px-4">28-29</td>
                          <td className="py-3 px-4">38-39</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4">L</td>
                          <td className="py-3 px-4">38-40</td>
                          <td className="py-3 px-4">30-32</td>
                          <td className="py-3 px-4">40-42</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              )}

              <TabsContent value="shipping" className="mt-6">
                <div className="space-y-4 text-text-medium">
                  <p>We offer free standard shipping on all orders over $100.</p>
                  <ul className="space-y-2">
                    <li><strong>Standard:</strong> 5-7 business days</li>
                    <li><strong>Express:</strong> 2-3 business days</li>
                    <li><strong>Next Day:</strong> Order before 2 PM</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <p className="text-text-medium text-center py-12">Reviews coming soon...</p>
              </TabsContent>
            </Tabs>
          </div>

          {/* RELATED PRODUCTS */}
          {relatedProducts.length > 0 && (
            <div>
              <h2 className="text-brand-dark mb-8">You May Also Like</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MOBILE BOTTOM BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-40">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="text-brand-dark">
              ${(productData.discount_price ?? productData.base_price).toFixed(2)}
            </div>
          </div>
          <CustomButton
            variant="primary"
            size="lg"
            onClick={handleAddToCart}
            disabled={
              !selectedSize ||
              (!(isPerfume || hasNoColor) && !selectedColor) ||
              isOutOfStock ||
              addToCartLoading
            }
            className="flex-1"
          >
            {addToCartLoading
              ? "Adding..."
              : isOutOfStock
              ? "Out of Stock"
              : "Add to Cart"}
          </CustomButton>
        </div>
      </div>

      <Footer />
    </div>
  );
}