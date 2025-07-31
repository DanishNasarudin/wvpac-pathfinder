import EditButton from "@/components/custom/edit-button";
import EditPanel from "@/components/custom/edit-panel";
import MapRender from "@/components/custom/map";
import SvgRegistryInput from "@/components/custom/svg-registry-input";
import SvgRegistryList from "@/components/custom/svg-registry-list";
import UserActions from "@/components/custom/user-actions";
import prisma from "@/lib/prisma";
import { getFloorById, getInterFloorEdges } from "@/services/actions";
import { Suspense } from "react";

const production = process.env.NODE_ENV === "production";

export async function generateStaticParams() {
  const floors = await prisma.floor.findMany({
    select: {
      id: true,
    },
  });

  return floors.map((item) => ({
    floorId: String(item.id),
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
  });
  const allRooms = await prisma.room.findMany();
  const allPoints = await prisma.point.findMany({
    where: {
      type: "point",
    },
  });
  const allPointsWithJunction = await prisma.point.findMany();
  const allEdges = await prisma.edge.findMany();

  const { result: floor } = await getFloorById({ id: Number(floorId) || 1 });

  const { result: interFloorEdges } = await getInterFloorEdges();

  return (
    <div className="flex-1 w-full relative">
      <div className="h-[50vh] bg-zinc-500 overflow-clip flex justify-center items-center">
        {floor ? (
          <MapRender
            allEdges={allEdges}
            allPoints={allPointsWithJunction}
            currentFloorPoints={floor.points || []}
            data={floor}
          />
        ) : (
          "Map"
        )}
      </div>
      <div className="w-max mx-auto p-4">
        <div>
          <p>Public</p>
          <Suspense>
            <UserActions
              allPoints={allRooms.map((p) => ({
                id: String(p.id),
                name: p.name,
              }))}
              floors={svgList}
              floorId={Number(floorId)}
            />
          </Suspense>
        </div>
        {!production && (
          <div>
            <p>Admin Actions</p>
            <EditPanel />
            {floor && interFloorEdges && (
              <EditButton
                isProduction={production}
                data={floor}
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
