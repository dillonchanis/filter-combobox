# FilterCombobox

FilterCombobox is a React component that allows you to quickly compose filter search queries against your data. The FilterCombobox provides a fully headless solution to create an accessible [combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) within your application. The API is composable and allows for flexible styling.

## Development Setup

This repo uses React, Vite, and TypeScript.

1. Clone the repo
2. Install dependencies
3. Run dev command

Eg:

```bash
npm run dev
```

## How to Use

The FilterCombobox follows a compound component pattern.

```tsx
import { FilterCombobox } from './components/filter-combobox';


function MyFilter() {
  return (
    <FilterCombobox>
      <FilterCombobox.Label>Filter</FilterCombobox.Label>

      <FilterCombobox.Tags />
      <FilterCombobox.Input />

      <FilterCombobox.Menu>
        <FilterCombobox.Empty>No results found.</FilterCombobox.Empty>

        <FilterCombobox.MenuItem slot="column" type="text">Name</FilterCombobox.MenuItem>
        <FilterCombobox.MenuItem slot="operator" columnName="name">Contains</FilterCombobox.MenuItem>
        <FilterCombobox.MenuItem slot="operator" columnName="name">Starts With</FilterCombobox.MenuItem>
        <FilterCombobox.MenuItem slot="operator" columnName="name">Equals</FilterCombobox.MenuItem>

        <FilterCombobox.MenuItem slot="column" type="number">Age</FilterCombobox.MenuItem>
        <FilterCombobox.MenuItem slot="operator" columnName="age">Equals</FilterCombobox.MenuItem>
        <FilterCombobox.MenuItem slot="operator" columnName="age">Greater than</FilterCombobox.MenuItem>
        <FilterCombobox.MenuItem slot="operator" columnName="age">Less than</FilterCombobox.MenuItem>
      </FilterCombobox.Menu>
    </FilterCombobox>
  )
}
```

### FilterCombobox

Root level component responsible for handling state.

#### Props

`label` (Optional) - A screen-reader only label for your input. Not visible to the end user. Do not use in conjunction with the `FilterCombobox.Label` component

`delimiter` (Optional) - Character responsible for separating the filer into distinct units. Defaults to `:`

`value` (Optional) - Value for the filter input (controlled)

`defaultValue` (Optional) - Initial filter value (uncontrolled)

`filters` (Optional) - Set of query filters to prepopulate the input with

`onFiltersChange` (Optional) - Callback function providing all queries submitted to the input

### Label

Renders a `label` element for the `FilterCombobox.Input`. Handles `id` and `for` assignment for you.

### Input

The `input` element that is used to filter menu items and provide values to queries.

### Tags

The `FilterCombobox.Tags` component will render the complete list of `filters` the user has input to be displayed. To fully customize each "tag" you can utilize the `Tag` component exposed by the `FilterCombobox`.

### Tag

The `FilterCombobox.Tag` component allows you to fully customize the look and feel of each "tag". First, capture the filters locally on your component using the `onFiltersChange` prop.

```tsx
import { type Filter } from "./components/filter-combobox";

// omitted for brevity...
const [filters, setFilters] = useState<Filter[]>([]);

return (
  <FilterCombobox onFiltersChange={setFilters}>
    {filters.length > 0 &&
      filters.map((filter) => (
        <FilterCombobox.Tag
          id={filter.id}
          key={filter.id}
          className={classes.customTag}
        >
          {filter.column}:{filter.operator}:{filter.value}
        </FilterCombobox.Tag>
      )}
)
```

The `Tag` requires an `id` prop if you want to be able to remove tags via slottable props.

To remove tags, you can utilize the `FilerCombobox.Button` component's slot props. Providing the `slot="remove"` will allow the Button to delete the tag.

```tsx
<FilterCombobox.Tag
 id={filter.id}
 key={filter.id}
 className={classes.customTag}
>
 {filter.column}:{filter.operator}:{filter.value}
 <FilterCombobox.Button type="button" slot="remove">
  Delete
 </FilterCombobox.Button>
</FilterCombobox.Tag>
```

### Menu

Menu that appears when the user interacts with the `FilterCombobox.Input` component. Provides keyboard accessible list of items for the user to filter through and choose from.

### MenuItem

Individual selectable items within a `Menu`. This component is slottable and behavior will change based on the provided slot.

#### Slots

`column` - The column slot for a `MenuItem` will appear when a user is selecting a column.

`operator` - The operator slot for a `MenuItem` will appear when a user is selecting an operator. The operator choices depend on the column that was selected. To associated an operator with a column you can provide the `columnName` prop.

### Operators

This is another helper component. When rendering `MenuItem`s while mapping over an array of `columns`, it might get messy also having to iterate over each set of operators (or not if that column does not define a custom set of operators!). The `FilerCombobox.Operators` component will render it for you. Just provide the `column` as a prop to it -- it will handle the iteration and set of default set of operators for you based on the column type!

```tsx
{columns.map((column) => (
   <Fragment key={column.id}>
     <FilterCombobox.MenuItem slot="column" type={column.type}>
       {column.label}
     </FilterCombobox.MenuItem>
     <FilterCombobox.Operators column={column} />
   </Fragment>
))}
```

### Empty

Renders when a user is filtering a list of `MenuItem` and no item matches the current filter.

## Styling

Since the component is headless it is up to you on how you want to style it. All components accept `className`. For some components, certain elements might be nested. The component provides `data-*` attributes that correspond to the function of that component.

Eg:

- `data-filtercombobox-input`
- `data-filtercombobox-label`
- `data-filtercombobox-menu`

Check the examples for some ways to use basic styling via CSS or a library like [Tailwind](https://tailwindcss.com/).

## Columns and Operators

Columns are the integral data structure that the component interacts with. Columns refer to the column of the table the user is interacting with. These can come in many disparate types — a `Name` column would expect a `string` where an `Age` might expect a `number`.  This might have an effect on the operators that are available for that column type. It doesn’t make much sense for a column that interfaces with a `date` to have an operator of `Starts With`. The component should have a base set of default operators (eg. `contains`, `equals`, `greater than`, etc.). Ideally, we also have a system in place for allowing developers to define custom operators.

```ts
type BaseOperator = {
	id: string;
	label: string;
	operatorFn: (value: any, filterValue: any) => boolean;
}

type Column = {
  id: string;
  label: string;
  type: keyof typeof DEFAULT_OPERATORS;
  
  /**
   * Optional operators.
   * Defaults to DEFAULT_OPERATORS for that type
   */
  operators?: BaseOperator[];
}

// Example non-exhaustive list of default operators
const DEFAULT_OPERATORS = {
  text: [
	  {
		  id: 'contains',
		  label: 'Contains',
		  operatorFn: (value: string, filterValue: string) => 
			  value.toLowerCase().includes(filterValue.toLowerCase())
	  }
  ],
  number: [...],
  date: [...],
  // etc...
}

const columns = [
  {
	  id: 'name',
	  label: 'Name',
	  type: 'text',
	  // Optional custom operators
	  operators: [...DEFAULT_OPERATORS.text, {
		  id: 'startsWith',
		  label: 'Starts with',
		  operatorFn: (value: string, filterValue: string) => 
			  value.toLowerCase().startsWith(filterValue.toLowerCase())
	  }],
  },
  
  // Automatically uses DEFAULT_OPERATORS.number
  {
	  id: 'age',
	  label: 'Age',
	  type: 'number'
  }
]
```

### Default Operators

The library ships with some default set of operators.

```ts
const DEFAULT_OPERATORS = {
  text: [
    {
      id: "equals",
      label: "equals",
      operatorFn: (value: string, filterValue: string) =>
        value.toLowerCase() === filterValue.toLowerCase(),
    },
    {
      id: "contains",
      label: "contains",
      operatorFn: (value: string, filterValue: string) =>
        value.toLowerCase().includes(filterValue.toLowerCase()),
    },
    {
      id: "empty",
      label: "is empty",
      operatorFn: (value: string) => value === "" || value == null,
    },
    {
      id: "notEmpty",
      label: "is not empty",
      operatorFn: (value: string) => value !== "" && value != null,
    },
  ],
  number: [
    {
      id: "equals",
      label: "equals",
      operatorFn: (value: number, filterValue: number) => value === filterValue,
    },
    {
      id: "gt",
      label: "greater than",
      operatorFn: (value: number, filterValue: number) => value > filterValue,
    },
    {
      id: "gte",
      label: "greater than or equal to",
      operatorFn: (value: number, filterValue: number) => value >= filterValue,
    },
    {
      id: "lt",
      label: "less than",
      operatorFn: (value: number, filterValue: number) => value < filterValue,
    },
    {
      id: "lte",
      label: "less than or equal to",
      operatorFn: (value: number, filterValue: number) => value <= filterValue,
    },
    {
      id: "between",
      label: "between",
      operatorFn: (value: number, filterValue: [number, number]) =>
        value >= filterValue[0] && value <= filterValue[1],
    },
  ],
  date: [
    {
      id: "equals",
      label: "Is",
      operatorFn: (value: string, filterValue: string) =>
        isValidDate(value) &&
        isValidDate(filterValue) &&
        new Date(value).toISOString() === new Date(filterValue).toISOString(),
    },
  ],
  boolean: [
    {
      id: "equals",
      label: "Is",
      operatorFn: (value: boolean, filterValue: boolean) =>
        value === filterValue,
    },
  ],
};
```

## Architecture Design

The `FilterCombobox` leverages both Slot Props and Compound Components. Under the hood, the `FilterCombobox` doesn't use `React.Children.map` or `React.cloneElement`. This means you don't have the drawback of not being able to nest more components/HTML within the `FilterCombobox` component itself.

This allows you to have full reins on the markup used.
