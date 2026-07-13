import createContextHook from "@nkzw/create-context-hook";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createProduct,
  type CreateProductInput,
  localDataQueryKeys,
  readProducts,
  removeProduct,
} from "@/utils/local-data";

export type { Frequency, Product } from "@/utils/local-data";

export const [CosmeticsProvider, useCosmetics] = createContextHook(() => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: localDataQueryKeys.cosmetics,
    queryFn: readProducts,
  });

  const addMutation = useMutation({
    mutationFn: (input: CreateProductInput) => createProduct(input),
    onSuccess: ({ products, routineConfig }) => {
      queryClient.setQueryData(localDataQueryKeys.cosmetics, products);
      queryClient.setQueryData(localDataQueryKeys.routineConfig, routineConfig);
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeProduct,
    onSuccess: ({ products, routineConfig }) => {
      queryClient.setQueryData(localDataQueryKeys.cosmetics, products);
      queryClient.setQueryData(localDataQueryKeys.routineConfig, routineConfig);
    },
  });

  return {
    products: query.data || [],
    isLoading: query.isLoading,
    addProduct: addMutation.mutate,
    removeProduct: removeMutation.mutate,
  };
});
