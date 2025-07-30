"use client";

import dynamic from "next/dynamic";

const MapRender = dynamic(() => import("@/components/custom/map-render"), {
  ssr: false,
});

export default MapRender;
