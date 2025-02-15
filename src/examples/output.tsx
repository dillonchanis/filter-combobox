import { type Filter } from "../components/filter-combobox";

interface OutputProps {
  filters: Filter[];
}

export default function Output({ filters }: OutputProps) {
  return filters.length > 0 ? (
    <pre className="bg-gray-50 p-2 rounded">
      {JSON.stringify(filters, null, 2)}
    </pre>
  ) : null;
}
