import EditButton from "@/components/custom/edit-button";
import EditPanel from "@/components/custom/edit-panel";
import LocationSelector from "@/components/custom/location-selector";
import MapRender from "@/components/custom/map";
import SvgRegistryInput from "@/components/custom/svg-registry-input";
import SvgRegistryList from "@/components/custom/svg-registry-list";
import UserActions from "@/components/custom/user-actions";
import prisma from "@/lib/prisma";
import { cn } from "@/lib/utils";
import {
  getFloorByLevel,
  getGroupsWithRooms,
  getInterFloorEdges,
} from "@/services/actions";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

const production = process.env.NODE_ENV === "production";

export async function generateStaticParams() {
  const floors = await prisma.floor.findMany({
    select: {
      id: true,
      level: true,
    },
  });

  return floors.map((item) => ({
    floorId: String(item.level),
  }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ floorId: string }>;
}) {
  const { floorId } = await params;
  const svgList = await prisma.floor.findMany({
    include: {
      rooms: {
        select: {
          id: true,
        },
      },
    },
    where: {
      active: true,
    },
  });
  const allRooms = await prisma.room.findMany({
    where: {
      floor: {
        active: true,
      },
    },
  });
  const allPoints = await prisma.point.findMany({
    where: {
      type: "point",
      floor: {
        active: true,
      },
    },
  });
  const allPointsWithJunction = await prisma.point.findMany({
    where: {
      floor: {
        active: true,
      },
    },
  });
  const allEdges = await prisma.edge.findMany({});

  const { result: floor } = await getFloorByLevel({
    level: Number(floorId) || 1,
  });

  const { result: interFloorEdges } = await getInterFloorEdges();

  const roomGroups = await prisma.roomGroup.findMany();
  const groups = await getGroupsWithRooms();

  const DEV_MODE = false;

  return (
    <div className="flex-1 w-full relative">
      <LocationSelector
        className={cn(DEV_MODE ? "hidden" : "")}
        groups={groups}
      />
      <div
        className={cn(
          "h-[60vh] bg-zinc-500 overflow-clip flex justify-center items-center border border-b-1",
          DEV_MODE ? "" : "h-[100vh]"
        )}
      >
        {floor ? (
          <MapRender
            allEdges={allEdges}
            allPoints={allPointsWithJunction}
            currentFloorPoints={floor.points || []}
            data={floor}
          />
        ) : (
          <Loader2 className="animate-spin text-white" />
        )}
      </div>
      <div
        className={cn(
          "max-w-[400px] w-full mx-auto p-4 space-y-2",
          DEV_MODE ? "" : "hidden"
        )}
      >
        <Suspense>
          <UserActions
            allPoints={allRooms.map((p) => ({
              id: String(p.id),
              name: p.name,
            }))}
            floors={svgList}
            floorLevel={Number(floorId)}
          />
        </Suspense>
        {!production && (
          <div>
            <p>Admin Actions</p>
            <EditPanel />
            {floor && interFloorEdges && (
              <EditButton
                isProduction={production}
                data={{ ...floor, roomGroups: roomGroups }}
                interFloorEdges={interFloorEdges}
                interFloorPoints={allPoints}
              />
            )}
            <div className="flex flex-col gap-2">
              <p>SVG Registry</p>
              <SvgRegistryInput />
              {svgList.length > 0 ? (
                svgList.map((l, idx) => <SvgRegistryList key={idx} data={l} />)
              ) : (
                <p>None registered</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
