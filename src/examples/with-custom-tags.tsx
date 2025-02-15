import { Fragment, useState } from "react";
import { FilterCombobox, type Filter } from "../components/filter-combobox";

import { columns } from "./columns";
import Output from "./output";

import classes from "./example.module.css";

export default function WithCustomTags() {
  const [filters, setFilters] = useState<Filter[]>([]);

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <FilterCombobox className={classes.example} onFiltersChange={setFilters}>
        <FilterCombobox.Label>Filter</FilterCombobox.Label>

        <div className={classes.inputContainer}>
          {filters.length > 0 &&
            filters.map((filter) => (
              <FilterCombobox.Tag
                id={filter.id}
                key={filter.id}
                className={classes.customTag}
              >
                {filter.column}:{filter.operator}:{filter.value}
                <FilterCombobox.Button type="button" slot="remove">
                  <span className="sr-only">Remove</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-4"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    />
                  </svg>
                </FilterCombobox.Button>
              </FilterCombobox.Tag>
            ))}
          <FilterCombobox.Input />
        </div>

        <FilterCombobox.Menu>
          <FilterCombobox.Empty>No results found.</FilterCombobox.Empty>

          {columns.map((col) => (
            <Fragment key={col.id}>
              <FilterCombobox.MenuItem slot="column" type={col.type}>
                {col.label}
              </FilterCombobox.MenuItem>
              <FilterCombobox.Operators column={col} />
            </Fragment>
          ))}
        </FilterCombobox.Menu>
      </FilterCombobox>

      <div style={{ marginTop: "24px" }}>
        <Output filters={filters} />
      </div>
    </div>
  );
}
