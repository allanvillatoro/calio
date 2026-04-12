'use client';

import { useRef, type KeyboardEvent } from 'react';
import { Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface CatalogSearchBarProps {
  defaultValue?: string;
  onSearch: (query: string) => void;
}

export function CatalogSearchBar({
  defaultValue,
  onSearch,
}: CatalogSearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const submitSearch = () => {
    onSearch(inputRef.current?.value?.trim() ?? '');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    submitSearch();
  };

  return (
    <div className="mb-8 flex justify-end">
      <div className="flex w-full max-w-xl items-center gap-3">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            key={defaultValue ?? ''}
            ref={inputRef}
            defaultValue={defaultValue}
            onKeyDown={handleKeyDown}
            type="text"
            placeholder="Buscar piezas por nombre..."
            className="h-11 rounded-lg border-gray-300 bg-white pl-10 pr-4 shadow-sm focus-visible:border-gray-900 focus-visible:ring-gray-900/15"
          />
        </div>
        <Button type="button" size="lg" onClick={submitSearch}>
          Buscar
        </Button>
      </div>
    </div>
  );
}
