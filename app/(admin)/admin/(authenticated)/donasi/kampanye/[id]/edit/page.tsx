import KampanyeDonasiForm from "@/components/admin/donasi/KampanyeDonasiForm";

export default async function EditKampanyeDonasiPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <KampanyeDonasiForm id={id} />;
}
