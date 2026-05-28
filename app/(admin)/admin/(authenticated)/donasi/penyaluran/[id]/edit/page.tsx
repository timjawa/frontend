import PenyaluranDonasiForm from "@/components/admin/donasi/PenyaluranDonasiForm";

export default async function EditPenyaluranDonasiPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PenyaluranDonasiForm id={id} />;
}
