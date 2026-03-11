import * as React from "react";
import { Search, X, Filter } from "lucide-react";
import { Input } from "@/frontend_lib/components/ui/input";
import { Button } from "@/frontend_lib/components/ui/button";

function ToolbarSearchComponent({ 
  value, 
  onChange, 
  onReset, 
  isFiltered 
}: { 
  value: string; 
  onChange: (v: string) => void; 
  onReset: () => void;
  isFiltered: boolean;
}) {
  return (
    <div className="hidden md:flex items-center gap-2">
      <div className="relative w-52 focus-within:w-80 transition-all duration-300">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-8 h-9"
        />
        {value && (
          <button onClick={() => onChange("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {isFiltered && (
        <Button variant="ghost" size="sm" onClick={onReset} className="h-9 gap-1.5">
          <Filter className="h-3.5 w-3.5" />
          Reset
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}

export const ToolbarSearch = React.memo(ToolbarSearchComponent);