import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartItem, MenuItem, MenuVariant, OrderModifier } from "@/types";

interface CartState {
  items: CartItem[];
  branchId: string | null;
  companySlug: string | null;
  addItem: (item: Omit<CartItem, "tempId">) => void;
  removeItem: (tempId: string) => void;
  updateQuantity: (tempId: string, delta: number) => void;
  clearCart: () => void;
  setBranchContext: (slug: string, branchId: string) => void;
  subtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      branchId: null,
      companySlug: null,

      setBranchContext: (slug, branchId) => {
        const current = get();
        // If switching branch or company, allow cart reset logic or handle multi-branch restrictions
        if (current.branchId && current.branchId !== branchId) {
          console.warn(
            "Switching branch context - consider prompting user to clear cart",
          );
          // For simplicity, we just update context for now, ideally prompt user
        }
        set({ companySlug: slug, branchId });
      },

      addItem: (newItem) => {
        const itemWithId = { ...newItem, tempId: crypto.randomUUID() };
        set((state) => ({ items: [...state.items, itemWithId] }));
      },

      removeItem: (tempId) => {
        set((state) => ({
          items: state.items.filter((i) => i.tempId !== tempId),
        }));
      },

      updateQuantity: (tempId, delta) => {
        set((state) => ({
          items: state.items
            .map((item) => {
              if (item.tempId === tempId) {
                const newQty = Math.max(0, item.quantity + delta);
                return { ...item, quantity: newQty };
              }
              return item;
            })
            .filter((i) => i.quantity > 0),
        }));
      },

      clearCart: () => set({ items: [] }),

      subtotal: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          let itemPrice = item.menuItem.branchPrice ?? item.menuItem.basePrice;
          if (item.variant) {
            itemPrice = item.variant.price;
          }
          const modifiersCost = item.modifiers.reduce(
            (sum, mod) => sum + mod.price,
            0,
          );
          return total + (itemPrice + modifiersCost) * item.quantity;
        }, 0);
      },
    }),
    {
      name: "odaro-cart-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
