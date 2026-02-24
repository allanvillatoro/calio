import { Category } from "@/lib/types";

const CHECKBOX_STYLES =
  "w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900 focus:ring-2";
const LABEL_STYLES = "flex items-center cursor-pointer group";
const LABEL_TEXT_STYLES = "ml-3 text-gray-700 group-hover:text-gray-900";

interface CategoryCheckboxProps {
  category: string;
  checked: boolean;
  onChange: () => void;
  uppercase?: boolean;
  isSectionLabel?: boolean;
}

function CategoryCheckbox({
  category,
  checked,
  onChange,
  uppercase = true,
  isSectionLabel = false,
}: CategoryCheckboxProps) {
  const textClasses = `${LABEL_TEXT_STYLES} ${isSectionLabel ? "font-medium" : ""} ${uppercase ? "uppercase" : ""}`;

  return (
    <label className={LABEL_STYLES}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className={CHECKBOX_STYLES}
      />
      <span className={textClasses}>{category}</span>
    </label>
  );
}

interface FiltersSectionProps {
  categories: Category[];
  selectedCategories: Category[];
  isAllSelected: boolean;
  isOpen: boolean;
  onToggleOpen: () => void;
  onSelectAll: () => void;
  onToggleCategory: (category: Category) => void;
}

export function FiltersSection({
  categories,
  selectedCategories,
  isAllSelected,
  isOpen,
  onToggleOpen,
  onSelectAll,
  onToggleCategory,
}: FiltersSectionProps) {
  return (
    <aside className="w-full md:w-64 md:flex-shrink-0">
      {/* Mobile Toggle Button */}
      <button
        onClick={onToggleOpen}
        className="md:hidden w-full bg-white rounded-lg shadow-md p-4 mb-4 text-left font-semibold text-gray-900 flex justify-between items-center hover:bg-gray-50"
      >
        <span>Filtros</span>
        <span className="text-xl">{isOpen ? "−" : "+"}</span>
      </button>

      {/* Filters Content */}
      <div
        className={`${
          isOpen ? "block" : "hidden"
        } md:block bg-white rounded-lg shadow-md p-6 md:sticky md:top-4`}
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Categorías</h2>
        <div className="space-y-3">
          {/* Category options */}
          {categories.map((category) => (
            <CategoryCheckbox
              key={category}
              category={category}
              checked={selectedCategories.includes(category)}
              onChange={() => onToggleCategory(category)}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}
