"use client";

import React, { useState } from "react";
import { LocationFeature, OpenHouseListing, iconMap } from "@/lib/mapbox/utils";
import {
  LocateIcon,
  Navigation,
  Calendar,
  Clock,
  Home,
  Bath,
  Bed,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import Popup from "./map/map-popup";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type LocationPopupProps = {
  location: LocationFeature;
  onClose?: () => void;
};

export function LocationPopup({ location, onClose }: LocationPopupProps) {
  const [copied, setCopied] = useState(false);
  
  const copyAddressToClipboard = (address: string) => {
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  if (!location) return null;

  const { properties, geometry } = location;

  const name = properties?.name || "Unknown Location";
  const address = properties?.full_address || properties?.address || "";
  const categories = properties?.poi_category || [];
  // Removed unused variables brand and status
  const maki = properties?.maki || "";

  const lat = geometry?.coordinates?.[1] || properties?.coordinates?.latitude;
  const lng = geometry?.coordinates?.[0] || properties?.coordinates?.longitude;

  // Open house specific properties
  const isOpenHouse = 'openHouseDate' in properties;
  const openHouseDate = properties?.openHouseDate || "";
  const openHouseTime = properties?.openHouseTime || "";
  
  // Use type assertion for open house specific properties
  const ohProperties = isOpenHouse ? (properties as OpenHouseListing['properties']) : undefined;
  const bedroomsDisplay = ohProperties?.bedroomsDisplay || "0";
  const bathroomsDisplay = ohProperties?.bathroomsDisplay || "0";
  const photoUrl = ohProperties?.photoUrl || "";
  const availableAt = ohProperties?.availableAt || "";
  const priceDisplay = ohProperties?.priceDisplay || "";

  return (
    <Popup
      latitude={lat}
      longitude={lng}
      onClose={onClose}
      closeButton={true}
      closeOnClick={false}
      className="location-popup"
      focusAfterOpen={false}
      // Better positioning to avoid filter panel in the top-left
      maxWidth="320px"
      anchor="top"
      offset={[0, 10]}
    >
      <div className="w-[280px] sm:w-[320px]">
        {photoUrl && (
          <div className="relative w-full h-28 mb-2 rounded-t-lg overflow-hidden">
            <img 
              src={photoUrl} 
              alt={name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute top-0 right-0 m-2">
              <Badge variant="outline" className="bg-[#0171E5]/90 border-[#0171E5] text-white">
                {address.includes(',') ? address.split(',')[1].trim() : ''}
              </Badge>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between gap-2 px-2 mb-1">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <h3 className="font-medium text-base truncate">
                {name}
              </h3>
              <button 
                onClick={() => copyAddressToClipboard(address)}
                className="text-muted-foreground hover:text-primary transition-colors"
                title="Copy full address"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
          <div className="text-base font-semibold text-[#0171E5] dark:text-[#0171E5] whitespace-nowrap">
            {priceDisplay}{priceDisplay ? '/mo' : ''}
          </div>
        </div>

        {isOpenHouse ? (
          <>
            <div className="mt-2 px-2">
              <div className="p-2 rounded-md mb-2 bg-[#0171E5]/10 dark:bg-[#0171E5]/20 border border-[#0171E5]/30 dark:border-[#0171E5]/40">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Calendar className="h-3.5 w-3.5 text-[#0171E5] dark:text-[#0171E5]" />
                  <span className="text-xs font-medium">{openHouseDate}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-[#0171E5] dark:text-[#0171E5]" />
                  <span className="text-xs font-medium">{openHouseTime}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex items-center p-1.5 bg-background rounded-md border">
                  <Bed className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                  <span className="text-xs font-medium">
                    {bedroomsDisplay === "Studio" ? bedroomsDisplay : `${bedroomsDisplay} BD`}
                  </span>
                </div>
                <div className="flex items-center p-1.5 bg-background rounded-md border">
                  <Bath className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                  <span className="text-xs font-medium">{bathroomsDisplay} BA</span>
                </div>
              </div>
              

              
              {availableAt && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  <span>Available: {new Date(availableAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              )}
            </div>



            <div className="grid grid-cols-2 gap-2 px-2 mt-2 pb-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center justify-center py-1 h-8"
                onClick={() => {
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
                    "_blank"
                  );
                }}
              >
                <Navigation className="h-3.5 w-3.5 mr-1" />
                Maps
              </Button>

              {properties?.external_ids?.website && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center justify-center py-1 h-8"
                  onClick={() => {
                    window.open(properties.external_ids?.website, "_blank");
                  }}
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  StreetEasy
                </Button>
              )}
            </div>
          </>
        ) : (
          <>
            {categories.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1 max-w-full">
                {categories.slice(0, 3).map((category, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs capitalize truncate max-w-[100px]"
                  >
                    {category}
                  </Badge>
                ))}
                {categories.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{categories.length - 3} more
                  </Badge>
                )}
              </div>
            )}

            <Separator className="my-3" />

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center justify-center"
                onClick={() => {
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
                    "_blank"
                  );
                }}
              >
                <Navigation className="h-4 w-4 mr-1.5" />
                Directions
              </Button>

              {properties?.external_ids?.website && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center justify-center"
                  onClick={() => {
                    window.open(properties.external_ids?.website, "_blank");
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-1.5" />
                  Website
                </Button>
              )}
            </div>
          </>
        )}


      </div>
    </Popup>
  );
}
