"use client";
import { useFloorStore } from "@/lib/zus-store";
import { Point } from "@/prisma/generated/prisma";
import {
  EdgeWithName,
  FloorWithPointsEdgesRooms,
  updateFloor,
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
    points,
    edges,
    rooms,
    interFloor,
    reset,
    edit,
    setEdit,
    initData,
    initInterFloor,
    deletedPointIds,
    deletedRoomIds,
    deletedInterFloorIds,
  } = useFloorStore();

  useEffect(() => {
    if (id !== -1 && !edit) {
      !isProduction &&
        toast.promise(
          updateFloor({
            id,
            points,
            edges,
            rooms,
            deletedPointIds,
            deletedRoomIds,
            deletedInterFloorIds,
            interFloor,
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
  }, [edit, points, edges]);

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
