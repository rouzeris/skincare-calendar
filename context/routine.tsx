import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type TimeOfDay = "morning" | "evening";

export type RoutineConfig = {
  morning: string[]; // Product IDs
  evening: string[]; // Product IDs
};

export type RoutineHistory = Record<
  string,
  { morning: string[]; evening: string[] }
>;

const CONFIG_KEY = "routine_config";
const HISTORY_KEY = "routine_history";

export const [RoutineProvider, useRoutine] = createContextHook(() => {
  const queryClient = useQueryClient();

  // --- Configuration (Which products are in the routine) ---
  const configQuery = useQuery({
    queryKey: ["routineConfig"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(CONFIG_KEY);
      return stored
        ? (JSON.parse(stored) as RoutineConfig)
        : { morning: [], evening: [] };
    },
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (newConfig: RoutineConfig) => {
      await AsyncStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig));
      return newConfig;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["routineConfig"], updated);
    },
  });

  // --- History (Which products were completed on a given date) ---
  const historyQuery = useQuery({
    queryKey: ["routineHistory"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(HISTORY_KEY);
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

      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
      return updatedHistory;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["routineHistory"], updated);
    },
  });

  const addToRoutinesMutation = useMutation({
    mutationFn: async ({
      productId,
      times,
    }: {
      productId: string;
      times: TimeOfDay[];
    }) => {
      const currentConfig = configQuery.data || { morning: [], evening: [] };
      const newConfig = {
        morning:
          times.includes("morning") &&
          !currentConfig.morning.includes(productId)
            ? [...currentConfig.morning, productId]
            : currentConfig.morning,
        evening:
          times.includes("evening") &&
          !currentConfig.evening.includes(productId)
            ? [...currentConfig.evening, productId]
            : currentConfig.evening,
      };
      await AsyncStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig));
      return newConfig;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["routineConfig"], updated);
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
      const currentConfig = configQuery.data || { morning: [], evening: [] };

      const newConfig = {
        ...currentConfig,
        [timeOfDay]: currentConfig[timeOfDay].filter((id) => id !== productId),
      };
      await AsyncStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig));
      return newConfig;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["routineConfig"], updated);
    },
  });

  return {
    routineConfig: configQuery.data || { morning: [], evening: [] },
    routineHistory: historyQuery.data || {},
    toggleCompletion: toggleCompletionMutation.mutate,
    addToRoutines: addToRoutinesMutation.mutate,
    removeFromRoutine: removeFromRoutineMutation.mutate,
    setRoutineConfig: updateConfigMutation.mutate,
    isLoading: configQuery.isLoading || historyQuery.isLoading,
  };
});
