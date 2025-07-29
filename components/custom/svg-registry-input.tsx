"use client";
import { addFloor } from "@/services/actions";
import { Plus } from "lucide-react";
import { FormEvent, useCallback, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export default function SvgRegistryInput() {
  const [name, setName] = useState("");
  const [src, setSrc] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleAdd = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!name || !src) {
        toast.error("Field is empty!");
        return;
      }

      startTransition(() => {
        toast.promise(addFloor({ name, src }), {
          loading: "Adding floor..",
          success: () => {
            setName("");
            setSrc("");
            return "Floor added!";
          },
          error: "Floor failed to add!",
        });
      });
    },
    [name, src]
  );

  return (
    <form onSubmit={handleAdd} className="flex gap-2">
      <Input
        placeholder="Name"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        placeholder="/floor.svg"
        required
        value={src}
        onChange={(e) => setSrc(e.target.value)}
      />
      <Button size={"icon"} disabled={isPending}>
        <Plus />
      </Button>
    </form>
  );
}
