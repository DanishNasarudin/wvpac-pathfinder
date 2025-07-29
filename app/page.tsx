import SvgRegistryInput from "@/components/custom/svg-registry-input";
import SvgRegistryList from "@/components/custom/svg-registry-list";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const svgList = await prisma.floor.findMany();

  return (
    <div className="flex-1 w-full">
      <div className="h-[50vh] bg-zinc-500">Map</div>
      <div className="w-max mx-auto p-4">
        <div>Public Actions</div>
        <div>
          <p>Admin Actions</p>
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
      </div>
    </div>
  );
}
