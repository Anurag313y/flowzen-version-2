import { useState } from 'react';
import { Check, ChevronsUpDown, Building2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

export interface Branch {
  id: string;
  name: string;
  city: string;
  isMain: boolean;
}

interface BranchSelectorProps {
  branches: Branch[];
  selectedBranch: Branch | null;
  onSelectBranch: (branch: Branch) => void;
  onAddBranch?: () => void;
  variant?: 'default' | 'compact';
  className?: string;
}

export function BranchSelector({
  branches,
  selectedBranch,
  onSelectBranch,
  onAddBranch,
  variant = 'default',
  className,
}: BranchSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "justify-between bg-background border-border",
            variant === 'compact' ? "h-8 text-xs px-2" : "h-9 px-3",
            className
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <Building2 className={cn(
              "shrink-0 text-muted-foreground",
              variant === 'compact' ? "h-3.5 w-3.5" : "h-4 w-4"
            )} />
            <span className="truncate">
              {selectedBranch?.name || "Select branch"}
            </span>
            {selectedBranch?.isMain && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                Main
              </Badge>
            )}
          </div>
          <ChevronsUpDown className={cn(
            "shrink-0 opacity-50",
            variant === 'compact' ? "h-3 w-3" : "h-4 w-4"
          )} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search branch..." className="h-9" />
          <CommandList>
            <CommandEmpty>No branch found.</CommandEmpty>
            <CommandGroup heading="Branches">
              {branches.map((branch) => (
                <CommandItem
                  key={branch.id}
                  value={branch.name}
                  onSelect={() => {
                    onSelectBranch(branch);
                    setOpen(false);
                  }}
                  className="flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{branch.name}</span>
                      {branch.isMain && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          Main
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{branch.city}</span>
                  </div>
                  <Check
                    className={cn(
                      "h-4 w-4",
                      selectedBranch?.id === branch.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
            {onAddBranch && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      onAddBranch();
                      setOpen(false);
                    }}
                    className="text-primary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Branch
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}