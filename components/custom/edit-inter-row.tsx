"use client";
import { useFloorStore } from "@/lib/zus-store";
import { Point } from "@/prisma/generated/prisma";
import { EdgeWithName } from "@/services/actions";
import { MinusIcon } from "lucide-react";
import { useShallow } from "zustand/shallow";
import { Button } from "../ui/button";
import DropdownSearch from "./dropdown-search";

type Props = {
  data?: EdgeWithName;
  options?: Point[];
};

export default function EditInterRow({
  data = {
    id: -1,
    from: { name: "default_from" },
    to: { name: "default_to" },
    fromId: -1,
    toId: -1,
    floorId: -1,
  },
  options = [],
}: Props) {
  if (data.id === -1) return <></>;

  const deleteInterFloor = useFloorStore(
    useShallow((state) => state.deleteInterFloor)
  );
  const updateInterFloor = useFloorStore(
    useShallow((state) => state.updateInterFloor)
  );

  const initFrom: string[] = [];
  const initTo: string[] = [];

  if (initFrom.length === 0) {
    initFrom.push(data.from.name);

    for (let i in options) {
      if (options[i].name !== data.from.name) initFrom.push(options[i].name);
    }
  }

  if (initTo.length === 0) {
    initTo.push(data.to.name);

    for (let i in options) {
      if (options[i].name !== data.to.name) initTo.push(options[i].name);
    }
  }

  const handleValueChange = (newValue: string, id: string) => {
    if (id === "from") {
      updateInterFloor({
        ...data,
        from: { name: newValue },
        fromId: options.find((item) => item.name === newValue)?.id || -1,
      });
    }

    if (id === "to") {
      updateInterFloor({
        ...data,
        to: { name: newValue },
        toId: options.find((item) => item.name === newValue)?.id || -1,
      });
    }
  };

  return (
    <tr className="[&>td]:px-1 [&>td:first-child]:pl-0 [&>td:last-child]:pr-0">
      <td>
        <DropdownSearch
          id={"from"}
          lists={initFrom}
          valueInput={data.from.name}
          onValueChange={handleValueChange}
          width="w-[150px]"
        />
      </td>
      <td>
        <DropdownSearch
          id={"to"}
          lists={initTo}
          valueInput={data.to.name}
          onValueChange={handleValueChange}
          width="w-[150px]"
        />
      </td>
      <td>
        <Button
          variant={"destructive"}
          size={"icon"}
          onClick={() => deleteInterFloor(data.id)}
        >
          <MinusIcon />
        </Button>
      </td>
    </tr>
  );
}
