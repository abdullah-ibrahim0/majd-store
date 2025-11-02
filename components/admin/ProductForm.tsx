"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, X, Upload, Save } from "lucide-react";
import { CustomButton } from "../ui/CustomButton";
import { CustomInput } from "../ui/CustomInput";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { createClient } from "@/lib/supabase/client";
import type { Product, ProductVariant, ProductImage, Category } from "@/lib/types";

// Initialise client once
const supabase = createClient();

interface Variant {
  id: string;
  size: string;
  color: string;
  stock: number;
  sku: string;
}

interface ProductFormProps {
  product?: Product & {
    product_images: ProductImage[];
    product_variants: ProductVariant[];
    category: Category;
  };
  categories: Category[];
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const [formData, setFormData] = React.useState({
    name: product?.name || "",
    slug: product?.slug || "",
    description: product?.description || "",
    category_id: product?.category_id || "",
    base_price: product?.base_price?.toString() || "",
    discount_price: product?.discount_price?.toString() || "",
    is_featured: product?.is_featured || false,
    is_active: product?.is_active ?? true,
  });

  const [variants, setVariants] = React.useState<Variant[]>(
    product?.product_variants.map(v => ({
      id: v.id,
      size: v.size || "",
      color: v.color || "",
      stock: v.stock_quantity,
      sku: v.sku,
    })) || []
  );

  const [mainImage, setMainImage] = React.useState<string | null>(product?.image_url || null);
  const [galleryImages, setGalleryImages] = React.useState<string[]>(
    product?.product_images.map(img => img.image_url) || []
  );

  // Auto‑generate slug
  React.useEffect(() => {
    if (formData.name && !product?.slug) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name, product?.slug]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleAddVariant = () => {
    const newVariant: Variant = {
      id: `temp-${Date.now()}`,
      size: "",
      color: "",
      stock: 0,
      sku: "",
    };
    setVariants([...variants, newVariant]);
  };

  const handleUpdateVariant = (
    id: string,
    field: keyof Variant,
    value: string | number
  ) => {
    setVariants(prev =>
      prev.map(v => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const handleRemoveVariant = (id: string) => {
    setVariants(prev => prev.filter(v => v.id !== id));
  };

  const uploadToStorage = async (file: File, folder: string) => {
    const fileName = `${folder}/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file);

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  };

  const handleMainImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadToStorage(file, "main");
      setMainImage(url);
    } catch {
      alert("Failed to upload main image.");
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    const urls: string[] = [];

    for (const file of Array.from(files)) {
      try {
        const url = await uploadToStorage(file, "gallery");
        urls.push(url);
      } catch {
        console.error("Failed to upload image", file.name);
      }
    }

    setGalleryImages(prev => [...prev, ...urls]);
    setUploading(false);
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.slug.trim()) newErrors.slug = "Slug is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.category_id) newErrors.category_id = "Category is required";
    if (!formData.base_price || parseFloat(formData.base_price) <= 0)
      newErrors.base_price = "Valid base price is required";
    if (
      formData.discount_price &&
      parseFloat(formData.discount_price) >= parseFloat(formData.base_price)
    )
      newErrors.discount_price = "Discount price must be less than base price";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);

    try {
      const productData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        category_id: formData.category_id,
        base_price: parseFloat(formData.base_price),
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        is_featured: formData.is_featured,
        is_active: formData.is_active,
        image_url: mainImage,
      };

      let productId: string;

      if (product) {
  // FIX: Use simpler update without .select().single()
  const { error } = await supabase
    .from("products")
    .update(productData)
    .eq("id", product.id);

  if (error) throw error;
  productId = product.id;
} else {
  const { data, error } = await supabase
    .from("products")
    .insert([productData])
    .select("id")
    .single();

  if (error) throw error;
  productId = data.id;
}

      // Variants
      const variantOps = variants.map(async v => {
        const { id, ...rest } = v;
        if (id.startsWith("temp")) {
          return supabase
            .from("product_variants")
            .insert([{ ...rest, product_id: productId }]);
        } else {
          return supabase.from("product_variants").update(rest).eq("id", id);
        }
      });
      await Promise.all(variantOps);

      // Gallery
      if (galleryImages.length > 0) {
        const galleryOps = galleryImages.map((url, i) =>
          supabase.from("product_images").insert({
            product_id: productId,
            image_url: url,
            display_order: i,
          })
        );
        await Promise.all(galleryOps);
      }

      alert(product ? "Product updated!" : "Product created!");
      router.push("/admin/products");
    } catch (err) {
      console.error("Save failed:", err);
      alert(err instanceof Error ? err.message : "Failed to save product.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-brand-dark hover:text-brand-accent transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Products
        </Link>
        <h1 className="text-brand-dark">
          {product ? "Edit Product" : "Add New Product"}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN – MAIN FORM */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-brand-dark">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CustomInput
                  label="Product Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  error={errors.name}
                  placeholder="e.g., Elegant Silk Evening Dress"
                  required
                />
                <CustomInput
                  label="Slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  error={errors.slug}
                  placeholder="elegant-silk-evening-dress"
                  required
                />
                <div>
                  <Label htmlFor="description" className="mb-2 block text-brand-dark">
                    Description *
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your product in detail..."
                    rows={6}
                    className={errors.description ? "border-red-500" : ""}
                    required
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="category" className="mb-2 block text-brand-dark">
                    Category *
                  </Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={value => {
                      setFormData(prev => ({ ...prev, category_id: value }));
                      if (errors.category_id)
                        setErrors(prev => ({ ...prev, category_id: "" }));
                    }}
                  >
                    <SelectTrigger className={errors.category_id ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-brand-dark">Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <CustomInput
                    label="Base Price"
                    name="base_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.base_price}
                    onChange={handleInputChange}
                    error={errors.base_price}
                    placeholder="0.00"
                    required
                  />
                  <CustomInput
                    label="Discount Price (Optional)"
                    name="discount_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.discount_price}
                    onChange={handleInputChange}
                    error={errors.discount_price}
                    placeholder="0.00"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-brand-dark">Main Image</CardTitle>
              </CardHeader>
              <CardContent>
                {mainImage ? (
                  <div className="relative inline-block">
                    <ImageWithFallback
                      src={mainImage}
                      alt="Main"
                      className="w-32 h-32 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => setMainImage(null)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleMainImageUpload}
                      className="hidden"
                    />
                    <div className="border-2 border-dashed rounded-xl p-8 text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">Click to upload main image</p>
                    </div>
                  </label>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-brand-dark">Product Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                  {galleryImages.map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group"
                    >
                      <ImageWithFallback
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(index)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-brand-dark transition-colors">
                    <Upload className="w-8 h-8 text-text-medium mb-2" />
                    <span className="text-xs text-text-medium text-center">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-sm text-text-medium">
                  Upload up to 10 images. First image will be the main product image.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-brand-dark">Product Variants</CardTitle>
                <CustomButton
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddVariant}
                >
                  <Plus className="w-4 h-4" />
                  Add Variant
                </CustomButton>
              </CardHeader>
              <CardContent>
                {variants.length === 0 ? (
                  <p className="text-text-medium text-center py-8">
                    No variants added yet. Click &quot;Add Variant&quot; to create size/color combinations.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {variants.map((variant, index) => (
                      <div
                        key={variant.id}
                        className="p-4 border rounded-lg space-y-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-brand-dark">Variant {index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(variant.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <CustomInput
                            label="Size"
                            value={variant.size}
                            onChange={e =>
                              handleUpdateVariant(variant.id, "size", e.target.value)
                            }
                            placeholder="e.g., M, L, XL"
                          />
                          <CustomInput
                            label="Color"
                            value={variant.color}
                            onChange={e =>
                              handleUpdateVariant(variant.id, "color", e.target.value)
                            }
                            placeholder="e.g., Black, Navy"
                          />
                          <CustomInput
                            label="Stock Quantity"
                            type="number"
                            min="0"
                            value={variant.stock}
                            onChange={e =>
                              handleUpdateVariant(
                                variant.id,
                                "stock",
                                parseInt(e.target.value) || 0
                              )
                            }
                            placeholder="0"
                          />
                          <CustomInput
                            label="SKU"
                            value={variant.sku}
                            onChange={e =>
                              handleUpdateVariant(variant.id, "sku", e.target.value)
                            }
                            placeholder="e.g., ESE-BLK-M"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-brand-dark">Publish</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={checked =>
                      setFormData(prev => ({
                        ...prev,
                        is_featured: checked as boolean,
                      }))
                    }
                  />
                  <Label htmlFor="is_featured" className="cursor-pointer">
                    Featured Product
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={checked =>
                      setFormData(prev => ({
                        ...prev,
                        is_active: checked as boolean,
                      }))
                    }
                  />
                  <Label htmlFor="is_active" className="cursor-pointer">
                    Active (Visible to customers)
                  </Label>
                </div>

                <div className="pt-4 space-y-2">
                  <CustomButton
                    variant="primary"
                    type="submit"
                    className="w-full"
                    disabled={isSaving || uploading}
                  >
                    {isSaving ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        {product ? "Update Product" : "Create Product"}
                      </>
                    )}
                  </CustomButton>

                  <CustomButton
                    variant="outline"
                    type="button"
                    className="w-full"
                    onClick={() => router.push("/admin/products")}
                    disabled={isSaving}
                  >
                    Cancel
                  </CustomButton>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md bg-blue-50">
              <CardContent className="p-4">
                <h4 className="text-brand-dark mb-2">Tips</h4>
                <ul className="text-sm text-text-medium space-y-1 list-disc list-inside">
                  <li>Use high-quality product images</li>
                  <li>Write detailed descriptions</li>
                  <li>Add multiple variants for sizes/colors</li>
                  <li>Set competitive pricing</li>
                  <li>Keep stock quantities updated</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}