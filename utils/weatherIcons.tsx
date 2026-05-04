import Image from "next/image";

/**
 * Maps weather condition types to local SVG icon paths
 */
export const getLocalWeatherIconPath = (type: string): string => {
  switch (type) {
    case "sunny":
      return "/icons/cerah.svg";
    case "partly-cloudy":
      return "/icons/cerah-berawan.svg";
    case "cloudy":
      return "/icons/berawan.svg";
    case "light-rain":
      return "/icons/hujan-ringan.svg";
    case "rain":
      return "/icons/hujan-sedang.svg";
    case "thunderstorm":
      return "/icons/hujan-petir.svg";
    default:
      return "/icons/cerah-berawan.svg";
  }
};

/**
 * Weather Icon Component using local SVG files
 */
interface WeatherIconProps {
  type: string;
  className?: string;
  size?: number;
}

export function WeatherIcon({ type, className = "", size = 32 }: WeatherIconProps) {
  const iconPath = getLocalWeatherIconPath(type);
  
  return (
    <Image
      src={iconPath}
      alt={type}
      width={size}
      height={size}
      className={className}
    />
  );
}
