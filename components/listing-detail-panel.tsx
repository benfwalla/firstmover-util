"use client";

import React, { useState, useEffect } from "react";
import { LocationFeature, OpenHouseListing } from "@/lib/mapbox/utils";
import {
  Navigation,
  Calendar,
  Clock,
  Bed,
  Bath,
  ExternalLink,
  Copy,
  Check,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

type ListingDetailPanelProps = {
  selectedLocation: LocationFeature | null;
  onClose: () => void;
};

export default function ListingDetailPanel({
  selectedLocation,
  onClose,
}: ListingDetailPanelProps) {
  const [copied, setCopied] = useState(false);

  const copyAddressToClipboard = (address: string) => {
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Effect to reset copied state when location changes
  useEffect(() => {
    setCopied(false);
  }, [selectedLocation]);

  if (!selectedLocation) return null;

  const { properties, geometry } = selectedLocation;

  // Common properties
  const name = properties?.name || "Unknown Location";
  const address = properties?.full_address || properties?.address || "";
  const categories = properties?.poi_category || [];
  const lat = geometry?.coordinates?.[1] || properties?.coordinates?.latitude;
  const lng = geometry?.coordinates?.[0] || properties?.coordinates?.longitude;

  // Open house specific properties
  const isOpenHouse = 'openHouseDate' in properties;
  const ohProperties = isOpenHouse ? (properties as OpenHouseListing['properties']) : undefined;
  const openHouseDate = ohProperties?.openHouseDate || "";
  const openHouseTime = ohProperties?.openHouseTime || "";
  const bedroomsDisplay = ohProperties?.bedroomsDisplay || "0";
  const bathroomsDisplay = ohProperties?.bathroomsDisplay || "0";
  const photoUrl = ohProperties?.photoUrl || "";
  const availableAt = ohProperties?.availableAt || "";
  const priceDisplay = ohProperties?.priceDisplay || "";

  return (
    // Panel with fixed width and consistent styling
    <div
      className="w-full bg-background border rounded-lg shadow-md overflow-hidden md:w-[320px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="listing-detail-title"
    >
      {/* Using regular div with overflow - fixed heights for consistency */}
      <div className="max-h-[40vh] md:max-h-[450px] overflow-y-auto"> 
        {/* Content area with consistent padding */}
        <div className="relative p-3">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-1.5 right-1.5 h-7 w-7 md:top-2 md:right-2"
            aria-label="Close details panel"
          >
            <X className="h-4 w-4" />
          </Button>

          {photoUrl && (
            <div className="relative w-full h-28 mb-2 rounded-md overflow-hidden"> {/* Further reduced image height */}
              <Image
                src={photoUrl}
                alt={name}
                layout="fill"
                objectFit="cover"
                className="w-full h-full"
              />
              <div className="absolute top-1 right-1 md:top-1.5 md:right-1.5"> {/* Adjusted badge position */}
                <Badge variant="outline" className="bg-[#0171E5]/90 border-[#0171E5] text-white text-xs px-1.5 py-0.5 md:px-2 md:py-1">
                  {address.includes(',') ? address.split(',')[1].trim() : ''}
                </Badge>
              </div>
            </div>
          )}

          {/* Title and Copy button row */}
          <div className="flex items-start justify-between pr-8 w-full mb-1"> {/* Reduced bottom margin */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <h3 id="listing-detail-title" className="font-semibold text-sm md:text-base truncate">
                  {name}
                </h3>
                <button
                  onClick={() => copyAddressToClipboard(address)}
                  className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                  title="Copy full address"
                  aria-label="Copy address"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
            {/* Price moved below */}
          </div>
          {/* Price on its own row */}
          {priceDisplay && (
             <div className="text-base md:text-lg font-semibold text-[#0171E5] dark:text-[#0171E5] whitespace-nowrap flex-shrink-0 w-full pr-8 mb-2"> {/* Removed text-right, adjusted comment */}
              {priceDisplay}{priceDisplay ? '/mo' : ''}
            </div>
          )}

          {isOpenHouse && ohProperties ? (
            <>
              <div className="mt-2">
                <div className="p-2 rounded-md mb-2 bg-[#0171E5]/10 dark:bg-[#0171E5]/20 border border-[#0171E5]/30 dark:border-[#0171E5]/40">
                  <div className="flex items-center text-sm font-medium text-[#0171E5]">
                    <Calendar className="h-4 w-4 mr-1.5 flex-shrink-0" />
                    <span>{openHouseDate}</span>
                  </div>
                  <div className="flex items-center text-sm font-medium text-[#0171E5] mt-1">
                    <Clock className="h-4 w-4 mr-1.5 flex-shrink-0" />
                    <span>{openHouseTime}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="flex items-center p-1 bg-secondary/50 rounded-md border">
                    <Bed className="h-3.5 w-3.5 mr-1 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs font-medium">
                      {bedroomsDisplay === "Studio" ? bedroomsDisplay : `${bedroomsDisplay} BD`}
                    </span>
                  </div>
                  <div className="flex items-center p-1 bg-secondary/50 rounded-md border">
                    <Bath className="h-3.5 w-3.5 mr-1 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs font-medium">{bathroomsDisplay} BA</span>
                  </div>
                </div>

                {availableAt && (
                  <div className="text-xs text-muted-foreground mt-1.5">
                    <span>Available: {new Date(availableAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                )}
              </div>

              <Separator className="my-3 md:my-4" />

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center justify-center h-7 text-xs"
                  onClick={() => {
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
                      "_blank"
                    );
                  }}
                >
                  <Navigation className="h-3 w-3 mr-1" />
                  Maps
                </Button>

                {ohProperties.external_ids?.website && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center justify-center h-7 text-xs"
                    onClick={() => {
                      window.open(ohProperties.external_ids?.website, "_blank");
                    }}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    StreetEasy
                  </Button>
                )}
              </div>
            </>
          ) : (
            // Fallback for non-open-house locations (if any)
            <>
              {categories.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
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
              <Separator className="my-3 md:my-4" />
              <div className="grid grid-cols-2 gap-2">
                 <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center justify-center h-8"
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
                    className="flex items-center justify-center h-8"
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
      </div>
    </div>
  );
}
