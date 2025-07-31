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
  interFloorPoints: Point[];
  interFloor: EdgeWithName[];
  pendingAdd: boolean;
  junctionAdd: boolean;
  junctionFrom: string;
  edit: boolean;
  newPoints: Point[];
  newEdges: EdgeWithName[];
  newRooms: Room[];
  updatedPoints: Point[];
  updatedEdges: EdgeWithName[];
  updatedRooms: Room[];
  deletedPointIds: number[];
  deletedEdgeIds: number[];
  deletedRoomIds: number[];
  deletedInterFloorIds: number[];
  setEdit: (newValue?: boolean) => void;
  reset: () => void;
  initInterFloor: (newValue: EdgeWithName[], newOptions: Point[]) => void;
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
  addInterFloor: (newInterFloor: EdgeWithName) => void;
  updateInterFloor: (newInterFloor: EdgeWithName) => void;
  deleteInterFloor: (id: number) => void;
};

const DEFAULT = {
  id: -1,
  floorNum: -1,
  points: [],
  edges: [],
  rooms: [],
  interFloorPoints: [],
  interFloor: [],
  pendingAdd: false,
  junctionAdd: false,
  junctionFrom: "",
  edit: false,
  newPoints: [],
  newEdges: [],
  newRooms: [],
  updatedPoints: [],
  updatedEdges: [],
  updatedRooms: [],
  deletedPointIds: [],
  deletedEdgeIds: [],
  deletedRoomIds: [],
  deletedInterFloorIds: [],
};

export const useFloorStore = create<FloorStore>()((set) => ({
  ...DEFAULT,
  setEdit: (newValue) =>
    set((state) => ({
      edit: typeof newValue !== "undefined" ? newValue : !state.edit,
    })),
  reset: () =>
    set(() => ({
      ...DEFAULT,
    })),
  initInterFloor: (newValue, newOptions) =>
    set({ interFloor: newValue, interFloorPoints: newOptions }),
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

      return {
        points: [...state.points, toAddPoint],
        pendingAdd: false,
        newPoints: [
          ...state.newPoints,
          {
            ...newPoint,
            id: -newId,
            name: newPoint.name === "" ? "enter a name" : newPoint.name,
          },
        ],
      };
    }),
  updatePoint: (newPoint) =>
    set((state) => {
      const updatedPoint = state.points.map((item) =>
        item.id === newPoint.id ? newPoint : item
      );

      const isNew = state.newPoints.some((p) => Math.abs(p.id) === newPoint.id);
      const newPoints = isNew
        ? state.newPoints.map((p) =>
            Math.abs(p.id) === newPoint.id ? newPoint : p
          )
        : state.newPoints;

      const updatedPoints = isNew
        ? state.updatedPoints
        : state.updatedPoints.some((p) => p.id === newPoint.id)
        ? state.updatedPoints.map((p) => (p.id === newPoint.id ? newPoint : p))
        : [...state.updatedPoints, newPoint];

      return {
        points: [...updatedPoint],
        newPoints,
        updatedPoints,
      };
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

      const newId = lastId !== undefined ? lastId.id + 1 : 1;

      const toAddEdge = { ...newEdge };

      return {
        edges: [...state.edges, toAddEdge],
        newEdges: [...state.newEdges, newEdge],
      };
    }),
  updateEdge: (newEdge) =>
    set((state) => {
      const updatedEdge = state.edges.map((item) =>
        item.id === newEdge.id ? newEdge : item
      );

      const isNew = state.newEdges.some((e) => e.id === newEdge.id);
      const newEdges = isNew
        ? state.newEdges.map((e) => (e.id === newEdge.id ? newEdge : e))
        : state.newEdges;

      const updatedEdges = isNew
        ? state.updatedEdges
        : state.updatedEdges.some((e) => e.id === newEdge.id)
        ? state.updatedEdges.map((e) => (e.id === newEdge.id ? newEdge : e))
        : [...state.updatedEdges, newEdge];

      return {
        edges: [...updatedEdge],
        newEdges,
        updatedEdges,
      };
    }),
  deleteEdge: (id) =>
    set((state) => {
      const filteredEdges = state.edges.filter((item) => item.id !== id);
      const deleteEdges = state.edges
        .filter((item) => item.id === id)
        .map((item) => item.id);

      return {
        edges: [...filteredEdges],
        deletedEdgeIds:
          deleteEdges.length > 0
            ? [...state.deletedEdgeIds, ...deleteEdges]
            : state.deletedEdgeIds,
      };
    }),
  addRoom: (newRoom) =>
    set((state) => {
      const lastId = state.rooms.findLast((item) => item.id);

      const newId = lastId !== undefined ? lastId.id + 1 : 1;

      const toAddRoom = { ...newRoom, id: newId };

      return {
        rooms: [...state.rooms, toAddRoom],
        newRooms: [...state.newRooms, { ...newRoom, id: -newId }],
      };
    }),
  updateRoom: (newRoom) =>
    set((state) => {
      const updatedRoom = state.rooms.map((item) =>
        item.id === newRoom.id ? newRoom : item
      );

      const isNew = state.newRooms.some((r) => Math.abs(r.id) === newRoom.id);
      const newRooms = isNew
        ? state.newRooms.map((r) =>
            Math.abs(r.id) === newRoom.id ? newRoom : r
          )
        : state.newRooms;

      const updatedRooms = isNew
        ? state.updatedRooms
        : state.updatedRooms.some((r) => r.id === newRoom.id)
        ? state.updatedRooms.map((r) => (r.id === newRoom.id ? newRoom : r))
        : [...state.updatedRooms, newRoom];

      return {
        rooms: [...updatedRoom],
        newRooms,
        updatedRooms,
      };
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
  addInterFloor: (newInterFloor) =>
    set((state) => {
      const lastId = state.interFloor.findLast((item) => item.id);

      //   const newId = lastId !== undefined ? lastId.id + 1 : 1;

      const toAddInterFloor = { ...newInterFloor };

      return { interFloor: [...state.interFloor, toAddInterFloor] };
    }),
  updateInterFloor: (newInterFloor) =>
    set((state) => {
      const updatedInterFloor = state.interFloor.map((item) =>
        item.id === newInterFloor.id ? newInterFloor : item
      );

      return { interFloor: [...updatedInterFloor] };
    }),
  deleteInterFloor: (id) =>
    set((state) => {
      const filtered = state.interFloor.filter((item) => item.id !== id);
      const deleteInterFloors = state.interFloor
        .filter((item) => item.id === id)
        .map((item) => item.id);

      return {
        interFloor: [...filtered],
        deletedInterFloorIds:
          deleteInterFloors.length > 0
            ? [...state.deletedInterFloorIds, ...deleteInterFloors]
            : state.deletedInterFloorIds,
      };
    }),
}));

type UserStore = {
  fromId: number;
  toId: number;
  setFromId: (newValue: number) => void;
  setToId: (newValue: number) => void;
};

const USER_DEFAULT = {
  fromId: -1,
  toId: -1,
};

export const useUserStore = create<UserStore>()((set) => ({
  ...USER_DEFAULT,
  setFromId: (newValue) => set({ fromId: newValue }),
  setToId: (newValue) => set({ toId: newValue }),
}));
