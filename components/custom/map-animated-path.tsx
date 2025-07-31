"use client";

import { Polyline } from "react-leaflet";

export default function AnimatedPath({
  points,
}: {
  points: [number, number][];
}) {
  return (
    <Polyline
      positions={points}
      pathOptions={{ color: "blue", weight: 4 }}
      className="flowing-path"
    />
  );
}
