import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BeritaForm from "@/components/form/BeritaForm";

export default function EditBeritaPage({ params }: { params: { id: string } }) {
  // Dummy data
  const dummyBerita = {
    title: "Peringatan Dini Cuaca Ekstrem Jember",
    slug: "peringatan-dini-cuaca-ekstrem-jember",
    category: "cuaca",
    teaser: "BMKG mengeluarkan peringatan dini cuaca ekstrem untuk wilayah Jember.",
    content: "Badan Meteorologi, Klimatologi, dan Geofisika (BMKG) mengimbau masyarakat Kabupaten Jember untuk waspada terhadap potensi hujan lebat disertai angin kencang. \n\nPeringatan ini berlaku mulai hari ini hingga tiga hari ke depan, terutama di wilayah pegunungan dan pesisir selatan.",
    coverImage: "https://images.unsplash.com/photo-1596700770933-2a382e2f69ff?w=800&q=80",
    source: "BMKG Jatim",
    tags: "cuaca, bmkg, waspada",
    status: "published"
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Berita" className="mb-0" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-4xl">
          <h3 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-3xl">
            Form Edit Berita
          </h3>
          <p className="text-sm text-gray-500 mb-6 -mt-4">
            Perbarui informasi artikel berita (ID: {params.id}).
          </p>
          <BeritaForm isEdit={true} initialData={dummyBerita} />
        </div>
      </div>
    </div>
  );
}
