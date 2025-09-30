"use client";

import { cn, createURL } from "@/lib/utils";
import { useUserStore } from "@/lib/zus-store";
import { RoomGroupWithRoom } from "@/services/actions";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  ArrowUpDown,
  ChevronLeft,
  EllipsisVertical,
  LucideChevronsDown,
  MapPin,
  NotebookPen,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

export default function LocationSelector({
  className,
  groups = [],
}: {
  className?: string;
  groups?: RoomGroupWithRoom[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setFromId, setToId } = useUserStore();

  const [direction, setDirection] = useState<"start" | "end">("start");
  const searchInput = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState<string>("");
  const [openItem, setOpenItem] = useState<string | undefined>(undefined);

  const [start, setStart] = useState<string>(
    () => searchParams.get("start") ?? ""
  );
  const [end, setEnd] = useState<string>(() => searchParams.get("end") ?? "");

  const [startFloor, setStartFloor] = useState<string>(
    () => searchParams.get("startf") ?? ""
  );
  const [endFloor, setEndFloor] = useState<string>(
    () => searchParams.get("endf") ?? ""
  );

  const currentFloorFromPath = useMemo(() => {
    const seg = pathname?.split("/").filter(Boolean)[0];
    const n = Number(seg);
    return Number.isFinite(n) && n > 0 ? n : 1;
  }, [pathname]);

  const [tabValue, setTabValue] = useState<string>(
    `floor-${currentFloorFromPath}`
  );

  const replaceParams = (
    updates: Record<string, string | null | undefined>
  ) => {
    let path = pathname;
    const params = new URLSearchParams(searchParams);
    for (const [k, v] of Object.entries(updates)) {
      if (k === "startf" && v) path = `/${v}`;
      if (v && v.length > 0) params.set(k, v);
      else params.delete(k);
    }
    const newUrl = createURL(path, params);
    router.replace(newUrl);
  };

  const replaceParam = (key: "start" | "end", value: string | null) =>
    replaceParams({ [key]: value });

  const handleSelectRoom = (roomId: number) => {
    const val = String(roomId);
    const floorId = groups
      .flatMap((i) => i.rooms.find((r) => r.id === roomId)?.floor.level)
      .filter((i) => i);
    const floorStr = String(floorId[0]);

    if (direction === "start") {
      setStart(val);
      setStartFloor(floorStr);
      replaceParams({ start: val, startf: floorStr });
      setFromId(Number(val));
    } else {
      setEnd(val);
      setEndFloor(floorStr);
      replaceParams({ end: val, endf: floorStr });
      setToId(Number(val));
    }
  };

  const handleSwap = () => {
    const params = new URLSearchParams(searchParams);
    const s = params.get("start");
    const e = params.get("end");
    const sf = params.get("startf");
    const ef = params.get("endf");

    const updates: Record<string, string | null> = {
      start: e,
      end: s,
      startf: ef,
      endf: sf,
    };

    replaceParams(updates);

    setStart(e ?? "");
    if (e) setFromId(Number(e));
    setStartFloor(ef ?? "");

    setEnd(s ?? "");
    if (s) setToId(Number(s));
    setEndFloor(sf ?? "");
  };

  const roomNameById = (idStr: string | null): string | undefined => {
    if (!idStr) return undefined;
    const id = Number(idStr);
    for (const g of groups) {
      const r = g.rooms.find((x) => x.id === id);
      if (r) return r.name;
    }
    return undefined;
  };

  const pushFloor = useCallback(
    (level: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (start && startFloor && !params.has("startf"))
        params.set("startf", startFloor);
      if (end && endFloor && !params.has("endf")) params.set("endf", endFloor);

      router.push(createURL(`/${level}`, params));
    },
    [searchParams, router, endFloor, startFloor, start]
  );

  const handleTabChange = (val: string) => {
    setTabValue(val);
    const level = Number(val.replace("floor-", "")) || 1;
    pushFloor(level);
  };

  const norm = (s: string) => s.toLowerCase();

  const startLabel = roomNameById(start) ?? "Your location";
  const endLabel = roomNameById(end) ?? "Destination";

  useEffect(() => {
    setTabValue(`floor-${currentFloorFromPath}`);
  }, [currentFloorFromPath]);

  // Keep local state in sync when the URL changes (e.g., back/forward)
  useEffect(() => {
    setStart(searchParams.get("start") ?? "");
    setEnd(searchParams.get("end") ?? "");
    setStartFloor(searchParams.get("startf") ?? "");
    setEndFloor(searchParams.get("endf") ?? "");
  }, [searchParams]);

  // also reflect URL→zustand on initial load / navigation
  useEffect(() => {
    const s = searchParams.get("start");
    if (s) setFromId(Number(s));
    const e = searchParams.get("end");
    if (e) setToId(Number(e));
  }, [searchParams, setFromId, setToId]);

  useEffect(() => {
    const q = norm(query.trim());
    if (!q) {
      setOpenItem(undefined); // close when empty
      return;
    }
    // find the first group that has a match and open it
    for (let i = 0; i < groups.length; i++) {
      const g = groups[i];
      if (g.rooms.some((r) => norm(r.name).includes(q))) {
        setOpenItem(String(i));
        return;
      }
    }
    setOpenItem(undefined); // no matches
  }, [query, groups]);

  const Pulse = () => (
    <span className="absolute -top-1 -right-1">
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
      </span>
    </span>
  );

  return (
    <>
      <Sheet>
        <div
          className={cn(
            "fixed top-0 left-0 m-4 p-3 pl-6 py-1 rounded-2xl shadow-2xl bg-background z-50 flex gap-2 items-center w-full max-w-[calc(100vw-32px)] border border-border",
            className
          )}
        >
          <div className="flex flex-col items-center gap-1.5">
            <div className="size-5 rounded-full bg-green-500/30 flex justify-center items-center">
              <div className="size-2 rounded-full bg-green-500 outline-background outline-2"></div>
            </div>
            <EllipsisVertical
              strokeWidth={2}
              className="stroke-foreground/60"
            />
            <MapPin size={20} className="stroke-red-700" />
          </div>
          <div className="w-full">
            <SheetTrigger asChild>
              <Button
                variant={"ghost"}
                size={"text"}
                className="w-full justify-start hover:bg-transparent text-green-600"
                onClick={() => {
                  setDirection("start");
                }}
              >
                <p className="truncate w-[calc(100vw-150px)] text-left">
                  {startLabel}
                </p>
              </Button>
            </SheetTrigger>
            <Separator />
            <SheetTrigger asChild>
              <Button
                variant={"ghost"}
                size={"text"}
                className="w-full justify-start pt-3.5 hover:bg-transparent"
                onClick={() => {
                  setDirection("end");
                }}
              >
                <p className="truncate w-[calc(100vw-150px)] text-left">
                  {endLabel}
                </p>
              </Button>
            </SheetTrigger>
          </div>
          <div>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleSwap}
              disabled={!start && !end}
              title="Swap start and destination"
            >
              <ArrowUpDown />
            </Button>
          </div>
          <Tabs value={tabValue} onValueChange={handleTabChange}>
            <TabsList className="absolute bottom-0 translate-y-[calc(100%+12px)] left-1/2 -translate-x-1/2 bg-background shadow-md border border-border w-full">
              <TabsTrigger
                value="floor-1"
                className="relative data-[state=active]:bg-green-100"
              >
                Floor 1{Number(endFloor) === 1 && <Pulse />}
              </TabsTrigger>
              <TabsTrigger
                value="floor-2"
                className="relative data-[state=active]:bg-green-100"
              >
                Floor 2{Number(endFloor) === 2 && <Pulse />}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <SheetContent
          className="w-full"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            searchInput.current?.focus({ preventScroll: true });
          }}
        >
          <VisuallyHidden>
            <SheetHeader>
              <SheetTitle></SheetTitle>
              <SheetDescription></SheetDescription>
            </SheetHeader>
          </VisuallyHidden>
          <div className="p-3 pt-8">
            <div className="relative">
              <SheetClose asChild>
                <Button
                  variant={"ghost"}
                  size={"icon"}
                  className="absolute left-0 top-1/2 -translate-y-1/2 hover:bg-transparent"
                >
                  <ChevronLeft strokeWidth={2} className="size-7" />
                </Button>
              </SheetClose>
              <Input
                ref={searchInput}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  direction === "start"
                    ? "Choose starting point"
                    : "Choose destination"
                }
                className="text-base py-6 pl-9 rounded-2xl"
              />
            </div>
            <div className="py-4">
              <SheetClose asChild>
                <Button
                  variant={"outline"}
                  className="rounded-lg"
                  onClick={() => handleSelectRoom(76)}
                >
                  <NotebookPen /> Registration Counter
                </Button>
              </SheetClose>
            </div>
            <Separator />
            <Accordion
              type="single"
              collapsible
              className="w-full"
              defaultValue="item-1"
              value={openItem}
              onValueChange={setOpenItem}
            >
              {groups.map((g, idx) => {
                const q = query.trim().toLowerCase();
                const visibleRooms = q
                  ? g.rooms.filter((r) => r.name.toLowerCase().includes(q))
                  : g.rooms;

                return (
                  <AccordionItem
                    key={idx}
                    value={String(idx)}
                    className="relative"
                  >
                    <AccordionTrigger className="px-4 data-[state=open]:text-foreground/60">
                      {g.name}
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4 text-balance max-h-[300px] overflow-y-auto">
                      {visibleRooms.map((r) => (
                        <SheetClose asChild key={r.id}>
                          <Button
                            variant="ghost"
                            className="hover:bg-transparent justify-start py-0 h-9"
                            onClick={() => handleSelectRoom(r.id)}
                          >
                            <p className="text-left truncate w-full">
                              {r.name}
                            </p>
                          </Button>
                        </SheetClose>
                      ))}

                      {visibleRooms.length === 0 && q && (
                        <div className="text-sm text-foreground/60 px-2">
                          No matches in this group.
                        </div>
                      )}
                      {visibleRooms.length > 6 && (
                        <Button
                          variant="outline"
                          size="icon-xs"
                          className="rounded-full absolute bottom-0 -translate-y-1/3 right-0 -translate-x-1/3 animate-bounce"
                          title="Scroll for more"
                        >
                          <LucideChevronsDown />
                        </Button>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
