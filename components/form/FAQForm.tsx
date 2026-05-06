"use client";

import React, { useState } from "react";
import InputField from "./input/InputField";
import TextArea from "./input/TextArea";
import Select from "./Select";
import Switch from "./switch/Switch";
import Label from "./Label";

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
}

const FAQForm: React.FC<FAQFormProps> = ({ isEdit = false, initialData }) => {
  const [formData, setFormData] = useState<FAQFormData>({
    question: initialData?.question || "",
    answer: initialData?.answer || "",
    category: initialData?.category || "",
    order: initialData?.order || 0,
    isActive: initialData?.isActive ?? true
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("FAQ Form data:", formData);
    // Here you would typically send the data to your API
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Pertanyaan */}
      <div>
        <Label htmlFor="question">Pertanyaan *</Label>
        <InputField
          id="question"
          name="question"
          placeholder="Masukkan pertanyaan FAQ"
          defaultValue={formData.question}
          onChange={(e) => handleInputChange('question', e.target.value)}
        />
      </div>

      {/* Jawaban */}
      <div>
        <Label htmlFor="answer">Jawaban *</Label>
        <TextArea
          placeholder="Masukkan jawaban lengkap untuk pertanyaan tersebut"
          rows={6}
          value={formData.answer}
          onChange={(value) => handleInputChange('answer', value)}
        />
      </div>

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
      <div>
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

      {/* Submit Button */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
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
