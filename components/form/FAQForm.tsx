"use client";

import React, { useState, useEffect } from "react";
import InputField from "./input/InputField";
import TextArea from "./input/TextArea";
import Select from "./Select";
import Switch from "./switch/Switch";
import Label from "./Label";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

interface FAQFormData {
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
}

interface FAQFormProps {
  isEdit?: boolean;
  initialData?: any;
  id?: string;
}

const FAQForm: React.FC<FAQFormProps> = ({ isEdit = false, initialData, id }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FAQFormData>({
    question: initialData?.pertanyaan || "",
    answer: initialData?.jawaban || "",
    category: initialData?.kategori || "umum",
    order: initialData?.urutan || 1,
    isActive: initialData?.is_active ?? true
  });

  // Ensure initialData updates when it arrives (useful for edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        question: initialData.pertanyaan || "",
        answer: initialData.jawaban || "",
        category: initialData.kategori || "umum",
        order: initialData.urutan || 1,
        isActive: initialData.is_active ?? true
      });
    }
  }, [initialData]);

  // Category options
  const categoryOptions = [
    { value: "umum", label: "Umum" },
    { value: "akun", label: "Akun" },
    { value: "bantuan", label: "Bantuan" },
    { value: "teknis", label: "Teknis" },
    { value: "kebijakan", label: "Kebijakan" },
    { value: "kontak", label: "Kontak" }
  ];

  const handleInputChange = (field: keyof FAQFormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      pertanyaan: formData.question,
      jawaban: formData.answer,
      kategori: formData.category,
      urutan: formData.order,
      is_active: formData.isActive,
    };

    try {
      if (isEdit && id) {
        await api.put(`/api/faq/${id}`, payload);
      } else {
        await api.post("/api/faq", payload);
      }
      router.push("/admin/faq");
      router.refresh();
    } catch (err: any) {
      console.error("Error saving FAQ:", err);
      setError(err.response?.data?.message || "Gagal menyimpan FAQ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Kategori */}
      <div>
        <Label htmlFor="category">Kategori *</Label>
        <Select
          options={categoryOptions}
          placeholder="Pilih kategori FAQ"
          onChange={(value) => handleInputChange('category', value)}
          defaultValue={formData.category}
        />
      </div>

      {/* Urutan */}
      <div>
        <Label htmlFor="order">Urutan Tampil</Label>
        <InputField
          id="order"
          name="order"
          type="number"
          placeholder="Masukkan nomor urutan tampil"
          defaultValue={formData.order}
          onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 0)}
          min="1"
          hint="Nomor urutan untuk mengatur posisi tampil FAQ (1 = paling atas)"
        />
      </div>

      {/* Switch Is Active */}
      <div className="md:col-span-2">
        <Label>Status Aktif</Label>
        <div className="space-y-2">
          <Switch
            label="FAQ Aktif"
            defaultChecked={formData.isActive}
            onChange={(checked) => handleInputChange('isActive', checked)}
            color="blue"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            FAQ yang aktif akan ditampilkan di halaman publik. FAQ yang non-aktif akan disembunyikan.
          </p>
        </div>
      </div>

      {/* Pertanyaan */}
      <div className="md:col-span-2">
        <Label htmlFor="question">Pertanyaan *</Label>
        <InputField
          id="question"
          name="question"
          placeholder="Masukkan pertanyaan FAQ"
          value={formData.question}
          onChange={(e) => handleInputChange('question', e.target.value)}
        />
      </div>

      {/* Jawaban */}
      <div className="md:col-span-2">
        <Label htmlFor="answer">Jawaban *</Label>
        <TextArea
          placeholder="Masukkan jawaban lengkap untuk pertanyaan tersebut"
          rows={6}
          value={formData.answer}
          onChange={(value) => handleInputChange('answer', value)}
        />
      </div>
      </div>

      {/* Submit Button */}
      <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Batal
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-brand-600 border border-transparent rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 dark:bg-brand-600 dark:hover:bg-brand-700"
        >
          {isEdit ? "Perbarui FAQ" : "Simpan FAQ"}
        </button>
      </div>
    </form>
  );
};

export default FAQForm;
