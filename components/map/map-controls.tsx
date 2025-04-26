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
  );
}
