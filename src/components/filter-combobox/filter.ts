interface FilterBuilderOptions {
  delimiter?: string;
}

export class FilterBuilder {
  private parts: (string | null)[] = [null, null, null];
  private delimiter: string;

  constructor(filterString: string, options: FilterBuilderOptions = {}) {
    this.delimiter = options.delimiter ?? ":";

    if (filterString) {
      const parts = filterString.split(this.delimiter);
      this.parts = [...parts, ...Array(3 - parts.length).fill(null)];
    }
  }

  setDelimiter(delimiter: string): FilterBuilder {
    this.delimiter = delimiter;
    return this;
  }

  getDelimiter(): string {
    return this.delimiter;
  }

  add(value: string): FilterBuilder {
    const nextEmptyIndex = this.parts.findIndex((p) => p === null);

    if (nextEmptyIndex !== -1) {
      this.parts[nextEmptyIndex] = value;
    }

    return this;
  }

  isComplete(): boolean {
    return this.parts.every((p) => p !== null);
  }

  toString(): string {
    if (!this.isComplete()) {
      console.log("Filter is not complete", this.parts);
    }

    return this.parts.join(this.delimiter);
  }

  getCurrentStep(): number {
    return this.parts.findIndex((p) => p === null);
  }

  clear(): void {
    this.parts = [null, null, null];
  }
}
