"use client";
import { useFloorStore } from "@/lib/zus-store";
import { useState } from "react";
import { useShallow } from "zustand/shallow";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import EditEdgeRow from "./edit-edge-row";
import EditInterRow from "./edit-inter-row";
import EditRoomRow from "./edit-room-row";
import EditRow from "./edit-row";

export default function EditPanel() {
  const floorId = useFloorStore(useShallow((state) => state.id));
  const points = useFloorStore(useShallow((state) => state.points));
  const edges = useFloorStore(useShallow((state) => state.edges));
  const rooms = useFloorStore(useShallow((state) => state.rooms));
  const groups = useFloorStore(useShallow((state) => state.groups));
  const interFloor = useFloorStore(useShallow((state) => state.interFloor));
  const interFloorPoints = useFloorStore(
    useShallow((state) => state.interFloorPoints)
  );
  const triggerAddPoint = useFloorStore(
    useShallow((state) => state.triggerAddPoint)
  );
  const triggerAddJunction = useFloorStore(
    useShallow((state) => state.triggerAddJunction)
  );
  const addInterFloor = useFloorStore(
    useShallow((state) => state.addInterFloor)
  );
  const addRoom = useFloorStore(useShallow((state) => state.addRoom));
  const addRoomGroup = useFloorStore(useShallow((state) => state.addRoomGroup));
  const addEdge = useFloorStore(useShallow((state) => state.addEdge));
  const pendingAdd = useFloorStore(useShallow((state) => state.pendingAdd));
  const junctionAdd = useFloorStore(useShallow((state) => state.junctionAdd));
  const edit = useFloorStore(useShallow((state) => state.edit));

  const [search, setSearch] = useState("");

  if (!edit) return null;

  return (
    <div className="absolute top-2 left-2 py-2 bg-zinc-800/50 z-[10] rounded-md backdrop-blur-[5px]">
      <Tabs defaultValue="points">
        <TabsList className="mx-2 mb-2">
          <TabsTrigger value="points">Points</TabsTrigger>
          <TabsTrigger value="edges">Edges</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="interfloor">InterFloor</TabsTrigger>
        </TabsList>
        <TabsContent value="points" className="flex flex-col gap-2">
          <ScrollArea className="h-[400px] px-2">
            <table>
              <tbody>
                {points
                  .toSorted((a, b) => b.id - a.id)
                  .filter((point) =>
                    search
                      ? point.name.toLowerCase().includes(search.toLowerCase())
                      : true
                  )
                  .map((point) => (
                    <EditRow key={point.id} data={point} options={rooms} />
                  ))}
              </tbody>
            </table>
          </ScrollArea>
          <div className="px-2 grid grid-flow-row gap-1">
            <Input
              value={search}
              placeholder="Search Name"
              onChange={(e) => setSearch(e.currentTarget.value)}
            />
            <Button
              className="w-full"
              variant={"outline"}
              onClick={() => triggerAddPoint()}
              disabled={pendingAdd}
            >
              + Add Point
            </Button>
            <Button
              className="w-full"
              variant={"outline"}
              onClick={() => triggerAddJunction()}
            >
              {!junctionAdd
                ? "Adding point as Point"
                : "Adding point as Junction"}
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="edges" className="flex flex-col gap-2">
          <ScrollArea className="h-[400px] px-2">
            <table>
              <tbody>
                {edges
                  .toSorted((a, b) => b.id - a.id)
                  .filter((edge) =>
                    search
                      ? edge.from.name
                          .toLowerCase()
                          .includes(search.toLowerCase()) ||
                        edge.to.name
                          .toLowerCase()
                          .includes(search.toLowerCase())
                      : true
                  )
                  .map((edge) => (
                    <EditEdgeRow key={edge.id} data={edge} options={points} />
                  ))}
              </tbody>
            </table>
          </ScrollArea>
          <div className="px-2 grid grid-flow-row gap-1">
            <Input
              value={search}
              placeholder="Search Name"
              onChange={(e) => setSearch(e.currentTarget.value)}
            />
            <Button
              className="w-full"
              variant={"outline"}
              onClick={() =>
                addEdge({
                  id: -1,
                  floorId,
                  from: { name: points[0].name },
                  to: { name: points[1].name },
                  fromId: points[0].id,
                  toId: points[1].id,
                })
              }
            >
              + Add Edge
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="rooms">
          <ScrollArea className="h-[400px] px-2">
            <table>
              <tbody>
                {rooms
                  .toSorted((a, b) => b.id - a.id)
                  .filter((point) =>
                    search
                      ? point.name.toLowerCase().includes(search.toLowerCase())
                      : true
                  )
                  .map((point) => (
                    <EditRoomRow key={point.id} data={point} />
                  ))}
              </tbody>
            </table>
          </ScrollArea>
          <div className="px-2 grid grid-flow-row gap-1">
            <Input
              value={search}
              placeholder="Search Name"
              onChange={(e) => setSearch(e.currentTarget.value)}
            />
            <Button
              className="w-full"
              variant={"outline"}
              onClick={() =>
                addRoom({
                  name: "enter room name",
                  id: -1,
                  floorId,
                  groupId: null,
                })
              }
            >
              + Add Room
            </Button>
          </div>
        </TabsContent>
        {/* <TabsContent value="groups">
          <ScrollArea className="h-[400px] px-2">
            <table>
              <tbody>
                {groups
                  .toSorted((a, b) => b.id - a.id)
                  .filter((point) =>
                    search
                      ? point.name.toLowerCase().includes(search.toLowerCase())
                      : true
                  )
                  .map((point) => (
                    <EditRoomRow key={point.id} data={point} />
                  ))}
              </tbody>
            </table>
          </ScrollArea>
          <div className="px-2 grid grid-flow-row gap-1">
            <Input
              value={search}
              placeholder="Search Name"
              onChange={(e) => setSearch(e.currentTarget.value)}
            />
            <Button
              className="w-full"
              variant={"outline"}
              onClick={() =>
                addRoomGroup({
                  name: "enter room name",
                  id: -1,
                  floorId,
                  groupId: null,
                })
              }
            >
              + Add Room
            </Button>
          </div>
        </TabsContent> */}
        <TabsContent value="interfloor">
          <ScrollArea className="h-[400px] px-2">
            <table>
              <tbody>
                {interFloor
                  .toSorted((a, b) => b.id - a.id)
                  .filter((edge) =>
                    search
                      ? edge.from.name
                          .toLowerCase()
                          .includes(search.toLowerCase()) ||
                        edge.to.name
                          .toLowerCase()
                          .includes(search.toLowerCase())
                      : true
                  )
                  .map((edge) => (
                    <EditInterRow
                      key={edge.id}
                      data={edge}
                      options={interFloorPoints}
                    />
                  ))}
              </tbody>
            </table>
          </ScrollArea>
          <div className="px-2 grid grid-flow-row gap-1">
            <Input
              value={search}
              placeholder="Search Name"
              onChange={(e) => setSearch(e.currentTarget.value)}
            />
            <Button
              className="w-full"
              variant={"outline"}
              onClick={() =>
                addInterFloor({
                  id: -1,
                  floorId,
                  from: { name: interFloorPoints[0].name },
                  to: { name: interFloorPoints[1].name },
                  fromId: interFloorPoints[0].id,
                  toId: interFloorPoints[1].id,
                })
              }
            >
              + Add Edge
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
