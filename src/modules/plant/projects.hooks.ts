import { useQuery } from "@tanstack/react-query";
import {
  getPlantProjectsProvider,
  getPlantProjectsStatsProvider,
  type GetPlantProjectsParams,
} from "./projects.api";

export const PLANT_PROJECTS_QUERY_KEY = ["plant", "projects"] as const;
export const PLANT_PROJECTS_STATS_QUERY_KEY = ["plant", "projects", "stats"] as const;

export function usePlantProjectsQuery(params: GetPlantProjectsParams) {
  return useQuery({
    queryKey: [...PLANT_PROJECTS_QUERY_KEY, params],
    queryFn: () => getPlantProjectsProvider(params),
    placeholderData: (previousData) => previousData,
  });
}

export function usePlantProjectsStatsQuery(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: [...PLANT_PROJECTS_STATS_QUERY_KEY, startDate, endDate],
    queryFn: () => getPlantProjectsStatsProvider(startDate, endDate),
    placeholderData: (previousData) => previousData,
  });
}
