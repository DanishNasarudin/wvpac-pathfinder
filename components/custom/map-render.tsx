"use client";
import { getRenderPathsForRooms } from "@/lib/utils";
import { useFloorStore, useUserStore } from "@/lib/zus-store";
import { Edge, Point } from "@/prisma/generated/prisma";
import { FloorWithPointsEdgesRooms } from "@/services/actions";
import L from "leaflet";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
import "leaflet/dist/leaflet.css";
import React, {
  createElement,
  JSX,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { MapContainer, SVGOverlay, ZoomControl } from "react-leaflet";
import { useMediaQuery } from "usehooks-ts";
import MapAnimatedPath from "./map-animated-path";
import MapClickHandler from "./map-click-handler";
import MapFitBounds from "./map-fit-bounds";
import MapPointCircle from "./map-point-circle";

export default function MapRender({
  allEdges,
  allPoints,
  currentFloorPoints,
  data,
}: {
  allEdges: Edge[];
  allPoints: Point[];
  currentFloorPoints: Point[];
  data: FloorWithPointsEdgesRooms;
}) {
  const MAP_HEIGHT = 400;
  const MAP_WIDTH = 600;
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [paths, setPaths] = useState<React.ReactNode[]>([]);
  const [isPending, startTransition] = useTransition();

  const { fromId, toId } = useUserStore();

  const bounds: [[number, number], [number, number]] = [
    [0, 0],
    [MAP_HEIGHT, MAP_WIDTH],
  ];

  const renderFullPaths = useMemo(() => {
    if (!(fromId && toId)) return [];

    const result = getRenderPathsForRooms(
      fromId,
      toId,
      allEdges,
      allPoints,
      currentFloorPoints
    );

    return result;
  }, [fromId, toId, currentFloorPoints, allEdges, allPoints]);

  const positions: [number, number][] = useMemo(
    () => renderFullPaths.map((p) => [MAP_HEIGHT - p.y, p.x]),
    [renderFullPaths]
  );

  const { id, points, edges, initData, edit } = useFloorStore();

  const floorObject = { id, points, edges };

  const edgePaths = useMemo(
    () =>
      edges.map((edge, index) => {
        const fromPoint = points.find((p) => p.name === edge.from.name)!;
        const toPoint = points.find((p) => p.name === edge.to.name)!;
        return (
          <line
            key={index}
            x1={fromPoint.x}
            y1={fromPoint.y}
            x2={toPoint.x}
            y2={toPoint.y}
            stroke="gray"
            strokeWidth={1}
          />
        );
      }),
    [edges, points]
  );

  const pointCircleEdit = useMemo(
    () =>
      floorObject.points.map((point) => (
        <React.Fragment key={`point-${point.id}`}>
          <MapPointCircle x={point.x} y={point.y} name={point.name} />
        </React.Fragment>
      )),
    [floorObject]
  );

  const totalPath: React.ReactNode[] = useMemo(
    () => (edit ? [...paths, ...edgePaths, ...pointCircleEdit] : [...paths]),
    [edit, edgePaths, pointCircleEdit, paths]
  );

  useEffect(() => {
    const src = data.src;
    if (!src) return;

    startTransition(() => {
      fetch(src)
        .then((res) => res.text())
        .then((raw) => {
          const doc = new DOMParser().parseFromString(raw, "image/svg+xml");
          const svg = doc.querySelector("svg");
          if (!svg) return;

          const newShapes: React.ReactNode[] = [];
          svg
            .querySelectorAll<SVGElement>(
              "path, polygon, rect, circle, ellipse, text, line, polyline"
            )
            .forEach((el, i) => {
              const tag =
                el.tagName.toLowerCase() as keyof JSX.IntrinsicElements;
              const id = el.getAttribute("id") ?? `${tag}-${i}`;

              const dynamicProps: Record<string, any> = {};
              Array.from(el.attributes).forEach((attr) => {
                if (attr.name === "style") {
                  const styleObj: Record<string, string> = {};
                  attr.value.split(";").forEach((pair) => {
                    const [k, v] = pair.split(":");
                    if (k && v) {
                      styleObj[
                        k.trim().replace(/-([a-z])/g, (_, l) => l.toUpperCase())
                      ] = v.trim();
                    }
                  });
                  dynamicProps.style = styleObj;
                } else {
                  dynamicProps[attr.name] = attr.value;
                }
              });

              let children: React.ReactNode;
              if (tag === "text") {
                const textEl = el as SVGTextElement;
                const tspans = Array.from(textEl.querySelectorAll("tspan"));
                if (tspans.length) {
                  children = tspans.map((t, idx) => {
                    const tProps: React.SVGProps<SVGTSpanElement> = {
                      key: idx,
                    };

                    Array.from(t.attributes).forEach((attr) => {
                      if (attr.name === "style") {
                        const styleObj: React.CSSProperties = {};
                        attr.value.split(";").forEach((pair) => {
                          const [k, v] = pair.split(":");
                          if (k && v) {
                            const jsKey = k
                              .trim()
                              .replace(/-([a-z])/g, (_, l) => l.toUpperCase());
                            (styleObj as any)[jsKey] = v.trim();
                          }
                        });
                        tProps.style = styleObj;
                      } else {
                        (tProps as any)[attr.name] = attr.value;
                      }
                    });

                    return createElement("tspan", tProps, t.textContent);
                  });
                } else if (textEl.textContent?.includes("\n")) {
                  const x = textEl.getAttribute("x") ?? "0";
                  const lines = textEl.textContent.split(/\r?\n/);
                  children = lines.map((line, idx) => {
                    const tProps: React.SVGProps<SVGTSpanElement> = {
                      key: idx,
                      x,
                      dy: idx === 0 ? undefined : "1em",
                    };
                    return createElement("tspan", tProps, line);
                  });
                } else {
                  children = textEl.textContent;
                }
              }

              newShapes.push(
                createElement(
                  tag,
                  {
                    key: id,
                    ...(dynamicProps as React.SVGProps<SVGElement>),
                    // onClick: (e: React.MouseEvent<SVGElement>) =>
                    //   console.log("Clicked:", id),
                    onMouseEnter: (e: React.MouseEvent<SVGElement>) => {
                      const fill = dynamicProps.style.fill as
                        | string
                        | undefined;
                      // if (fill && fill !== "none" && tag !== "text")
                      //   e.currentTarget.style.fill = "orange";

                      // console.log(fill, tag, "C");
                    },
                    onMouseLeave: (e: React.MouseEvent<SVGElement>) => {
                      if (dynamicProps.style.fill)
                        e.currentTarget.style.fill = dynamicProps.style.fill;
                    },
                  },
                  children
                )
              );
            });

          setPaths(newShapes);
        });
    });
  }, [data.src]);

  if (isPending) {
    return (
      <div className="h-[60vh] w-full animate-pulse bg-foreground/10"></div>
    );
  }

  return (
    <MapContainer
      crs={L.CRS.Simple}
      bounds={bounds}
      minZoom={-1}
      style={{ height: "50vh", width: "100%", zIndex: 4 }}
      attributionControl={false}
      zoomControl={false}
      zoomSnap={isMobile ? 0 : 1}
      className="bg-white!"
    >
      <MapClickHandler mapHeight={MAP_HEIGHT} />
      <MapAnimatedPath points={positions} />
      <MapFitBounds positions={positions} padding={50} />
      <SVGOverlay bounds={bounds} interactive className="!z-[2]">
        <svg
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          {totalPath}
        </svg>
      </SVGOverlay>
      <ZoomControl position="bottomright" />
    </MapContainer>
  );
}
