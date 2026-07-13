import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  localDataKeys,
  localDataQueryKeys,
  readRoutineConfig,
  removeProductFromRoutine,
  setRoutineConfig,
  type RoutineHistory,
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

  const updateConfigMutation = useMutation({
    mutationFn: setRoutineConfig,
    onSuccess: (updated) => {
      queryClient.setQueryData(localDataQueryKeys.routineConfig, updated);
    },
  });

  // --- History (Which products were completed on a given date) ---
  const historyQuery = useQuery({
    queryKey: localDataQueryKeys.routineHistory,
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(localDataKeys.routineHistory);
      return stored ? (JSON.parse(stored) as RoutineHistory) : {};
    },
  });

  const toggleCompletionMutation = useMutation({
    mutationFn: async ({
      date,
      timeOfDay,
      productId,
    }: {
      date: string;
      timeOfDay: TimeOfDay;
      productId: string;
    }) => {
      const currentHistory = historyQuery.data || {};
      const dayEntry = currentHistory[date] || { morning: [], evening: [] };
      const completedList = dayEntry[timeOfDay] || [];

      let newCompletedList;
      if (completedList.includes(productId)) {
        newCompletedList = completedList.filter((id) => id !== productId);
      } else {
        newCompletedList = [...completedList, productId];
      }

      const updatedHistory = {
        ...currentHistory,
        [date]: {
          ...dayEntry,
          [timeOfDay]: newCompletedList,
        },
      };

      await AsyncStorage.setItem(
        localDataKeys.routineHistory,
        JSON.stringify(updatedHistory),
      );
      return updatedHistory;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(localDataQueryKeys.routineHistory, updated);
    },
  });

  const removeFromRoutineMutation = useMutation({
    mutationFn: async ({
      productId,
      timeOfDay,
    }: {
      productId: string;
      timeOfDay: TimeOfDay;
    }) => {
      return removeProductFromRoutine(productId, timeOfDay);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(localDataQueryKeys.routineConfig, updated);
    },
  });

  return {
    routineConfig: configQuery.data || { morning: [], evening: [] },
    routineHistory: historyQuery.data || {},
    toggleCompletion: toggleCompletionMutation.mutate,
    removeFromRoutine: removeFromRoutineMutation.mutate,
    setRoutineConfig: updateConfigMutation.mutate,
    isLoading: configQuery.isLoading || historyQuery.isLoading,
  };
});
