"use client";
import { Floor } from "@/prisma/generated/prisma";
import { deleteFloor } from "@/services/actions";
import { Minus } from "lucide-react";
import { useCallback, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

export default function SvgRegistryList({ data }: { data: Floor }) {
  const [isPending, startTransition] = useTransition();

  const handleDel = useCallback(() => {
    startTransition(async () => {
      toast.promise(deleteFloor({ id: data.id }), {
        loading: "Deleting floor..",
        success: "Floor deleted!",
        error: "Floor failed to delete!",
      });
    });
  }, [data.id]);

  return (
    <div className="flex gap-2 text-sm items-center">
      <p className="flex-1 px-3">{data.name}</p>
      <p className="flex-1 px-3">{data.src}</p>
      <Button
        variant={"destructive"}
        size={"icon"}
        onClick={handleDel}
        disabled={isPending}
      >
        <Minus />
      </Button>
    </div>
  );
}
