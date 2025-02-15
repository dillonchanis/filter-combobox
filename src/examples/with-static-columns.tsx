import { useState } from "react";
import { FilterCombobox, type Filter } from "../components/filter-combobox";

import Output from "./output";

import classes from "./example.module.css";

export default function WithStaticColumns() {
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

          <FilterCombobox.MenuItem slot="column" type="text">
            Name
          </FilterCombobox.MenuItem>
          <FilterCombobox.MenuItem slot="operator" columnName="name">
            Contains
          </FilterCombobox.MenuItem>
          <FilterCombobox.MenuItem slot="operator" columnName="name">
            Starts With
          </FilterCombobox.MenuItem>
          <FilterCombobox.MenuItem slot="operator" columnName="name">
            Equals
          </FilterCombobox.MenuItem>

          <FilterCombobox.MenuItem slot="column" type="number">
            Age
          </FilterCombobox.MenuItem>
          <FilterCombobox.MenuItem slot="operator" columnName="age">
            Equals
          </FilterCombobox.MenuItem>
          <FilterCombobox.MenuItem slot="operator" columnName="age">
            Greater than
          </FilterCombobox.MenuItem>
          <FilterCombobox.MenuItem slot="operator" columnName="age">
            Less than
          </FilterCombobox.MenuItem>
        </FilterCombobox.Menu>
      </FilterCombobox>

      <div style={{ marginTop: "24px" }}>
        <Output filters={filters} />
      </div>
    </div>
  );
}
