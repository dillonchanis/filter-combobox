import { Fragment, useState } from "react";
import { FilterCombobox, type Filter } from "../components/filter-combobox";

import { columns } from "./columns";
import Output from "./output";

export default function WithTailwind() {
  const [filters, setFilters] = useState<Filter[]>([]);

  return (
    <div className="max-w-2xl mx-auto">
      <FilterCombobox
        className="max-w-2xl mx-auto"
        onFiltersChange={setFilters}
      >
        <FilterCombobox.Label className="font-semibold text-sm text-gray-900">
          Filter
        </FilterCombobox.Label>

        <div className="flex items-center gap-2 mt-3 h-11 px-4 py-2 bg-white border border-gray-300 rounded-md">
          <FilterCombobox.Tags className="flex gap-0.5 **:data-tag:bg-emerald-100 **:data-tag:text-emerald-900 **:data-tag:inline-flex **:data-tag:items-center **:data-tag:justify-between **:data-tag:text-sm **:data-tag:px-1 **:data-tag:py-0.5" />
          <FilterCombobox.Input className="w-full aria-expanded:outline-0" />
        </div>

        <FilterCombobox.Menu className="py-2 mt-3 border border-gray-300 bg-gray-50 rounded-md">
          <FilterCombobox.Empty className="text-red-500 px-3">
            No results found.
          </FilterCombobox.Empty>

          {columns.map((col) => (
            <Fragment key={col.id}>
              <FilterCombobox.MenuItem
                slot="column"
                type={col.type}
                className="px-3 aria-selected:bg-gray-200"
              >
                {col.label}
              </FilterCombobox.MenuItem>
              <FilterCombobox.Operators
                column={col}
                className="px-3 aria-selected:bg-gray-200"
              />
            </Fragment>
          ))}
        </FilterCombobox.Menu>
      </FilterCombobox>

      <div className="mt-6">
        <Output filters={filters} />
      </div>
    </div>
  );
}
