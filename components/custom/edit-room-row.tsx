"use client";
import { useFloorStore } from "@/lib/zus-store";
import { Room } from "@/prisma/generated/prisma";
import { Minus } from "lucide-react";
import { ChangeEvent } from "react";
import { useShallow } from "zustand/shallow";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

type Props = {
  data: Room;
};

export default function EditRoomRow({ data }: Props) {
  const updateRoom = useFloorStore(useShallow((state) => state.updateRoom));
  const deleteRoom = useFloorStore(useShallow((state) => state.deleteRoom));

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.currentTarget.value;
    const id = e.currentTarget.id;

    if (id === "name") {
      updateRoom({ ...data, name: newValue });
    }
  };

  return (
    <tr className="[&>td]:px-1 [&>td:first-child]:pl-0 [&>td:last-child]:pr-0 text-sm">
      <td>
        <Input
          id={"name"}
          value={data.name}
          onChange={handleInputChange}
          className="w-[100px]"
        />
      </td>
      <td>
        <Button
          variant={"destructive"}
          size={"icon"}
          onClick={() => deleteRoom(data.id)}
        >
          <Minus />
        </Button>
      </td>
    </tr>
  );
}
