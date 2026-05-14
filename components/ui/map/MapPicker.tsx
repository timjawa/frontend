"use client";

import dynamic from "next/dynamic";

const MapPickerComponent = dynamic(() => import("./MapPickerComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-72 bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400 text-sm">
      Memuat Peta...
    </div>
  ),
});

interface MapPickerProps {
  latitude: number | string;
  longitude: number | string;
  onChange: (lat: number, lng: number) => void;
  className?: string;
}

export default function MapPicker(props: MapPickerProps) {
  return <MapPickerComponent {...props} />;
}
