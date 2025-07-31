"use client";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

type ListItem = { id: string; name: string };
interface Props {
  id?: string;
  lists: Array<string | ListItem>;
  onValueChange?: (value: string, componentId: string) => void;
  valueInput?: string;
  width?: string;
  isStart?: string;
  isEnd?: string;
  placeholder?: string;
  noSearch?: boolean;
  allowDeselect?: boolean;
}

export default function DropdownSearch({
  id = "default",
  lists,
  onValueChange = () => {},
  valueInput,
  width = "none",
  isStart,
  isEnd,
  placeholder = "Select…",
  noSearch = false,
  allowDeselect = false,
}: Props) {
  const normalized: ListItem[] = lists.map((item) =>
    typeof item === "string"
      ? { id: item, name: item }
      : { id: item.id, name: item.name }
  );

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ListItem | undefined>(
    valueInput ? normalized.find((i) => i.id === valueInput) : undefined
  );

  useEffect(() => {
    if (!valueInput) return;
    setSelected(normalized.find((i) => i.id === valueInput));
  }, [valueInput]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            width === "none" ? "" : width,
            "justify-between overflow-hidden text-xs w-full"
          )}
        >
          <p className="truncate">{selected ? selected.name : placeholder}</p>
          {isStart && selected?.id === isStart && isStart !== isEnd && (
            <Badge className="text-xs">Start</Badge>
          )}
          {isEnd && selected?.id === isEnd && isStart !== isEnd && (
            <Badge className="text-xs bg-green-600">Destination</Badge>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(width === "none" ? "w-[200px]" : width, "p-0")}
        side="bottom"
      >
        <Command>
          {!noSearch && (
            <CommandInput placeholder="Search list..." className="text-base" />
          )}
          <CommandList>
            <CommandEmpty>No list found.</CommandEmpty>
            <CommandGroup>
              {normalized.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.name}
                  onSelect={() => {
                    if (allowDeselect) {
                      if (selected && item.id === selected.id) {
                        setSelected(undefined);
                        onValueChange("null", id!);
                      } else {
                        setSelected(item);
                        onValueChange(item.id, id!);
                      }
                    } else {
                      setSelected(item);
                      onValueChange(item.id, id!);
                    }
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected?.id === item.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.name}
                  {isStart && item.id === isStart && isStart !== isEnd && (
                    <Badge className="text-xs">Start</Badge>
                  )}
                  {isEnd && item.id === isEnd && isStart !== isEnd && (
                    <Badge className="text-xs bg-green-600">Destination</Badge>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
