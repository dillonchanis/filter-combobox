function isValidDate(dateStr: string) {
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

// Example non-exhaustive list of default operators
export const DEFAULT_OPERATORS = {
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
