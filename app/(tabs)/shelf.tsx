import React, { useState } from 'react';
import { FlatList, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YStack, XStack, Text, ScrollView } from 'tamagui';
import { useCosmetics, Product } from '@/context/cosmetics';
import { useTheme } from '@/context/theme';
import { PageTitleBar } from '@/components/PageTitleBar';
import { Plus, Trash2, Clock, AlertCircle, FlaskConical, X, Check, AlertTriangle, Lightbulb } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { addMonths, differenceInDays, parseISO } from 'date-fns';
import { Image } from 'expo-image';
import { INGREDIENT_COMPATIBILITY, GENERAL_TIPS } from '@/constants/ingredients';

export default function ShelfScreen() {
  const { products, removeProduct } = useCosmetics();
  const router = useRouter();
  const { colors } = useTheme();
  const [showCompatibilityModal, setShowCompatibilityModal] = useState(false);
  const [expandedIngredient, setExpandedIngredient] = useState<string | null>(null);

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
          <XStack gap={10}>
            <YStack
              width={40}
              height={40}
              borderRadius={20}
              justifyContent="center"
              alignItems="center"
              backgroundColor={colors.card}
              onPress={() => setShowCompatibilityModal(true)}
            >
              <FlaskConical size={20} color={colors.tint} />
            </YStack>
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
          </XStack>
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

      <Modal visible={showCompatibilityModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
          <XStack
            alignItems="center"
            justifyContent="space-between"
            paddingHorizontal={20}
            paddingTop={12}
            paddingBottom={15}
            borderBottomWidth={1}
            borderBottomColor={colors.border}
          >
            <YStack padding={8} marginLeft={-8} onPress={() => setShowCompatibilityModal(false)}>
              <X size={24} color={colors.text} />
            </YStack>
            <Text fontSize={18} fontWeight="600" color={colors.text}>Ingredient Guide</Text>
            <YStack width={40} />
          </XStack>

          <ScrollView flex={1} contentContainerStyle={{ padding: 20 }}>
            <YStack
              padding={16}
              borderRadius={16}
              marginBottom={20}
              backgroundColor={colors.tint + '15'}
            >
              <XStack alignItems="center" marginBottom={8}>
                <Lightbulb size={18} color={colors.tint} />
                <Text fontSize={14} fontWeight="600" marginLeft={8} color={colors.tint}>Quick Tips</Text>
              </XStack>
              {GENERAL_TIPS.map((tip, index) => (
                <XStack key={index} alignItems="flex-start" marginBottom={index < GENERAL_TIPS.length - 1 ? 6 : 0}>
                  <Text fontSize={12} color={colors.tint} marginRight={8}>•</Text>
                  <Text fontSize={13} flex={1} lineHeight={18} color={colors.text}>{tip}</Text>
                </XStack>
              ))}
            </YStack>

            <Text fontSize={16} fontWeight="600" marginBottom={12} color={colors.text}>Active Ingredients</Text>

            {INGREDIENT_COMPATIBILITY.map((ingredient, index) => {
              const isExpanded = expandedIngredient === ingredient.name;
              
              return (
                <YStack
                  key={index}
                  borderRadius={16}
                  marginBottom={12}
                  overflow="hidden"
                  backgroundColor={colors.card}
                >
                  <XStack
                    padding={16}
                    alignItems="center"
                    justifyContent="space-between"
                    onPress={() => setExpandedIngredient(isExpanded ? null : ingredient.name)}
                  >
                    <YStack flex={1}>
                      <Text fontSize={15} fontWeight="600" color={colors.text}>{ingredient.name}</Text>
                      <Text fontSize={12} marginTop={2} color={colors.subtext}>{ingredient.description}</Text>
                    </YStack>
                    <YStack
                      width={28}
                      height={28}
                      borderRadius={14}
                      justifyContent="center"
                      alignItems="center"
                      backgroundColor={colors.border}
                      rotation={isExpanded ? 180 : 0}
                    >
                      <Text fontSize={12} color={colors.subtext}>{isExpanded ? '▲' : '▼'}</Text>
                    </YStack>
                  </XStack>

                  {isExpanded && (
                    <YStack paddingHorizontal={16} paddingBottom={16}>
                      <YStack
                        padding={12}
                        borderRadius={12}
                        marginBottom={8}
                        backgroundColor={colors.success + '15'}
                      >
                        <XStack alignItems="center" marginBottom={6}>
                          <Check size={14} color={colors.success} />
                          <Text fontSize={13} fontWeight="600" marginLeft={6} color={colors.success}>Works well with</Text>
                        </XStack>
                        <Text fontSize={13} lineHeight={20} color={colors.text}>
                          {ingredient.goodWith.join(', ')}
                        </Text>
                      </YStack>

                      {ingredient.avoidWith.length > 0 && (
                        <YStack
                          padding={12}
                          borderRadius={12}
                          backgroundColor={colors.error + '15'}
                        >
                          <XStack alignItems="center" marginBottom={6}>
                            <AlertTriangle size={14} color={colors.error} />
                            <Text fontSize={13} fontWeight="600" marginLeft={6} color={colors.error}>Avoid combining with</Text>
                          </XStack>
                          <Text fontSize={13} lineHeight={20} color={colors.text}>
                            {ingredient.avoidWith.join(', ')}
                          </Text>
                        </YStack>
                      )}
                    </YStack>
                  )}
                </YStack>
              );
            })}

            <YStack height={40} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
