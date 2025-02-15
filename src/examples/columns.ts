import { DEFAULT_OPERATORS, type Column } from "../components/filter-combobox";

export const columns: Column[] = [
  {
    id: "name",
    label: "Name",
    type: "text",
    // Optional custom operators
    operators: [
      ...DEFAULT_OPERATORS.text,
      {
        id: "startsWith",
        label: "starts with",
        operatorFn: (value: string, filterValue: string) =>
          value.toLowerCase().startsWith(filterValue.toLowerCase()),
      },
    ],
  },

  // Automatically uses DEFAULT_OPERATORS.number
  {
    id: "age",
    label: "Age",
    type: "number",
  },
  {
    id: "occupation",
    label: "Job",
    type: "text",
  },
  {
    id: "start_date",
    label: "Start Date",
    type: "date",
  },
  {
    id: "end_date",
    label: "End Date",
    type: "date",
  },
];
