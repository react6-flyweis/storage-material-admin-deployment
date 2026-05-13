import { create } from "zustand";

type EmployeeSidebarCounts = {
  total: number;
  byTeam: Record<string, number>;
};

interface EmployeeCountsState extends EmployeeSidebarCounts {
  setEmployeeCounts: (counts: EmployeeSidebarCounts) => void;
}

export const useEmployeeCountsStore = create<EmployeeCountsState>((set) => ({
  total: 0,
  byTeam: {},
  setEmployeeCounts: (counts) => {
    set({
      total: counts.total,
      byTeam: counts.byTeam,
    });
  },
}));
