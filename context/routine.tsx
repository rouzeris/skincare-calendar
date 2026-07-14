import createContextHook from "@nkzw/create-context-hook";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  localDataQueryKeys,
  readRoutineConfig,
  readRoutineHistory,
  toggleRoutineCompletion,
  type TimeOfDay,
} from "@/utils/local-data";

export type {
  RoutineConfig,
  RoutineHistory,
  TimeOfDay,
} from "@/utils/local-data";

export const [RoutineProvider, useRoutine] = createContextHook(() => {
  const queryClient = useQueryClient();

  // --- Configuration (Which products are in the routine) ---
  const configQuery = useQuery({
    queryKey: localDataQueryKeys.routineConfig,
    queryFn: readRoutineConfig,
  });

  // --- History (Which products were completed on a given date) ---
  const historyQuery = useQuery({
    queryKey: localDataQueryKeys.routineHistory,
    queryFn: readRoutineHistory,
  });

  const toggleCompletionMutation = useMutation({
    mutationFn: (input: {
      date: string;
      timeOfDay: TimeOfDay;
      productId: string;
    }) => toggleRoutineCompletion(input),
    onSuccess: (updated) => {
      queryClient.setQueryData(localDataQueryKeys.routineHistory, updated);
    },
  });

  return {
    routineConfig: configQuery.data || { morning: [], evening: [] },
    routineHistory: historyQuery.data || {},
    toggleCompletion: toggleCompletionMutation.mutate,
    isLoading: configQuery.isLoading || historyQuery.isLoading,
  };
});
