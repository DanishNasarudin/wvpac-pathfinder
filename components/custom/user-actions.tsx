"use client";
import { createURL } from "@/lib/utils";
import { useFloorStore, useUserStore } from "@/lib/zus-store";
import { Prisma } from "@/prisma/generated/prisma";
import { Share } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useCopyToClipboard } from "usehooks-ts";
import { Button } from "../ui/button";
import DropdownSearch from "./dropdown-search";

type FloorWithPointIds = Prisma.FloorGetPayload<{
  include: {
    rooms: {
      select: {
        id: true;
      };
    };
  };
}>;

type Props = {
  allPoints: { id: string; name: string }[];
  floors: FloorWithPointIds[];
  floorLevel: number;
};

export default function UserActions({ allPoints, floors, floorLevel }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [start, setStart] = useState(() => searchParams.get("start") ?? "");
  const [end, setEnd] = useState(() => searchParams.get("end") ?? "");
  const [floor, setFloor] = useState(String(floorLevel) ?? "");

  const setSearchParams = new URLSearchParams(searchParams);
  const [_, copy] = useCopyToClipboard();

  const { setEdit } = useFloorStore();
  const { setFromId, setToId } = useUserStore();

  let fullUrl = "";

  if (typeof window !== "undefined") {
    fullUrl = `${window.location.protocol}//${window.location.host}`;
  }

  const startFloorNum = useMemo(() => {
    const startFloor = floors.find((i) =>
      i.rooms.some((p) => p.id === Number(start))
    );

    return startFloor ? startFloor.level : null;
  }, [start, floors]);

  const endFloorNum = useMemo(() => {
    const endFloor = floors.find((i) =>
      i.rooms.some((p) => p.id === Number(end))
    );
    return endFloor ? endFloor.level : null;
  }, [end, floors]);

  const urlToCopy = useMemo(
    () => createURL(`${fullUrl}${pathname}`, setSearchParams),
    [fullUrl, pathname, setSearchParams]
  );

  const handleChangeValue = (newValue: string, id: string) => {
    switch (id) {
      case "start": {
        setStart(newValue);
        setFromId(Number(newValue));
        break;
      }
      case "end": {
        setEnd(newValue);
        setToId(Number(newValue));
        break;
      }
      case "floor":
        setFloor(newValue);
        setEdit(false);
        break;
      default:
        throw new Error("Invalid ID.");
    }
  };

  useEffect(() => {
    const params = new URLSearchParams();
    if (start) params.set("start", start);
    if (end) params.set("end", end);

    const newUrl = createURL(pathname, params);
    window.history.replaceState(null, "", newUrl);
  }, [pathname, start, end]);

  useEffect(() => {
    if (!floor) return;
    const params = new URLSearchParams(window.location.search);

    const newUrl = createURL(`/${floor}`, params);
    router.push(newUrl);
  }, [floor, pathname, router]);

  useEffect(() => {
    if (start) setFromId(Number(start));
  }, [start]);

  useEffect(() => {
    if (end) setToId(Number(end));
  }, [end]);

  return (
    <div className="flex-1 grid grid-cols-4">
      <div className="col-span-1 flex flex-col gap-2 text-xs text-foreground/80">
        <div className="h-9 flex items-center">From</div>
        <div className="h-9 flex items-center">To</div>
        <div></div>
      </div>
      <div className="col-span-3 flex flex-col gap-2 w-full">
        <DropdownSearch
          id="start"
          lists={allPoints}
          onValueChange={handleChangeValue}
          valueInput={start || ""}
          placeholder="Select starting.."
        />
        <DropdownSearch
          id="end"
          lists={allPoints}
          onValueChange={handleChangeValue}
          valueInput={end || ""}
          placeholder="Select destination.."
        />
        <DropdownSearch
          id="floor"
          lists={floors.map((i) => ({ id: String(i.level), name: i.name }))}
          onValueChange={handleChangeValue}
          valueInput={floor || "1"}
          isStart={`${startFloorNum}`}
          isEnd={`${endFloorNum}`}
          noSearch
        />
        <div className="flex gap-2">
          <Button
            disabled={start === end}
            onClick={() => {
              copy(urlToCopy);
              toast.success("Copied link!");
            }}
            variant={"outline"}
            size={"sm"}
          >
            Share <Share />
          </Button>
        </div>
      </div>
    </div>
  );
}
