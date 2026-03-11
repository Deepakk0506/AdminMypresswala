"use client";

import { Shirt, Droplets, Sparkles, Truck, Shirt as Hanger, Home, Wind, Shield, CheckCircle } from "lucide-react";

// Service icon mapping
const serviceIcons = {
  "Ironing Service": Shirt,
  "Laundry Service": Droplets,
  "Steaming & Refresh": Sparkles,
  "Pickup & Delivery": Truck,
  "Dry Cleaning": CheckCircle,
} as const;

type ServiceName = keyof typeof serviceIcons;

interface ServiceIconProps {
  serviceName: string;
  size?: number;
  className?: string;
}

export default function ServiceIcon({ serviceName, size = 20, className = "" }: ServiceIconProps) {
  const IconComponent = serviceIcons[serviceName as ServiceName] || Shirt;
  
  // Debug logging
  console.log(`🔍 ServiceIcon called with serviceName: "${serviceName}"`);
  console.log(`🔍 Available services:`, Object.keys(serviceIcons));
  console.log(`🔍 Icon found:`, IconComponent);
  
  return (
    <div className={`flex items-center justify-center text-blue-600 ${className}`} style={{ color: '#2563eb', fontSize: `${size}px` }}>
      <IconComponent size={size} />
    </div>
  );
}

// Export the mapping for use in other components
export { serviceIcons };
