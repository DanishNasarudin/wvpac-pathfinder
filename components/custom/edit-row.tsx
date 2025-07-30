"use client";

import { useFloorStore } from "@/lib/zus-store";
import { Point } from "@/prisma/generated/prisma";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  MinusIcon,
} from "lucide-react";
import { ChangeEvent } from "react";
import { useShallow } from "zustand/shallow";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import DropdownSearch from "./dropdown-search";

export default function EditRow({ data }: { data: Point }) {
  const initType: string[] = [];
  if (initType.length === 0) {
    initType.push(data.type);
    if (data.type === "point") {
      initType.push("junction");
    } else {
      initType.push("point");
    }
  }

  const updatePoint = useFloorStore(useShallow((state) => state.updatePoint));
  const deletePoint = useFloorStore(useShallow((state) => state.deletePoint));
  const edges = useFloorStore(useShallow((state) => state.edges));
  const updateEdge = useFloorStore(useShallow((state) => state.updateEdge));

  if (data.id === -1) return <></>;

  const handleTypeChange = (newValue: string, id: string) => {
    updatePoint({ ...data, type: newValue as "point" | "junction" });
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.currentTarget.value;
    const id = e.currentTarget.id;

    if (id === "name") {
      updatePoint({ ...data, name: newValue });
      const edgeFromChange = edges.find((item) => item.fromId === data.id);
      const edgeToChange = edges.find((item) => item.toId === data.id);
      if (edgeFromChange !== undefined) {
        updateEdge({ ...edgeFromChange, from: { name: newValue } });
      }
      if (edgeToChange !== undefined) {
        updateEdge({ ...edgeToChange, to: { name: newValue } });
      }
    } else if (id === "posX") {
      updatePoint({ ...data, x: Number(newValue) });
    } else if (id === "posY") {
      updatePoint({ ...data, y: Number(newValue) });
    }
  };

  return (
    <tr className="[&>td]:px-1 [&>td:first-child]:pl-0 [&>td:last-child]:pr-0 text-sm">
      <td>
        <DropdownSearch
          id="type"
          lists={initType}
          valueInput={data.type}
          onValueChange={handleTypeChange}
          width="w-[150px]"
        />
      </td>
      <td>
        <Input
          id={"name"}
          value={data.name}
          onChange={handleInputChange}
          className="w-[100px]"
        />
      </td>
      <td className="grid grid-flow-col items-center">
        posX:{" "}
        <Input
          id={"posX"}
          value={data.x}
          onChange={handleInputChange}
          className="w-[100px]"
        />
        <Button
          size={"icon"}
          variant={"outline"}
          onClick={() => updatePoint({ ...data, x: data.x - 1 })}
        >
          <ChevronLeftIcon />
        </Button>
        <Button
          size={"icon"}
          variant={"outline"}
          onClick={() => updatePoint({ ...data, x: data.x + 1 })}
        >
          <ChevronRightIcon />
        </Button>
      </td>
      <td className="grid grid-flow-col items-center">
        posY:{" "}
        <Input
          id={"posY"}
          value={data.y}
          onChange={handleInputChange}
          className="w-[100px]"
        />
        <Button
          size={"icon"}
          variant={"outline"}
          onClick={() => updatePoint({ ...data, y: data.y + 1 })}
        >
          <ChevronDownIcon />
        </Button>
        <Button
          size={"icon"}
          variant={"outline"}
          onClick={() => updatePoint({ ...data, y: data.y - 1 })}
        >
          <ChevronUpIcon />
        </Button>
      </td>
      <td>
        <Button
          variant={"destructive"}
          size={"icon"}
          onClick={() => deletePoint(data.id)}
        >
          <MinusIcon />
        </Button>
      </td>
    </tr>
  );
}
