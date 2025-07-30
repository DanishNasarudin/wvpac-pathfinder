import { Point, Room } from "@/prisma/generated/prisma";
import { EdgeWithName, FloorWithPointsEdgesRooms } from "@/services/actions";
import { create } from "zustand";
import { handleError } from "./utils";

type FloorStore = {
  id: number;
  floorNum: number;
  points: Point[];
  edges: EdgeWithName[];
  rooms: Room[];
  pendingAdd: boolean;
  junctionAdd: boolean;
  junctionFrom: string;
  edit: boolean;
  deletedPointIds: number[];
  deletedEdgeIds: number[];
  deletedRoomIds: number[];
  setEdit: (newValue?: boolean) => void;
  reset: () => void;
  initData: (newValue: FloorWithPointsEdgesRooms) => void;
  triggerAddPoint: () => void;
  addPoint: (newPoint: Point) => void;
  updatePoint: (newPoint: Point) => void;
  deletePoint: (id: number) => void;
  triggerAddJunction: () => void;
  setJunctionFrom: (newJunc: string) => void;
  setJunctionTo: (newJunc: string) => void;
  addEdge: (newEdge: EdgeWithName) => void;
  updateEdge: (newEdge: EdgeWithName) => void;
  deleteEdge: (id: number) => void;
  addRoom: (newRoom: Room) => void;
  updateRoom: (newRoom: Room) => void;
  deleteRoom: (id: number) => void;
};

export const useFloorStore = create<FloorStore>()((set) => ({
  id: -1,
  floorNum: -1,
  points: [],
  edges: [],
  rooms: [],
  pendingAdd: false,
  junctionAdd: false,
  junctionFrom: "",
  edit: false,
  deletedPointIds: [],
  deletedEdgeIds: [],
  deletedRoomIds: [],
  setEdit: (newValue) =>
    set((state) => ({
      edit: typeof newValue !== "undefined" ? newValue : !state.edit,
    })),
  reset: () =>
    set(() => ({
      id: -1,
      floorNum: -1,
      points: [],
      edges: [],
      rooms: [],
      pendingAdd: false,
      junctionAdd: false,
      edit: false,
      deletedPointIds: [],
      deletedEdgeIds: [],
      deletedRoomIds: [],
    })),
  initData: (newValue) =>
    set({
      id: newValue.id,
      points: newValue.points,
      edges: newValue.edges,
      rooms: newValue.rooms,
      floorNum: Number(newValue.name.split(" ")[1]) || -1,
    }),
  triggerAddPoint: () => set(() => ({ pendingAdd: true })),
  addPoint: (newPoint) =>
    set((state) => {
      const lastId = state.points.findLast((item) => item.id);

      // if (lastId === undefined)
      //   handleError("Adding Point failed. Last id not found.");

      const newId = lastId !== undefined ? lastId?.id + 1 : 1;

      const toAddPoint = {
        ...newPoint,
        id: newId,
        name: newPoint.name === "" ? "enter a name" : newPoint.name,
      };

      if (toAddPoint.id === -1) handleError("Adding Point failed. Id invalid");

      return { points: [...state.points, toAddPoint], pendingAdd: false };
    }),
  updatePoint: (newPoint) =>
    set((state) => {
      const updatedPoint = state.points.map((item) =>
        item.id === newPoint.id ? newPoint : item
      );

      return { points: [...updatedPoint] };
    }),
  deletePoint: (id) =>
    set((state) => {
      const filteredPoints = state.points.filter((item) => item.id !== id);
      const filteredEdges = state.edges.filter(
        (item) => !(item.fromId === id || item.toId === id)
      );
      const deletePoints = state.points
        .filter((item) => item.id === id)
        .map((item) => item.id);
      const deleteEdges = state.edges
        .filter((item) => item.fromId === id || item.toId === id)
        .map((item) => item.id);

      return {
        points: [...filteredPoints],
        edges: [...filteredEdges],
        deletedPointIds:
          deletePoints.length > 0
            ? [...state.deletedPointIds, ...deletePoints]
            : state.deletedPointIds,
        deletedEdgeIds:
          deleteEdges.length > 0
            ? [...state.deletedEdgeIds, ...deleteEdges]
            : state.deletedEdgeIds,
      };
    }),
  triggerAddJunction: () =>
    set((state) => ({ junctionAdd: !state.junctionAdd })),
  setJunctionFrom: (newJunc) => set(() => ({ junctionFrom: newJunc })),
  setJunctionTo: (newJunc) =>
    set((state) => {
      const junctionFrom = state.junctionFrom;
      const junctionTo = newJunc;

      const addEdge = state.addEdge;
      const points = state.points;

      if (junctionFrom === "" || junctionTo === "")
        handleError("From / To Junction is empty.");

      addEdge({
        id: -1,
        floorId: state.id,
        fromId: points.find((item) => item.name === junctionFrom)?.id || -1,
        toId: points.find((item) => item.name === junctionTo)?.id || -1,
        from: {
          name: points.find((item) => item.name === junctionFrom)?.name || "",
        },
        to: {
          name: points.find((item) => item.name === junctionTo)?.name || "",
        },
      });

      return { junctionFrom: "" };
    }),
  addEdge: (newEdge) =>
    set((state) => {
      const lastId = state.edges.findLast((item) => item.id);

      // if (lastId === undefined)
      //   handleError("Adding Edge failed. Last id not found.");

      const newId = lastId !== undefined ? lastId?.id + 1 : 1;

      const toAddEdge = { ...newEdge, id: newId };

      if (toAddEdge.id === -1) handleError("Adding Edge failed. Id invalid");

      return { edges: [...state.edges, toAddEdge] };
    }),
  updateEdge: (newEdge) =>
    set((state) => {
      const updatedEdge = state.edges.map((item) =>
        item.id === newEdge.id ? newEdge : item
      );

      return { edges: [...updatedEdge] };
    }),
  deleteEdge: (id) =>
    set((state) => {
      const filteredEdges = state.edges.filter((item) => item.id !== id);

      return { edges: [...filteredEdges] };
    }),
  addRoom: (newRoom) =>
    set((state) => {
      const lastId = state.rooms.findLast((item) => item.id);

      const newId = lastId !== undefined ? lastId.id + 1 : 1;

      const toAddRoom = { ...newRoom, id: newId };

      return { rooms: [...state.rooms, toAddRoom] };
    }),
  updateRoom: (newRoom) =>
    set((state) => {
      const updatedRoom = state.rooms.map((item) =>
        item.id === newRoom.id ? newRoom : item
      );

      return { rooms: [...updatedRoom] };
    }),
  deleteRoom: (id) =>
    set((state) => {
      const filtered = state.rooms.filter((item) => item.id !== id);
      const deleteRooms = state.rooms
        .filter((item) => item.id === id)
        .map((item) => item.id);

      return {
        rooms: [...filtered],
        deletedRoomIds:
          deleteRooms.length > 0
            ? [...state.deletedRoomIds, ...deleteRooms]
            : state.deletedRoomIds,
      };
    }),
}));
