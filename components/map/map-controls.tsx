"use client";

import React from "react";
import { PlusIcon, MinusIcon } from "lucide-react";

import { useMap } from "@/context/map-context";
import { Button } from "@/components/ui/button";

export default function MapControls() {
  const { map } = useMap();

  const zoomIn = () => {
    map?.zoomIn();
  };

  const zoomOut = () => {
    map?.zoomOut();
  };

  return (
    <>
      <aside className="absolute bottom-4 right-4 z-10 bg-background/80 backdrop-blur-sm p-1 rounded-md shadow-md flex flex-col gap-1">
        <Button variant="ghost" size="icon" onClick={zoomIn} className="h-8 w-8 p-1">
          <PlusIcon className="w-4 h-4" />
          <span className="sr-only">Zoom in</span>
        </Button>
        <Button variant="ghost" size="icon" onClick={zoomOut} className="h-8 w-8 p-1">
          <MinusIcon className="w-4 h-4" />
          <span className="sr-only">Zoom out</span>
        </Button>
      </aside>
      <a 
        href="https://firstmovernyc.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 bg-background px-2 py-1 rounded text-xs sm:text-sm flex items-center gap-1"
      >
        <span className="text-muted-foreground">Powered by</span>
        <img 
          src="/logos/wide_transparent.svg" 
          alt="FirstMover" 
          className="h-3 sm:h-4 w-auto"
        />
      </a>
    </>
  );
}
