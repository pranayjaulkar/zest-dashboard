"use client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCreateModalStore } from "@/hooks/useCreateModalStore";
import { Store } from "@prisma/client";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStores } from "@/hooks/useStores";
import { Button } from "../../ui/button";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Store as StoreIcon, PlusCircle } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../../ui/command";
import { useLoadingBarStore } from "@/hooks/useLoadingBarStore";
type PopoverTriggerProps = React.ComponentPropsWithoutRef<typeof PopoverTrigger>;

interface StoreSwitcherProps extends PopoverTriggerProps {
  items: Store[];
}

export default function StoreSwitcher({ className, items = [] }: StoreSwitcherProps) {
  const createModal = useCreateModalStore();
  const loadingBar = useLoadingBarStore();
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const { stores, setStores } = useStores();
  const [open, setOpen] = useState(false);
  const formattedStores = stores.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  const currentStore = formattedStores.find((item) => item.value === params.storeId);

  const onStoreSelect = (store: { value: string; label: string }, event: any) => {
    setOpen(false);
    if (pathname !== `/${store.value}`) {
      loadingBar.start(event);
      router.push(`/${store.value}`);
      router.refresh();
    }
  };

  useEffect(() => {
    setStores(items);
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          role="combobox"
          aria-expanded={open}
          aria-label="Select a store"
          className={cn("w-[200px] justify-between", className)}
        >
          <StoreIcon className="mr-2 h-4 w-4" />
          {currentStore?.label}
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandInput placeholder="Search Store..." />
            <CommandEmpty>No store found</CommandEmpty>
            <CommandGroup>
              {formattedStores.map((store) => (
                <CommandItem key={store.value} onSelect={(event) => onStoreSelect(store, event)} className="text-sm">
                  <StoreIcon className="mr-2 h-4 w-4" />
                  {store.label}
                  <Check
                    className={cn("ml-auto h-4 w-4", currentStore?.value == store?.value ? "opacity-100" : "opacity-0")}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <CommandSeparator />
          <CommandList>
            <CommandItem
              onSelect={() => {
                setOpen(false);
                createModal.open();
              }}
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Create Store
            </CommandItem>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
