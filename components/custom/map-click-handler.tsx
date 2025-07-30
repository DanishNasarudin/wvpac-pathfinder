"use client";
import { round } from "@/lib/utils";
import { useFloorStore } from "@/lib/zus-store";
import { LeafletMouseEvent } from "leaflet";
import { useMapEvents } from "react-leaflet";
import { useShallow } from "zustand/shallow";

export default function MapClickHandler({ mapHeight }: { mapHeight?: number }) {
  const { id, points, pendingAdd, junctionAdd, floorNum, edit } =
    useFloorStore();
  const addPoints = useFloorStore(useShallow((state) => state.addPoint));

  const handleClick = async (x: number, y: number) => {
    if (pendingAdd)
      if (junctionAdd) {
        const juncNum = points
          .filter((item) => item.type === "junction")
          .at(-1)
          ?.name.match(/J(\d+)/);

        const numberAfterJ = juncNum ? parseInt(juncNum[1], 10) + 1 : 1;

        addPoints({
          id: -1,
          type: "junction",
          name: `0${floorNum}-J${numberAfterJ}`,
          x: round(x, 0),
          y: round((mapHeight || 1000) - y, 0),
          floorId: id,
          roomId: null,
        });
      } else {
        addPoints({
          id: -1,
          type: "point",
          name: "",
          x: round(x, 0),
          y: round((mapHeight || 1000) - y, 0),
          floorId: id,
          roomId: null,
        });
      }
  };

  useMapEvents({
    click(e: LeafletMouseEvent) {
      const x = e.latlng.lng;
      const y = e.latlng.lat;
      if (edit) handleClick(x, y);
      // console.log("Clicked at overlay coords:", { x, y });
    },
  });
  return null;
}
