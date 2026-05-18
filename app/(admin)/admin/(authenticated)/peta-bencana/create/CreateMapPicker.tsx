"use client";

import dynamic from "next/dynamic";

const CreateMapPickerComponent = dynamic<{
  latitude: number | string;
  longitude: number | string;
  tipeMarker: "titik" | "garis";
  pathPoints: [number, number][];
  onMapClick: (lat: number, lng: number) => void;
  className?: string;
}>(
  () => import("./CreateMapPickerComponent"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400 text-sm dark:bg-gray-800">
        Memuat Peta...
      </div>
    ),
  }
);

interface CreateMapPickerProps {
  latitude: number | string;
  longitude: number | string;
  tipeMarker: "titik" | "garis";
  pathPoints: [number, number][];
  onMapClick: (lat: number, lng: number) => void;
  className?: string;
}

export default function CreateMapPicker(props: CreateMapPickerProps) {
  return <CreateMapPickerComponent {...props} />;
}
