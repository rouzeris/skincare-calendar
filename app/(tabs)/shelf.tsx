import React from 'react';
import { FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YStack, XStack, Text } from 'tamagui';
import { useCosmetics, Product } from '@/context/cosmetics';
import { useTheme } from '@/context/theme';
import { PageTitleBar } from '@/components/PageTitleBar';
import { Plus, Trash2, Clock, AlertCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { addMonths, differenceInDays, parseISO } from 'date-fns';
import { Image } from 'expo-image';

export default function ShelfScreen() {
  const { products, removeProduct } = useCosmetics();
  const router = useRouter();
  const { colors } = useTheme();

  const getExpirationStatus = (product: Product) => {
    if (!product.openedAt || !product.periodAfterOpening) return null;

    const openedDate = parseISO(product.openedAt);
    const expirationDate = addMonths(openedDate, product.periodAfterOpening);
    const daysLeft = differenceInDays(expirationDate, new Date());

    if (daysLeft < 0) return { status: 'expired', label: `Expired ${Math.abs(daysLeft)} days ago`, color: colors.error };
    if (daysLeft <= 30) return { status: 'warning', label: `${daysLeft} days left`, color: '#F59E0B' };
    return { status: 'good', label: `${daysLeft} days left`, color: colors.success };
  };

  const renderItem = ({ item }: { item: Product }) => {
    const expiration = getExpirationStatus(item);

    return (
      <XStack
        alignItems="center"
        justifyContent="space-between"
        borderRadius={20}
        padding={16}
        marginBottom={16}
        backgroundColor={colors.card}
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.05}
        shadowRadius={8}
        elevation={2}
      >
        <XStack alignItems="center" flex={1}>
          <YStack
            width={56}
            height={56}
            borderRadius={16}
            justifyContent="center"
            alignItems="center"
            marginRight={16}
            overflow="hidden"
            backgroundColor={colors.border}
          >
            {item.image ? (
              <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
            ) : (
              <Text fontSize={18} fontWeight="600" textTransform="uppercase" color={colors.subtext}>
                {item.brand.substring(0, 1)}{item.name.substring(0, 1)}
              </Text>
            )}
          </YStack>
          <YStack flex={1}>
            <Text
              fontSize={12}
              fontWeight="600"
              marginBottom={2}
              textTransform="uppercase"
              letterSpacing={0.5}
              color={colors.tint}
            >
              {item.brand}
            </Text>
            <Text fontSize={16} fontWeight="600" marginBottom={6} color={colors.text}>
              {item.name}
            </Text>

            {expiration ? (
              <XStack alignItems="center">
                <YStack marginRight={4}>
                  {expiration.status === 'expired' ? (
                    <AlertCircle size={14} color={expiration.color} />
                  ) : (
                    <Clock size={14} color={expiration.color} />
                  )}
                </YStack>
                <Text fontSize={12} fontWeight="500" color={expiration.color}>
                  {expiration.label}
                </Text>
              </XStack>
            ) : (
              <Text fontSize={12} color={colors.subtext}>Not opened yet</Text>
            )}
          </YStack>
        </XStack>

        <YStack
          padding={8}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => removeProduct(item.id)}
        >
          <Trash2 size={20} color={colors.subtext} />
        </YStack>
      </XStack>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <PageTitleBar
        title="My Shelf"
        rightElement={
          <YStack
            width={40}
            height={40}
            borderRadius={20}
            justifyContent="center"
            alignItems="center"
            backgroundColor={colors.tint}
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.3}
            shadowRadius={8}
            elevation={4}
            onPress={() => router.push('/add-product')}
          >
            <Plus size={24} color="#FFF" />
          </YStack>
        }
      />

      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingTop: 10 }}
        ListEmptyComponent={
          <YStack alignItems="center" justifyContent="center" paddingTop={60}>
            <Text fontSize={18} fontWeight="600" marginBottom={8} color={colors.text}>
              Your shelf is empty
            </Text>
            <Text
              fontSize={14}
              textAlign="center"
              marginBottom={24}
              paddingHorizontal={40}
              lineHeight={20}
              color={colors.subtext}
            >
              Add your skincare products to track expiration dates and build your routine.
            </Text>
            <YStack
              paddingHorizontal={24}
              paddingVertical={14}
              borderRadius={24}
              backgroundColor={colors.tint}
              onPress={() => router.push('/add-product')}
            >
              <Text color="#FFFFFF" fontWeight="600" fontSize={16}>
                Add First Product
              </Text>
            </YStack>
          </YStack>
        }
      />
    </SafeAreaView>
  );
}
