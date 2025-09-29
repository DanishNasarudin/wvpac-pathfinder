"use client";
import { useFloorStore } from "@/lib/zus-store";
import { Point } from "@/prisma/generated/prisma";
import {
  EdgeWithName,
  FloorWithPointsEdgesRooms,
  updateFloorOptimised,
} from "@/services/actions";
import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

export default function EditButton({
  isProduction,
  data,
  interFloorEdges,
  interFloorPoints,
}: {
  isProduction: boolean;
  data: FloorWithPointsEdgesRooms;
  interFloorEdges: EdgeWithName[];
  interFloorPoints: Point[];
}) {
  const {
    id,
    newPoints,
    newEdges,
    newRooms,
    newRoomGroups,
    updatedPoints,
    updatedEdges,
    updatedRooms,
    updatedRoomGroups,
    interFloor,
    reset,
    edit,
    setEdit,
    initData,
    initInterFloor,
    deletedPointIds,
    deletedRoomIds,
    deletedRoomGroupIds,
    deletedEdgeIds,
    deletedInterFloorIds,
  } = useFloorStore();

  useEffect(() => {
    if (id !== -1 && !edit) {
      !isProduction &&
        toast.promise(
          updateFloorOptimised({
            id,
            newPoints: newPoints.map(({ id, floorId, ...p }) => p),
            newEdges: newEdges.map(({ id, floorId, from, to, ...e }) => e),
            newRooms: newRooms.map(({ id, floorId, ...r }) => r),
            newRoomGroups: newRoomGroups.map(({ id, floorId, ...g }) => g),
            updatedPoints,
            updatedEdges,
            updatedRooms,
            updatedRoomGroups,
            deletedPointIds,
            deletedRoomIds,
            deletedRoomGroupIds,
            deletedInterFloorIds,
            interFloor,
            deletedEdgeIds,
          }).then(({ error }) => {
            if (error) throw new Error(error);
          }),
          {
            loading: "Saving data..",
            success: "Data saved!",
            error: "Data failed to save!",
          }
        );
      reset();
    }
  }, [edit, id]);

  useEffect(() => {
    if (!edit || !data || id !== -1) return;
    initData(data);
    initInterFloor(interFloorEdges, interFloorPoints);
  }, [data, edit]);

  return (
    <Button onClick={() => setEdit()}>
      {edit ? "Exit Editing Mode" : "Edit"}
    </Button>
  );
}
