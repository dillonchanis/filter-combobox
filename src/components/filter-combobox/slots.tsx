import * as React from "react";

type Slots = Record<string, Record<string, unknown>>;
export const SlotContext = React.createContext<Slots>({});

export function useSlotProps<Props>(
  props: Props & { slot?: string },
  defaultSlot?: string
) {
  const slot = props.slot ?? defaultSlot;
  if (!slot) return props;

  const slots = React.use(SlotContext);

  return { ...slots[slot], slot, ...props } as Props;
}
