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

const supabase = createClient();

interface Variant {
  id: string;
  size: string;
  color: string;
  stock_quantity: number;
  sku: string;
  isNew: boolean;
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
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

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
      stock_quantity: v.stock_quantity,
      sku: v.sku,
      isNew: false,
    })) || []
  );

  const [mainImage, setMainImage] = React.useState<string | null>(product?.image_url || null);
  const [galleryImages, setGalleryImages] = React.useState<string[]>(
    product?.product_images.map(img => img.image_url) || []
  );
  const [existingGalleryIds, setExistingGalleryIds] = React.useState<string[]>(
    product?.product_images.map(img => img.id) || []
  );

  // Auto-generate slug
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
      stock_quantity: 0,
      sku: "",
      isNew: true,
    };
    setVariants([...variants, newVariant]);
  };

  const handleUpdateVariant = (
    id: string,
    field: keyof Omit<Variant, "id" | "isNew">,
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
    const removedId = existingGalleryIds[index];
    if (removedId) {
      setExistingGalleryIds(prev => prev.filter((_, i) => i !== index));
    }
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.slug.trim()) newErrors.slug = "Slug is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.category_id) newErrors.category_id = "Category is required";

    // ✅ NEW: Validate category exists
    const selectedCategory = categories.find(c => c.id === formData.category_id);
    if (!selectedCategory) {
      newErrors.category_id = "Selected category no longer exists. Please select another.";
    }

    if (!formData.base_price || parseFloat(formData.base_price) <= 0)
      newErrors.base_price = "Valid base price is required";
    if (
      formData.discount_price &&
      parseFloat(formData.discount_price) >= parseFloat(formData.base_price)
    )
      newErrors.discount_price = "Discount price must be less than base price";

    // Validate variants
    if (variants.length === 0) {
      newErrors.variants = "At least one variant is required";
    } else {
      variants.forEach((v, idx) => {
        if (!v.size.trim()) newErrors[`variant_${idx}_size`] = "Size is required";
        if (!v.color.trim()) newErrors[`variant_${idx}_color`] = "Color is required";
        if (v.stock_quantity < 0) newErrors[`variant_${idx}_stock`] = "Stock cannot be negative";
        if (!v.sku.trim()) newErrors[`variant_${idx}_sku`] = "SKU is required";
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    setSuccessMessage(null);

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

      console.log("[ProductForm] Saving product with category_id:", formData.category_id);

      let productId: string;

      if (product) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", product.id);

        if (error) throw error;
        productId = product.id;
        console.log("[ProductForm] Product updated:", productId);
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert([productData])
          .select("id")
          .single();

        if (error) {
          console.error("[ProductForm] Insert error:", error);
          throw error;
        }
        productId = data.id;
        console.log("[ProductForm] Product created:", productId);
      }

      // Handle variants: insert new ones, update existing ones, delete removed ones
      const variantsToInsert: Array<Omit<Variant, "id" | "isNew">> = [];
      const variantsToUpdate: Map<string, Omit<Variant, "id" | "isNew">> = new Map();
      const variantsToDelete: string[] = [];

      // Separate variants into insert/update operations
      variants.forEach(({ id, size, color, stock_quantity, sku }) => {
        const variantData = { size, color, stock_quantity, sku };
        if (id.startsWith("temp")) {
          variantsToInsert.push(variantData);
        } else {
          variantsToUpdate.set(id, variantData);
        }
      });

      // Find variants that were deleted
      if (product?.product_variants) {
        const currentVariantIds = variants.map(v => v.id).filter(id => !id.startsWith("temp"));
        product.product_variants.forEach(originalVariant => {
          if (!currentVariantIds.includes(originalVariant.id)) {
            variantsToDelete.push(originalVariant.id);
          }
        });
      }

      // Insert new variants
      if (variantsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from("product_variants")
          .insert(
            variantsToInsert.map(variantData => ({
              ...variantData,
              product_id: productId,
            }))
          );

        if (insertError) throw insertError;
        console.log("[ProductForm] Variants inserted:", variantsToInsert.length);
      }

      // Update existing variants
      for (const [variantId, variantData] of variantsToUpdate) {
        const { error: updateError } = await supabase
          .from("product_variants")
          .update(variantData)
          .eq("id", variantId);

        if (updateError) throw updateError;
      }

      if (variantsToUpdate.size > 0) {
        console.log("[ProductForm] Variants updated:", variantsToUpdate.size);
      }

      // Delete removed variants
      if (variantsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from("product_variants")
          .delete()
          .in("id", variantsToDelete);

        if (deleteError) throw deleteError;
        console.log("[ProductForm] Variants deleted:", variantsToDelete.length);
      }

      // Handle gallery images: delete removed ones, insert new ones
      const deletedImageIds = product?.product_images
        .filter(img => !galleryImages.includes(img.image_url))
        .map(img => img.id) || [];

      if (deletedImageIds.length > 0) {
        const { error: deleteImgError } = await supabase
          .from("product_images")
          .delete()
          .in("id", deletedImageIds);

        if (deleteImgError) throw deleteImgError;
        console.log("[ProductForm] Gallery images deleted:", deletedImageIds.length);
      }

      // Insert new gallery images
      const newImages = galleryImages.filter(
        url => !product?.product_images.some(img => img.image_url === url)
      );

      if (newImages.length > 0) {
        const { error: insertImgError } = await supabase
          .from("product_images")
          .insert(
            newImages.map((url, i) => ({
              product_id: productId,
              image_url: url,
              display_order: product?.product_images.length
                ? product.product_images.length + i
                : i,
            }))
          );

        if (insertImgError) throw insertImgError;
        console.log("[ProductForm] Gallery images inserted:", newImages.length);
      }

      const message = product ? "Product updated successfully!" : "Product created successfully!";
      setSuccessMessage(message);
      console.log("[ProductForm] Success:", message);

      setTimeout(() => {
        router.push("/admin/products");
      }, 1500);
    } catch (err) {
      console.error("[ProductForm] Save failed:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save product. Please try again.";
      setErrors({ submit: errorMessage });
      alert(errorMessage);
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
        <h1 className="text-3xl font-bold text-brand-dark">
          {product ? "Edit Product" : "Add New Product"}
        </h1>
      </div>

      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          ✓ {successMessage}
        </div>
      )}

      {errors.submit && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          ✗ {errors.submit}
        </div>
      )}

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
                    Category * {categories.length === 0 && "(No categories available)"}
                  </Label>
                  {categories.length === 0 ? (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700 text-sm">
                      ⚠️ No categories available. Please create a category first.
                    </div>
                  ) : (
                    <Select
                      value={formData.category_id}
                      onValueChange={value => {
                        console.log("[ProductForm] Category changed to:", value);
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
                            {cat.name} {!cat.is_active && "(Inactive)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
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
                {errors.variants && (
                  <p className="mb-4 text-sm text-red-600">{errors.variants}</p>
                )}
                {variants.length === 0 ? (
                  <p className="text-text-medium text-center py-8">
                    No variants added yet. Click &quot;Add Variant&quot; to create size/color
                    combinations.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {variants.map((variant, index) => (
                      <div key={variant.id} className="p-4 border rounded-lg space-y-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-brand-dark">
                            Variant {index + 1}
                            {variant.isNew && (
                              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                New
                              </span>
                            )}
                          </h4>
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
                            error={errors[`variant_${index}_size`]}
                          />
                          <CustomInput
                            label="Color"
                            value={variant.color}
                            onChange={e =>
                              handleUpdateVariant(variant.id, "color", e.target.value)
                            }
                            placeholder="e.g., Black, Navy"
                            error={errors[`variant_${index}_color`]}
                          />
                          <CustomInput
                            label="Stock Quantity"
                            type="number"
                            min="0"
                            value={variant.stock_quantity}
                            onChange={e =>
                              handleUpdateVariant(
                                variant.id,
                                "stock_quantity",
                                parseInt(e.target.value) || 0
                              )
                            }
                            placeholder="0"
                            error={errors[`variant_${index}_stock`]}
                          />
                          <CustomInput
                            label="SKU"
                            value={variant.sku}
                            onChange={e =>
                              handleUpdateVariant(variant.id, "sku", e.target.value)
                            }
                            placeholder="e.g., ESE-BLK-M"
                            error={errors[`variant_${index}_sku`]}
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
                    disabled={isSaving || uploading || categories.length === 0}
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
                <h4 className="text-brand-dark mb-2 font-semibold">Tips</h4>
                <ul className="text-sm text-text-medium space-y-1 list-disc list-inside">
                  <li>Use high-quality product images</li>
                  <li>Write detailed descriptions</li>
                  <li>Add at least one variant</li>
                  <li>Set competitive pricing</li>
                  <li>Keep stock quantities updated</li>
                  <li>✅ Select an existing category</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
