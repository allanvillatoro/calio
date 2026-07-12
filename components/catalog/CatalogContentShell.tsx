import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CatalogSearchBar } from '@/components/catalog/CatalogSearchBar';

interface CatalogContentShellProps {
  title: string;
  showAddButton: boolean;
  showSearchBar: boolean;
  searchDefaultValue?: string;
  onAdd: () => void;
  onSearch: (query: string) => void;
  children: React.ReactNode;
  dialogs: React.ReactNode;
}

export function CatalogContentShell({
  title,
  showAddButton,
  showSearchBar,
  searchDefaultValue,
  onAdd,
  onSearch,
  children,
  dialogs,
}: CatalogContentShellProps) {
  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="pb-6 text-center text-2xl font-semibold">{title}</h2>
      {showAddButton && (
        <div className="py-4 text-right">
          <Button className="w-24" onClick={onAdd}>
            <Plus className="size-4" />
            Agregar
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-8 md:flex-row">
        <div className="flex-1">
          {showSearchBar && (
            <CatalogSearchBar
              defaultValue={searchDefaultValue}
              onSearch={onSearch}
            />
          )}
          {children}
        </div>
      </div>

      {dialogs}
    </div>
  );
}
