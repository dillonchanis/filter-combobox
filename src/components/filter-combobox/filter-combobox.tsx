"use client";

import * as React from "react";
import mergeRefs from "merge-refs";

import { SlotContext, useSlotProps } from "./slots";
import { DEFAULT_OPERATORS } from "./default-operators";

export type BaseOperator = {
  id: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  operatorFn: (value: any, filterValue: any) => boolean;
};

export type Column = {
  id: string;
  label: string;
  type: keyof typeof DEFAULT_OPERATORS;

  /**
   * Optional operators.
   * Defaults to DEFAULT_OPERATORS for that type
   */
  operators?: BaseOperator[];
};

type Step = "column" | "operator" | "value";

type State = {
  filter: string;
  tags: Filter[];
  value: string;
  filtered: [string, string][];
  open: boolean;
  type: keyof typeof DEFAULT_OPERATORS;
  delimiter: string;
};

type Store = {
  subscribe: (listener: () => void) => () => void;
  snapshot: () => State;
  setState: <K extends keyof State>(key: K, value: State[K]) => void;
  removeTag: (id: string) => void;
  emit: () => void;
};

type MenuItem = {
  id: string;
  value: string;
  columnId?: string;
};

type MenuState = {
  register: (
    step: Step,
    id: string,
    value: string,
    columnLabel?: string
  ) => void;
  menuId: string;
  labelId: string;
  inputId: string;
};

export type Filter = {
  id: string;
  column: string;
  operator: string;
  value: string;
};

interface FilterComboboxProps {
  /**
   * Optional sr-only label
   * Will not visually display the label.
   * If you want a label displayed use `FilterCombobox.Label`
   */
  label?: string;

  children?: React.ReactNode;

  className?: string;

  /**
   * Character to separate the filter data into their distinct parts.
   * Defaults to `:`
   */
  delimiter?: string;

  /**
   * For use when uncontrolled.
   * Sets the initial text value of the filter input.
   */
  defaultValue?: string;

  /**
   * Controlled state of the filter input.
   */
  value?: string;

  /**
   * Controlled state for filters.
   * Prepopulates the query "tags" a user entered.
   */
  filters?: Filter[];

  /**
   * Fires when a user completes an entire filter query tag.
   */
  onFiltersChange?: (filters: Filter[]) => void;

  ref?: React.RefObject<HTMLDivElement>;
}

// @ts-expect-error - Mismatch of types doesn't matter here.
const StoreContext = React.createContext<Store>(null);
const useStore = () => React.use(StoreContext);

// @ts-expect-error - Mismatch of types doesn't matter here.
const MenuContext = React.createContext<MenuState>(null);
const useMenu = () => React.use(MenuContext);

function useFocusWithin(ref?: React.Ref<HTMLDivElement>) {
  const [hasFocusWithin, setHasFocusWithin] = React.useState(false);
  const internalRef = React.useRef<HTMLDivElement>(null);

  const refs = mergeRefs(ref, internalRef);

  React.useEffect(() => {
    const element = internalRef?.current;
    if (!element) return;

    const handleFocusIn = () => {
      setHasFocusWithin(true);
    };
    const handleFocusOut = (e: FocusEvent) => {
      if (!element.contains(e.relatedTarget as Node)) {
        setHasFocusWithin(false);
      }
    };

    element.addEventListener("focusin", handleFocusIn);
    element.addEventListener("focusout", handleFocusOut);

    return () => {
      element.removeEventListener("focusin", handleFocusIn);
      element.removeEventListener("focusout", handleFocusOut);
    };
  }, [ref]);

  return [hasFocusWithin, refs] as const;
}

function useHover(ref?: React.Ref<HTMLDivElement>) {
  const [hover, setHover] = React.useState(false);
  const internalRef = React.useRef<HTMLDivElement>(null);

  const refs = mergeRefs(ref, internalRef);

  React.useEffect(() => {
    const element = internalRef?.current;
    if (!element) return;

    const handleMouseEnter = () => {
      setHover(true);
    };

    const handleMouseLeave = () => {
      setHover(false);
    };

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [ref]);

  return [hover, refs] as const;
}

function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: React.Ref<T>,
  callback: () => void
) {
  const internalRef = React.useRef<T>(null);
  const refs = mergeRefs(ref, internalRef);

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const element = internalRef?.current;
      if (!element) return;

      if (!element.contains(e.target as Node)) {
        callback();
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [callback]);

  return [refs] as const;
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

/**
 * Adapted from https://github.com/facebook/react/issues/14490
 * Useful for creating refs that are expensive to initialize.
 */
function useLazyRef<T>(initializer: () => T): T {
  const ref = React.useRef<T>(null);

  if (ref.current === null) {
    ref.current = initializer();
  }

  return ref.current;
}

function useFilterState<T = unknown>(select: (state: State) => T): T {
  const store = useStore();
  const getSnapshot = () => select(store.snapshot());
  return React.useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}

const MENU_ITEM_ATTR = "[data-filtercombobox-menuitem]";
const MENU_ITEM_VALUE = "data-value";

export default function FilterCombobox({
  children,
  className,
  defaultValue,
  delimiter = ":",
  filters = [],
  label,
  ref,
  value,
  onFiltersChange,
}: FilterComboboxProps) {
  const state = useLazyRef<State>(() => ({
    delimiter,
    filter: value ?? defaultValue ?? "",
    filtered: [],
    open: false,
    tags: [...filters],
    type: "text",
    value: "",
  }));

  const columns = useLazyRef<Map<string, string>>(() => new Map());
  const operators = useLazyRef<Map<string, { value: string; column: string }>>(
    () => new Map()
  );
  const listeners = useLazyRef<Set<() => void>>(() => new Set());

  const menuId = React.useId();
  const labelId = React.useId();
  const inputId = React.useId();
  const containerRef = React.useRef<HTMLDivElement>(null);

  const [hasFocusWithin, focusRefs] = useFocusWithin(ref);
  const [refs] = useOnClickOutside(focusRefs, () => {
    store.setState("open", false);
  });

  const store: Store = React.useMemo(() => {
    return {
      subscribe: (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
      snapshot: () => {
        return state;
      },
      setState: (key, value) => {
        state[key] = value;

        if (key === "filter") {
          filterResults();
          selectFirstItem();
        }

        store.emit();
      },
      removeTag: (id: string) => {
        const tags = state.tags;
        const filteredTags = tags.filter((tag) => tag.id !== id);

        state.tags = filteredTags;
        onFiltersChange?.([...filteredTags]);
        store.emit();
      },
      emit: () => {
        listeners.forEach((l) => l());
      },
    };
  }, []);

  const menu: MenuState = React.useMemo(
    () => ({
      register: (step, id, value, columnLabel) => {
        switch (step) {
          case "column":
            columns.set(id, value.toLowerCase());
            break;
          case "operator":
            operators.set(id, {
              value: value.toLowerCase(),
              column: columnLabel!,
            });
            break;
          default:
            break;
        }

        if (!state.value) {
          selectFirstItem();
        }

        return () => {
          columns.delete(id);
          operators.delete(id);
        };
      },
      menuId,
      labelId,
      inputId,
    }),
    []
  );

  const filterResults = () => {
    if (!state.filter) return;
    const value = state.filter.split(delimiter);

    /**
     * You can replace this with a much more rigorous fuzzy search library
     * For the sake of time I'll just implement this simple filter
     */
    switch (value.length) {
      case 1:
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        state.filtered = Array.from(columns.entries()).filter(([_id, val]) => {
          return val.includes(value[0].toLowerCase());
        });
        break;
      case 2: {
        const selectedColumn = state.filter.split(delimiter)[0];

        state.filtered = Array.from(operators.entries())
          .filter(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ([_, metadata]) =>
              metadata.column.toLowerCase() === selectedColumn.toLowerCase()
          )
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          .filter(([_, metadata]) =>
            metadata.value.includes(value[1].toLowerCase())
          )
          .map(([id, metadata]) => [id, metadata.value]);
        break;
      }
      default:
        break;
    }
  };

  const hasLabel = React.Children.toArray(children).some(
    (child) => React.isValidElement(child) && child.type === Label
  );

  if (label && hasLabel) {
    console.warn(
      "You are using both the `label` prop and `Label` component. You should use one or the other."
    );
  }

  React.useEffect(() => {
    if (hasFocusWithin) {
      store.setState("open", hasFocusWithin);
    }
  }, [store, hasFocusWithin]);

  const selectFirstItem = () => {
    const item = getAllVisibleMenuItems()[0];
    const value = item?.getAttribute(MENU_ITEM_VALUE);
    store.setState("value", value || "");
  };

  const selectLastItem = () => {
    const items = getAllVisibleMenuItems();
    const lastItem = items[items.length - 1];
    const value = lastItem?.getAttribute(MENU_ITEM_VALUE);
    store.setState("value", value || "");
  };

  const getHighlightedItem = () => {
    return containerRef.current?.querySelector(
      `${MENU_ITEM_ATTR}[aria-selected="true"]`
    );
  };

  const getAllVisibleMenuItems = () => {
    return Array.from(
      containerRef.current?.querySelectorAll(`${MENU_ITEM_ATTR}`) || []
    );
  };

  const updateHighlightPosition = (direction: 1 | -1) => {
    const currentItem = getHighlightedItem();
    const menuItems = getAllVisibleMenuItems();
    const currentIndex = menuItems.findIndex((item) => item === currentItem);

    const newIndexElement = menuItems[currentIndex + direction];

    if (newIndexElement) {
      store.setState(
        "value",
        newIndexElement.getAttribute(MENU_ITEM_VALUE) || ""
      );
    }
  };

  return (
    <div
      ref={refs}
      className={className}
      tabIndex={-1}
      onKeyDown={(e) => {
        if (!e.defaultPrevented) {
          const snapshot = store.snapshot();

          switch (e.key) {
            case "Enter": {
              e.preventDefault();
              const filterValue = snapshot.filter.split(delimiter);

              // On value stage - if user hits Enter then create a Tag
              if (filterValue.length === 3) {
                const [column, operator, value] = filterValue;
                const filter: Filter = {
                  id: crypto.randomUUID(),
                  column,
                  operator,
                  value,
                };

                onFiltersChange?.([...snapshot.tags, filter]);
                store.setState("filter", "");
                store.setState("tags", [...snapshot.tags, filter]);
              }

              // Get highlighted item in list
              const item = getHighlightedItem();

              if (item) {
                const filterParts = state.filter.split(state.delimiter);
                const length = filterParts.length;
                const value = item.getAttribute(MENU_ITEM_VALUE) || "";

                if (length === 1) {
                  store.setState("filter", value);
                } else if (length === 2) {
                  store.setState("filter", `${filterParts[0]}:${value}`);
                }
              }

              break;
            }
            case "ArrowDown":
              e.preventDefault();
              updateHighlightPosition(1);
              break;
            case "ArrowUp":
              e.preventDefault();
              updateHighlightPosition(-1);
              break;
            case "Home":
              e.preventDefault();
              selectFirstItem();
              break;
            case "End":
              e.preventDefault();
              selectLastItem();
              break;
            case "Delete":
            case "Backspace":
              if (snapshot.filter === "" && snapshot.tags.length > 0) {
                e.preventDefault();
                const { column, operator, value } =
                  snapshot.tags[snapshot.tags.length - 1];

                store.setState("filter", `${column}:${operator}:${value}`);

                const newTags = snapshot.tags.slice(0, -1);
                store.setState("tags", newTags);
                onFiltersChange?.(newTags);
              }
              break;
          }
        }
      }}
      data-focused={hasFocusWithin}
      data-filtercombobox-root
    >
      {label && (
        <label id={labelId} htmlFor={inputId} style={srOnlyStyles}>
          {label}
        </label>
      )}
      <StoreContext.Provider value={store}>
        <MenuContext.Provider value={menu}>
          <div ref={containerRef} data-filtercombobox-container tabIndex={-1}>
            {children}
          </div>
        </MenuContext.Provider>
      </StoreContext.Provider>
    </div>
  );
}

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  ref?: React.Ref<HTMLLabelElement>;
}

/**
 * Standard label for the FilterCombobox.Input component
 * Alternatively, provide `label` prop to the FilterCombobox component for an a11y only label
 */
function Label({ ref, ...props }: LabelProps) {
  const menu = useMenu();
  return (
    <label
      {...props}
      id={menu.labelId}
      htmlFor={menu.inputId}
      ref={ref}
      data-filtercombobox-label
    ></label>
  );
}

interface EmptyProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
}

/**
 * Custom display for when no results are found while filtering the menu.
 */
function Empty({ className, children, ref, ...props }: EmptyProps) {
  const isEmpty = useFilterState((state) => state.filtered.length === 0);
  const isFiltering = useFilterState((state) => state.filter.length > 0);

  if (!isEmpty || !isFiltering) {
    return null;
  }

  return (
    <div data-filtercombobox-empty className={className} {...props} ref={ref}>
      {children}
    </div>
  );
}

interface FilterInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  ref?: React.Ref<HTMLInputElement>;
  value?: string;
  onValueChange?: (value: string) => void;
}

/**
 * Main input for interacting with combobox.
 * Filters items down within the Menu component based on current state.
 */
function FilterInput({
  ref,
  value,
  onValueChange,
  ...props
}: FilterInputProps) {
  const store = useStore();
  const menu = useMenu();

  const filter = useFilterState((state) => state.filter);
  const isOpen = useFilterState((state) => state.open);

  return (
    <input
      id={menu.inputId}
      ref={ref}
      {...props}
      role="combobox"
      aria-expanded={isOpen}
      aria-autocomplete="list"
      aria-labelledby={menu.labelId}
      autoCorrect="off"
      spellCheck="false"
      type="type"
      data-filtercombobox-input
      value={value ? value : filter}
      onChange={(e) => {
        if (!value) {
          store.setState("filter", e.target.value);
        }

        onValueChange?.(e.target.value);
      }}
    />
  );
}

interface MenuProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Controls value for aria-label */
  label?: string;
  children?: React.ReactNode;
}

function Menu({ children, label = "Suggestions", ...props }: MenuProps) {
  const store = useStore();
  const menu = useMenu();

  const delimiter = useFilterState((state) => state.delimiter);
  const filter = useFilterState((state) => state.filter);
  const filtered = useFilterState((state) => state.filtered);
  const isOpen = useFilterState((state) => state.open);

  const filterParts = filter.split(delimiter);

  if (!isOpen || filterParts.length === 3) {
    return null;
  }

  return (
    <SlotContext
      value={{
        column: {
          isVisible: filterParts.length === 1,
          getIsFiltered: (id: string) => {
            return filtered.some(([itemId]) => itemId === id);
          },
          onSelect: (value: string) => {
            store.setState("filter", `${value}`);
            store.setState("value", value);
          },
          onSelectType: (type: keyof typeof DEFAULT_OPERATORS) => {
            store.setState("type", type);
          },
        },
        operator: {
          isVisible: filterParts.length === 2,
          getIsFiltered: (id: string) => {
            return filtered.some(([itemId]) => itemId === id);
          },
          onSelect: (value: string) => {
            store.setState("filter", `${filterParts[0]}:${value}`);
            store.setState("value", value);
          },
        },
      }}
    >
      <div
        id={menu.menuId}
        {...props}
        tabIndex={-1}
        aria-label={label}
        role="listbox"
        aria-orientation="vertical"
        data-filtercombobox-menu
      >
        {children}
      </div>
    </SlotContext>
  );
}

interface MenuItemProps {
  id?: string;
  columnName?: string;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  value?: string;
  slot?: "column" | "operator";
  type?: keyof typeof DEFAULT_OPERATORS;
  isVisible?: boolean;
  onSelect?: (value: string) => void;
  onSelectType?: (type: keyof typeof DEFAULT_OPERATORS) => void;
  getIsFiltered?: (id: string) => boolean;
}

function MenuItem(props: MenuItemProps) {
  const {
    children,
    value: propValue,
    id: propId,
    slot = "column",
    columnName,
    isVisible,
    disabled,
    type = "text",
    onSelect,
    onSelectType,
    getIsFiltered,
    ...rest
  } = useSlotProps(props);

  const id = React.useId();
  const ref = React.useRef<HTMLDivElement>(null);
  const menu = useMenu();
  const filter = useFilterState((state) => state.filter);
  const [hovered, refs] = useHover(ref);

  const itemId = propId ?? id;
  const value = propValue ?? (typeof children === "string" ? children : "");

  const isSelected = useFilterState(
    (state) => state.value.toLowerCase() === value.toLowerCase()
  );

  useIsomorphicLayoutEffect(() => {
    return menu.register(slot, itemId, value, columnName);
  }, [slot, itemId, menu, value]);

  const handleSelect = () => {
    onSelect?.(value);
    onSelectType?.(type);
  };

  if (!isVisible || (filter && !getIsFiltered?.(itemId))) {
    return null;
  }

  return (
    <div
      ref={refs}
      id={itemId}
      role="option"
      data-value={value}
      data-disabled={disabled}
      aria-disabled={disabled}
      data-selected={isSelected}
      aria-selected={isSelected}
      data-hovered={hovered}
      data-filtercombobox-menuitem
      onClick={disabled ? undefined : handleSelect}
      {...rest}
    >
      {children}
    </div>
  );
}

interface OperatorsProps {
  column: Column;
}

function Operators({ column, ...props }: OperatorsProps & MenuItemProps) {
  const operators = column.operators || DEFAULT_OPERATORS[column.type] || [];

  return (
    <>
      {operators.map((op) => (
        <MenuItem
          key={op.id}
          {...props}
          slot="operator"
          columnName={column.label}
        >
          {op.label}
        </MenuItem>
      ))}
    </>
  );
}

function Tag({
  id,
  children,
  ...props
}: React.ComponentProps<"div"> & { id?: string }) {
  const store = useStore();

  const onRemove = () => {
    if (!id) return;
    store.removeTag(id);
  };

  const remove = {
    onClick: onRemove,
  };

  return (
    <SlotContext value={{ remove }}>
      <div {...props}>{children}</div>
    </SlotContext>
  );
}

/**
 * Auto render
 */
function Tags(props: React.ComponentProps<"div">) {
  const store = useStore();
  const tags = useFilterState((store) => store.tags);

  const onRemove = (id: string) => {
    store.removeTag(id);
  };

  if (tags.length === 0) {
    return null;
  }

  return (
    <div {...props} data-tags>
      {tags.map((tag) => (
        <div key={tag.id} data-tag>
          <span data-tag-text>
            {tag.column}:{tag.operator}:{tag.value}
          </span>
          <button
            type="button"
            data-tag-button
            onClick={() => onRemove(tag.id)}
          >
            <span style={srOnlyStyles}>
              Remove filter: {tag.column}:{tag.operator}:{tag.value}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
              data-tag-button-icon
              height={16}
              width={16}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

function Button(props: React.ComponentProps<"button"> & { slot?: string }) {
  props = useSlotProps(props, "button");
  return <button {...props} />;
}

const srOnlyStyles = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: "0",
  margin: "-1px",
  borderWidth: "0",
  overflow: "hidden",
  whiteSpace: "nowrap",
  clip: "rect(0, 0, 0, 0)",
} as const;

FilterCombobox.Empty = Empty;
FilterCombobox.Label = Label;
FilterCombobox.Input = FilterInput;
FilterCombobox.Menu = Menu;
FilterCombobox.MenuItem = MenuItem;
FilterCombobox.Operators = Operators;
FilterCombobox.Tags = Tags;
FilterCombobox.Tag = Tag;
FilterCombobox.Button = Button;
