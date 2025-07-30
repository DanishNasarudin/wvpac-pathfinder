"use client";
import L, { FitBoundsOptions, LatLngExpression } from "leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

type Props = {
  positions: LatLngExpression[];
  padding?: number;
};

export default function MapFitBounds({ positions, padding = 20 }: Props) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions as [number, number][]);
      const options: FitBoundsOptions = { padding: [padding, padding] };
      map.fitBounds(bounds, options);
    }
  }, [map, positions, padding]);

  return null;
}
