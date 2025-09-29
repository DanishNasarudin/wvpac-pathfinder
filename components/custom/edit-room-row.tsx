"use client";
import { useFloorStore } from "@/lib/zus-store";
import { Room, RoomGroup } from "@/prisma/generated/prisma";
import { Minus } from "lucide-react";
import { ChangeEvent, useMemo } from "react";
import { useShallow } from "zustand/shallow";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import DropdownSearch from "./dropdown-search";

type Props = {
  data: Room;
  options?: RoomGroup[];
};

export default function EditRoomRow({ data, options = [] }: Props) {
  const initRoomGroup: { id: string; name: string }[] = [];

  const initRoomGroupValue = useMemo(
    () =>
      options
        .map((i) => ({ id: String(i.id), name: i.name }))
        .find((o) => o.id === String(data.groupId)) || undefined,
    [options, data.groupId]
  );

  if (initRoomGroup.length === 0 && options) {
    if (initRoomGroupValue) {
      initRoomGroup.push(initRoomGroupValue);
      for (let i in options) {
        if (options[i].name !== initRoomGroupValue.name)
          initRoomGroup.push({
            id: String(options[i].id),
            name: options[i].name,
          });
      }
    } else {
      for (let i in options) {
        initRoomGroup.push({
          id: String(options[i].id),
          name: options[i].name,
        });
      }
    }
  }

  const updateRoomGroup = useFloorStore(
    useShallow((state) => state.updateRoomGroup)
  );
  const updateRoom = useFloorStore(useShallow((state) => state.updateRoom));
  const deleteRoom = useFloorStore(useShallow((state) => state.deleteRoom));

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.currentTarget.value;
    const id = e.currentTarget.id;

    if (id === "name") {
      updateRoom({ ...data, name: newValue });
    }
  };

  const handleDropdownChange = (newValue: string, id: string) => {
    if (id === "group") {
      updateRoom({
        ...data,
        groupId: newValue !== "null" ? Number(newValue) : null,
      });
    }
  };

  console.log(initRoomGroup);

  return (
    <tr className="[&>td]:px-1 [&>td:first-child]:pl-0 [&>td:last-child]:pr-0 text-sm">
      <td>
        <Input
          id={"name"}
          value={data.name}
          onChange={handleInputChange}
          className="w-[200px]"
        />
      </td>
      <td>
        <DropdownSearch
          id="group"
          lists={initRoomGroup}
          valueInput={initRoomGroupValue ? initRoomGroupValue.id : undefined}
          onValueChange={handleDropdownChange}
          placeholder="Select group.."
          width="w-[150px]"
          allowDeselect
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
