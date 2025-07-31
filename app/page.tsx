import EditButton from "@/components/custom/edit-button";
import EditPanel from "@/components/custom/edit-panel";
import MapRender from "@/components/custom/map";
import SvgRegistryInput from "@/components/custom/svg-registry-input";
import SvgRegistryList from "@/components/custom/svg-registry-list";
import UserActions from "@/components/custom/user-actions";
import prisma from "@/lib/prisma";
import { getFloorById, getInterFloorEdges } from "@/services/actions";

const production = process.env.NODE_ENV === "production";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ f: string; start: string; end: string }>;
}) {
  const { f: floorId, start, end } = await searchParams;
  const svgList = await prisma.floor.findMany();
  const allPoints = await prisma.point.findMany({
    where: {
      type: "point",
    },
  });

  const { result: floor } = await getFloorById({ id: Number(floorId) || 1 });

  const { result: interFloorEdges } = await getInterFloorEdges();

  return (
    <div className="flex-1 w-full relative">
      <div className="h-[50vh] bg-zinc-500 overflow-clip flex justify-center items-center">
        {floor ? <MapRender path={[]} data={floor} /> : "Map"}
      </div>
      <div className="w-max mx-auto p-4">
        <div>
          <p>Public</p>
          <UserActions
            allPoints={allPoints.map((p) => ({
              id: String(p.id),
              name: p.name,
            }))}
            floors={svgList}
          />
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
