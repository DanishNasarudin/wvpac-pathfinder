import EditButton from "@/components/custom/edit-button";
import EditPanel from "@/components/custom/edit-panel";
import MapRender from "@/components/custom/map";
import SvgRegistryInput from "@/components/custom/svg-registry-input";
import SvgRegistryList from "@/components/custom/svg-registry-list";
import { prisma } from "@/lib/prisma";
import { getFloorById } from "@/services/actions";

const production = process.env.NODE_ENV === "production";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ f: string }>;
}) {
  const { f: floorId } = await searchParams;
  const svgList = await prisma.floor.findMany();

  const { result: floor } = await getFloorById({ id: Number(floorId) || 2 });

  return (
    <div className="flex-1 w-full relative">
      <div className="h-[50vh] bg-zinc-500 overflow-clip">
        {floor ? <MapRender path={[]} data={floor} /> : "Map"}
      </div>
      <div className="w-max mx-auto p-4">
        <div>Public Actions</div>
        {!production && (
          <div>
            <p>Admin Actions</p>
            <EditPanel />
            {floor && <EditButton isProduction={production} data={floor} />}
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
