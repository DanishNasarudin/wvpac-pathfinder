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

type Props = {
  id?: string;
  lists?: string[];
  onValueChange?: (newValue: string, id: string) => void;
  valueInput?: string;
  width?: string;
  isStart?: string;
  isEnd?: string;
  placeholder?: string;
  noSearch?: boolean;
};

export default function DropdownSearch({
  id = "default",
  lists = ["A1", "B2"],
  onValueChange = () => {},
  valueInput = "",
  width = "none",
  isStart = "",
  isEnd = "",
  placeholder = "default",
  noSearch = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(valueInput || "");

  useEffect(() => {
    if (value === "") return;

    onValueChange(value, id);
  }, [value]);

  useEffect(() => {
    if (valueInput === "") return;
    setValue(valueInput);
  }, [valueInput]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            width === "none" ? "w-[200px]" : width,
            "justify-between text-ellipsis overflow-hidden text-xs w-full"
          )}
        >
          <p className="truncate">
            {value ? lists.find((list) => list === value) : placeholder}
          </p>
          {isStart !== "" && isStart === value && isStart !== isEnd && (
            <Badge className="text-xs">Start</Badge>
          )}
          {isEnd !== "" && isEnd === value && isStart !== isEnd && (
            <Badge className="text-xs" variant={"destructive"}>
              Destination
            </Badge>
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
              {lists.map((list) => (
                <CommandItem
                  key={list}
                  value={list}
                  onSelect={(currentValue) => {
                    setValue(currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === list ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {list}
                  {isStart !== "" && isStart === list && isStart !== isEnd && (
                    <Badge>Start</Badge>
                  )}
                  {isEnd !== "" && isEnd === list && isStart !== isEnd && (
                    <Badge variant={"destructive"}>Destination</Badge>
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
