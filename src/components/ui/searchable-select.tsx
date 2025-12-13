import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "~/lib/utils";
import { Input } from "~/components/ui/input";

export interface SearchableSelectOption {
  value: string;
  label: string;
  searchTerms?: string;
  renderLabel?: React.ReactNode;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Type to search...",
  emptyMessage = "No options found.",
  disabled = false,
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get selected option display value
  const selectedOption = options.find((option) => option.value === value);
  const displayValue = selectedOption?.label || "";

  // Update search when value changes externally
  useEffect(() => {
    if (!open && selectedOption) {
      setSearch(selectedOption.label);
    }
  }, [value, selectedOption, open]);

  // Filter options based on search
  const filteredOptions = options.filter((option) => {
    if (!search.trim()) return true;
    
    const searchLower = search.toLowerCase().trim();
    const labelMatch = option.label.toLowerCase().includes(searchLower);
    const termsMatch = option.searchTerms?.toLowerCase().includes(searchLower);
    
    return labelMatch || termsMatch;
  });

  // Reset highlighted index when filtered options change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [search]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        if (!value && selectedOption) {
          setSearch(selectedOption.label);
        } else if (!value) {
          setSearch("");
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value, selectedOption]);

  const handleSelect = (option: SearchableSelectOption) => {
    onValueChange(option.value);
    setSearch(option.label);
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearch(newValue);
    setOpen(true);
    
    // Clear selection if input is cleared
    if (!newValue && value) {
      onValueChange("");
    }
  };

  const handleInputFocus = () => {
    setOpen(true);
    // Select all text on focus for easy replacement
    inputRef.current?.select();
  };

  const handleClear = () => {
    setSearch("");
    onValueChange("");
    setOpen(true);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter")) {
      e.preventDefault();
      setOpen(true);
      return;
    }

    if (!open) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        if (selectedOption) {
          setSearch(selectedOption.label);
        }
        break;
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Input Field */}
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={search}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-16"
          autoComplete="off"
        />
        
        {/* Icons */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {search && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-accent rounded transition-colors"
              tabIndex={-1}
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
          <ChevronDown className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            open && "transform rotate-180"
          )} />
        </div>
      </div>

      {/* Dropdown */}
      {open && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-[280px] overflow-auto"
        >
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            <div className="py-1">
              {filteredOptions.map((option, index) => (
                <button
                  key={`${option.value}-${index}`}
                  type="button"
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-sm text-left cursor-pointer transition-colors",
                    highlightedIndex === index && "bg-accent",
                    value === option.value && "font-medium"
                  )}
                >
                  <Check
                    className={cn(
                      "h-3.5 w-3.5 shrink-0 text-primary",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    {option.renderLabel || (
                      <span className="block truncate">{option.label}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {/* Result count footer */}
          {search && filteredOptions.length > 0 && (
            <div className="px-3 py-2 text-xs text-muted-foreground border-t bg-muted/50">
              {filteredOptions.length} of {options.length} items
            </div>
          )}
        </div>
      )}
    </div>
  );
}
