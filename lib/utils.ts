import { Edge, Point } from "@/prisma/generated/prisma";
import { clsx, type ClassValue } from "clsx";
import { ReadonlyURLSearchParams } from "next/navigation";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function handleError(message: string) {
  console.error(message);
  throw new Error(message);
}

export function createURL(
  pathname: string,
  params: URLSearchParams | ReadonlyURLSearchParams
) {
  const paramString = params.toString();
  const queryString = `${paramString.length ? `?` : ""}${paramString}`;

  return `${pathname}${queryString}`;
}

export function round(value: number, precision: number) {
  const multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}

export function makeBidirectional(edges: Edge[]) {
  const uniqueEdges = new Set<string>();
  const bidirectionalEdges: Edge[] = [];

  edges.forEach((edge) => {
    const floor = edge.floorId !== null ? `F${edge.floorId}-` : "";
    const forwardKey = `${edge.fromId}>${edge.toId}`;
    const reverseKey = `${edge.toId}>${edge.fromId}`;

    if (!uniqueEdges.has(forwardKey)) {
      uniqueEdges.add(forwardKey);
      bidirectionalEdges.push(edge);
    }

    if (!uniqueEdges.has(reverseKey)) {
      uniqueEdges.add(reverseKey);
      bidirectionalEdges.push({
        id: edge.id + 1000,
        fromId: edge.toId,
        toId: edge.fromId,
        floorId: edge.floorId,
      });
    }
  });

  return bidirectionalEdges;
}

export function calculateSegment(start: Point, end: Point) {
  const path: Point[] = [];
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;

  const steps = Math.max(Math.abs(deltaX), Math.abs(deltaY));

  const stepX = deltaX / steps;
  const stepY = deltaY / steps;

  for (let i = 0; i <= steps; i++) {
    const x = start.x + stepX * i;
    const y = start.y + stepY * i;

    if (isNaN(x) || isNaN(y)) break;

    path.push({
      id: start.id,
      type: start.type,
      name: start.name,
      x,
      y,
      floorId: start.floorId,
      roomId: start.roomId,
    });
  }

  return path;
}

export function generateFullPath(pointPath: Point[]) {
  const fullPath: Point[] = [];

  for (let i = 0; i < pointPath.length - 1; i++) {
    const segment = calculateSegment(pointPath[i], pointPath[i + 1]);
    fullPath.push(...segment);
  }

  return fullPath;
}

export function calculateDistance(point1: Point, point2: Point) {
  return Math.sqrt(
    Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
  );
}

export function findShortestPathDijkstraDynamic(
  startId: string,
  endId: string,
  edges: Edge[],
  points: Point[]
): Point[] | null {
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set<string>();

  if (!points || points.length === 0) {
    handleError("Points array is undefined or empty");
    return null;
  }

  // Initialize distances and unvisited set
  points.forEach((point) => {
    distances[point.id] = String(point.id) === startId ? 0 : Infinity;
    previous[point.id] = null;
    unvisited.add(String(point.id));
  });

  while (unvisited.size > 0) {
    // Find the unvisited node with the smallest distance
    const current = Array.from(unvisited).reduce((closest, node) =>
      distances[node] < distances[closest] ? node : closest
    );

    if (distances[current] === Infinity) {
      // No remaining reachable nodes
      break;
    }

    if (current === endId) {
      // Build the shortest path
      const path: Point[] = [];
      let step: string | null = endId;
      while (step) {
        const point = points.find((p) => String(p.id) === step);
        if (point) path.unshift(point);
        step = previous[step];
      }
      return path;
    }

    // Remove current node from unvisited
    unvisited.delete(current);

    // Update distances to neighbors
    edges
      .filter((edge) => String(edge.fromId) === current)
      .forEach((edge) => {
        const fromPoint = points.find((p) => p.id === edge.fromId);
        const toPoint = points.find((p) => p.id === edge.toId);

        if (fromPoint && toPoint) {
          const weight = calculateDistance(fromPoint, toPoint);
          const newDistance = distances[current] + weight;

          if (newDistance < distances[edge.toId]) {
            distances[edge.toId] = newDistance;
            previous[edge.toId] = current;
          }
        } else {
          console.error(`Invalid edge: ${edge.fromId} -> ${edge.toId}`);
        }
      });
  }

  // console.error("Path not found.");
  return null; // No path found
}

export function getEntryPointsForRoom(
  roomId: number,
  points: Point[]
): Point[] {
  return points.filter((p) => p.roomId === roomId);
}

export function calculatePathDistance(path: Point[]): number {
  return path.reduce((sum, point, idx, arr) => {
    if (idx === 0) return 0;
    const prev = arr[idx - 1];
    return sum + Math.hypot(point.x - prev.x, point.y - prev.y);
  }, 0);
}

export function findShortestPathBetweenRooms(
  startRoomId: number,
  endRoomId: number,
  edges: Edge[],
  points: Point[]
): Point[] {
  const bidirEdges = makeBidirectional(edges);
  const startPoints = getEntryPointsForRoom(startRoomId, points);
  const endPoints = getEntryPointsForRoom(endRoomId, points);

  let bestPointPath: Point[] | null = null;
  let minDistance = Infinity;

  for (const startP of startPoints) {
    for (const endP of endPoints) {
      const candidatePath = findShortestPathDijkstraDynamic(
        startP.id.toString(),
        endP.id.toString(),
        bidirEdges,
        points
      );
      if (candidatePath) {
        const dist = calculatePathDistance(candidatePath);
        if (dist < minDistance) {
          minDistance = dist;
          bestPointPath = candidatePath;
        }
      }
    }
  }

  return bestPointPath ?? [];
}

export function getRenderPathsForRooms(
  startRoomId: number,
  endRoomId: number,
  allEdges: Edge[],
  allPoints: Point[],
  currentFloorPoints: Point[]
): Point[] {
  const pointPath = findShortestPathBetweenRooms(
    startRoomId,
    endRoomId,
    allEdges,
    allPoints
  );
  const fullPath = generateFullPath(pointPath);
  console.log(allPoints, "CURR");
  return fullPath.filter((pt) =>
    currentFloorPoints.some((fpt) => fpt.id === pt.id)
  );
}

export function getRenderPaths(
  startId: string,
  endId: string,
  allEdges: Edge[],
  allPoints: Point[],
  currentFloorPoints: Point[]
): Point[] {
  const paths: Edge[] = makeBidirectional(allEdges);

  const pointPath = findShortestPathDijkstraDynamic(
    startId,
    endId,
    paths,
    allPoints
  );

  const fullPath = pointPath ? generateFullPath(pointPath) : [];
  const renderFullPaths = fullPath.filter((point) =>
    currentFloorPoints.some((p) => p.id === point.id)
  );

  return renderFullPaths;
}
