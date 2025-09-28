"use client";

import L, { LatLngExpression } from "leaflet";
import "leaflet-polylinedecorator";
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";

interface AnimatedPathProps {
  points: LatLngExpression[];
  speed?: number; // pixels per frame
  repeat?: number; // e.g. "20px"
  color?: string;
  weight?: number;
}

export default function AnimatedPath({
  points,
  speed = 1,
  repeat = 20,
  color = "transparent",
  weight = 4,
}: AnimatedPathProps) {
  const map = useMap();
  const decoratorRef = useRef<any>(null);

  useEffect(() => {
    if (!points.length) return;

    // draw the (invisible) base polyline
    const line = L.polyline(points, { color, weight }).addTo(map);

    // prepare your chevron symbol
    const symbol = L.Symbol.arrowHead({
      pixelSize: weight,
      polygon: false,
      pathOptions: { stroke: true, weight: weight / 2 },
    });

    // convert repeat to a number
    const rep = repeat;

    // place decorator with initial 0 offset
    let offset = 0;
    const decorator = (L as any)
      .polylineDecorator(line, {
        patterns: [{ offset, repeat: rep, symbol }],
      })
      .addTo(map);
    decoratorRef.current = decorator;

    // compute px‐per‐ms so that speed param still means px/frame @60fps
    const pxPerMs = (speed * 60) / 1000;

    let rafId: number;
    let lastTime = performance.now();

    // time‐driven loop smooths sub‐pixel movement
    function animate(time: number) {
      const dt = time - lastTime;
      lastTime = time;
      offset = (offset + pxPerMs * dt) % rep;
      decoratorRef.current.setPatterns([{ offset, repeat: rep, symbol }]);
      rafId = requestAnimationFrame(animate);
    }
    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      decorator.remove();
      line.remove();
    };
  }, [map, points, speed, repeat, color, weight]);

  return null;
}
