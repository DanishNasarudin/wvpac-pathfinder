"use client";
import { createURL } from "@/lib/utils";
import { useFloorStore } from "@/lib/zus-store";
import { Floor } from "@/prisma/generated/prisma";
import { Share } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useCopyToClipboard } from "usehooks-ts";
import { Button } from "../ui/button";
import DropdownSearch from "./dropdown-search";

type Props = {
  allPoints: { id: string; name: string }[];
  floors: Floor[];
};

export default function UserActions({ allPoints, floors }: Props) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [floor, setFloor] = useState("");

  const isProduction = process.env.NODE_ENV === "production";

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const setSearchParams = new URLSearchParams(searchParams);
  const [_, copy] = useCopyToClipboard();

  let fullUrl = "";

  if (typeof window !== "undefined") {
    fullUrl = `${window.location.protocol}//${window.location.host}`;
  }

  useEffect(() => {
    if (start) {
      setSearchParams.set("start", start);
    } else {
      setSearchParams.delete("start");
    }
    if (end) {
      setSearchParams.set("end", end);
    } else {
      setSearchParams.delete("end");
    }
    if (floor) {
      setSearchParams.set("f", floor);
    } else {
      setSearchParams.delete("f");
    }

    const setURL = createURL(`${pathname}/`, setSearchParams);
    router.push(setURL);
  }, [pathname, searchParams, start, end, floor]);

  useEffect(() => {
    const paramStart = setSearchParams.get("start");
    const paramEnd = setSearchParams.get("end");
    const paramFloor = setSearchParams.get("floor");

    if (!paramStart || !paramEnd || !paramFloor) return;

    setStart(paramStart);
    setEnd(paramEnd);
    setFloor(paramFloor);
  }, [setSearchParams]);

  const { id, points, edges, setEdit } = useFloorStore();

  const handleChangeValue = (newValue: string, id: string) => {
    switch (id) {
      case "start": {
        setStart(newValue);
        const startFloor = newValue.match(/(?<=-)\d+(?=-)/);

        if (startFloor) {
          setFloor(`Floor ${parseInt(startFloor[0], 10)}`);
        }
        break;
      }
      case "end": {
        setEnd(newValue);
        const startFloor = start.match(/(?<=-)\d+(?=-)/);

        if (startFloor) {
          setFloor(`Floor ${parseInt(startFloor[0], 10)}`);
        }
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

  const startFloorNum = useMemo(() => {
    const startFloor = start.match(/(?<=-)\d+(?=-)/);

    return startFloor ? parseInt(startFloor[0], 10) : null;
  }, [start]);

  const endFloorNum = useMemo(() => {
    const endFloor = end.match(/(?<=-)\d+(?=-)/);
    return endFloor ? parseInt(endFloor[0], 10) : null;
  }, [end]);

  const [qrDialog, setQrDialog] = useState(false);
  const [qrError, setQrError] = useState(false);

  const urlToCopy = useMemo(
    () => createURL(`${fullUrl}${pathname}`, setSearchParams),
    [fullUrl, pathname, setSearchParams]
  );

  return (
    <div className="flex gap-2">
      <div className="flex-1/2 flex flex-col gap-2 text-xs text-foreground/80">
        <div className="h-9 flex items-center">From</div>
        <div className="h-9 flex items-center">To</div>
        <div></div>
      </div>
      <div className="flex-1 flex flex-col gap-2">
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
          lists={floors.map((i) => ({ id: String(i.id), name: i.name }))}
          onValueChange={handleChangeValue}
          valueInput={floor || "1"}
          isStart={startFloorNum ? `Floor ${startFloorNum}` : ""}
          isEnd={endFloorNum ? `Floor ${endFloorNum}` : ""}
          noSearch
        />
        <div className="flex gap-2">
          <Button
            disabled={start === end}
            onClick={() => {
              copy(urlToCopy);
              toast.success("Copied link!");
            }}
          >
            Share <Share />
          </Button>
        </div>
      </div>
    </div>
  );
}
