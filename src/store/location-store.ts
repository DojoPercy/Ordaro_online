import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { UserLocation } from "@/types";

interface LocationState {
  location: UserLocation | null;
  setLocation: (loc: UserLocation) => void;
  clearLocation: () => void;
  hasPermission: boolean | null;
  setPermission: (val: boolean) => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      location: null,
      hasPermission: null,
      setLocation: (loc) => set({ location: loc, hasPermission: true }),
      clearLocation: () => set({ location: null }),
      setPermission: (val) => set({ hasPermission: val }),
    }),
    {
      name: "odaro-location-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
