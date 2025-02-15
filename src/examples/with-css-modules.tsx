import { Fragment, useState } from "react";
import { FilterCombobox, type Filter } from "../components/filter-combobox";

import { columns } from "./columns";
import Output from "./output";

import classes from "./example.module.css";

export default function WithCSSModules() {
  const [filters, setFilters] = useState<Filter[]>([]);

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <FilterCombobox className={classes.example} onFiltersChange={setFilters}>
        <FilterCombobox.Label>Filter</FilterCombobox.Label>

        <div className={classes.inputContainer}>
          <FilterCombobox.Tags />
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
