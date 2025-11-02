import { ProductForm } from "@/components/admin/ProductForm";
import { createClient } from "@/lib/supabase/client";
import AdminPageWrapper from "@/components/admin/AdminPageWrapper";

const supabase = createClient();

async function NewProductPageContent() {
  const { data: categories } = await supabase.from("categories").select("*");

  return <ProductForm categories={categories || []} />;
}

export default function NewProductPage() {
  return (
    <AdminPageWrapper>
      <NewProductPageContent />
    </AdminPageWrapper>
  );
}
