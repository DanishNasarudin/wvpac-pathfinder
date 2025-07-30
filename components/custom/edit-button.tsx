"use client";
import { useFloorStore } from "@/lib/zus-store";
import { FloorWithPointsEdgesRooms, updateFloor } from "@/services/actions";
import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

export default function EditButton({
  isProduction,
  data,
}: {
  isProduction: boolean;
  data: FloorWithPointsEdgesRooms;
}) {
  const {
    id,
    points,
    edges,
    rooms,
    reset,
    edit,
    setEdit,
    initData,
    deletedPointIds,
    deletedRoomIds,
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
  }, [data, edit]);

  return (
    <Button onClick={() => setEdit()}>
      {edit ? "Exit Editing Mode" : "Edit"}
    </Button>
  );
}
