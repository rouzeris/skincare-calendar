import React, { useState, useMemo } from 'react';
import { Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YStack, XStack, Text, ScrollView } from 'tamagui';
import { useRouter } from 'expo-router';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from 'date-fns';
import { X, ChevronLeft, ChevronRight, Sun, Moon, Check } from 'lucide-react-native';

import { useRoutine } from '@/context/routine';
import { useCosmetics } from '@/context/cosmetics';
import { useTheme } from '@/context/theme';

export default function CalendarScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { routineHistory } = useRoutine();
  const { products } = useCosmetics();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    const startDay = getDay(start);
    const emptyDays = Array(startDay).fill(null);
    
    return [...emptyDays, ...days];
  }, [currentMonth]);

  const getDateUsage = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayHistory = routineHistory[dateKey];
    
    if (!dayHistory) return null;
    
    const morningCount = dayHistory.morning?.length || 0;
    const eveningCount = dayHistory.evening?.length || 0;
    
    return { morning: morningCount, evening: eveningCount, total: morningCount + eveningCount };
  };

  const getProductName = (id: string) => {
    const product = products.find(p => p.id === id);
    return product ? `${product.brand} - ${product.name}` : 'Unknown Product';
  };

  const selectedDateUsage = useMemo(() => {
    if (!selectedDate) return null;
    
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const dayHistory = routineHistory[dateKey];
    
    if (!dayHistory) return null;
    
    return {
      morning: dayHistory.morning || [],
      evening: dayHistory.evening || []
    };
  }, [selectedDate, routineHistory]);

  return (
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
        <YStack padding={8} marginLeft={-8} onPress={() => router.back()}>
          <X size={24} color={colors.text} />
        </YStack>
        <Text fontSize={18} fontWeight="600" color={colors.text}>Usage Calendar</Text>
        <YStack width={40} />
      </XStack>

      <ScrollView flex={1} contentContainerStyle={{ padding: 20 }}>
        <XStack alignItems="center" justifyContent="space-between" marginBottom={20}>
          <YStack
            padding={10}
            borderRadius={12}
            backgroundColor={colors.card}
            onPress={() => setCurrentMonth(prev => subMonths(prev, 1))}
          >
            <ChevronLeft size={20} color={colors.text} />
          </YStack>
          
          <Text fontSize={20} fontWeight="600" color={colors.text}>
            {format(currentMonth, 'MMMM yyyy')}
          </Text>
          
          <YStack
            padding={10}
            borderRadius={12}
            backgroundColor={colors.card}
            onPress={() => setCurrentMonth(prev => addMonths(prev, 1))}
          >
            <ChevronRight size={20} color={colors.text} />
          </YStack>
        </XStack>

        <XStack marginBottom={10}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <YStack key={index} flex={1} alignItems="center" paddingVertical={8}>
              <Text fontSize={12} fontWeight="600" color={colors.subtext}>{day}</Text>
            </YStack>
          ))}
        </XStack>

        <YStack flexDirection="row" flexWrap="wrap">
          {calendarDays.map((day, index) => {
            if (!day) {
              return <YStack key={`empty-${index}`} width="14.28%" aspectRatio={1} />;
            }

            const usage = getDateUsage(day);
            const isToday = isSameDay(day, new Date());
            const isSelected = selectedDate && isSameDay(day, selectedDate);

            return (
              <YStack
                key={day.toISOString()}
                width="14.28%"
                aspectRatio={1}
                padding={2}
              >
                <YStack
                  flex={1}
                  borderRadius={12}
                  justifyContent="center"
                  alignItems="center"
                  backgroundColor={isSelected ? colors.tint : isToday ? colors.card : 'transparent'}
                  borderWidth={isToday && !isSelected ? 1 : 0}
                  borderColor={colors.tint}
                  onPress={() => setSelectedDate(day)}
                >
                  <Text
                    fontSize={14}
                    fontWeight={isToday || isSelected ? '600' : '400'}
                    color={isSelected ? '#FFF' : colors.text}
                  >
                    {format(day, 'd')}
                  </Text>
                  
                  {usage && usage.total > 0 && (
                    <XStack marginTop={2} gap={2}>
                      {usage.morning > 0 && (
                        <YStack
                          width={6}
                          height={6}
                          borderRadius={3}
                          backgroundColor={isSelected ? 'rgba(255,255,255,0.7)' : '#FFA726'}
                        />
                      )}
                      {usage.evening > 0 && (
                        <YStack
                          width={6}
                          height={6}
                          borderRadius={3}
                          backgroundColor={isSelected ? 'rgba(255,255,255,0.7)' : '#5C6BC0'}
                        />
                      )}
                    </XStack>
                  )}
                </YStack>
              </YStack>
            );
          })}
        </YStack>

        <XStack marginTop={16} justifyContent="center" gap={20}>
          <XStack alignItems="center" gap={6}>
            <YStack width={10} height={10} borderRadius={5} backgroundColor="#FFA726" />
            <Text fontSize={12} color={colors.subtext}>Morning</Text>
          </XStack>
          <XStack alignItems="center" gap={6}>
            <YStack width={10} height={10} borderRadius={5} backgroundColor="#5C6BC0" />
            <Text fontSize={12} color={colors.subtext}>Evening</Text>
          </XStack>
        </XStack>

        {selectedDate && selectedDateUsage && (
          <YStack marginTop={24}>
            <Text fontSize={16} fontWeight="600" marginBottom={12} color={colors.text}>
              {format(selectedDate, 'EEEE, MMMM d')}
            </Text>

            {selectedDateUsage.morning.length > 0 && (
              <YStack marginBottom={16}>
                <XStack alignItems="center" marginBottom={8} gap={6}>
                  <Sun size={16} color="#FFA726" />
                  <Text fontSize={14} fontWeight="600" color={colors.text}>Morning</Text>
                </XStack>
                {selectedDateUsage.morning.map((productId, index) => (
                  <XStack
                    key={productId}
                    padding={12}
                    borderRadius={12}
                    marginBottom={index < selectedDateUsage.morning.length - 1 ? 8 : 0}
                    alignItems="center"
                    backgroundColor={colors.card}
                  >
                    <Check size={16} color={colors.success} />
                    <Text fontSize={14} marginLeft={8} flex={1} color={colors.text}>
                      {getProductName(productId)}
                    </Text>
                  </XStack>
                ))}
              </YStack>
            )}

            {selectedDateUsage.evening.length > 0 && (
              <YStack>
                <XStack alignItems="center" marginBottom={8} gap={6}>
                  <Moon size={16} color="#5C6BC0" />
                  <Text fontSize={14} fontWeight="600" color={colors.text}>Evening</Text>
                </XStack>
                {selectedDateUsage.evening.map((productId, index) => (
                  <XStack
                    key={productId}
                    padding={12}
                    borderRadius={12}
                    marginBottom={index < selectedDateUsage.evening.length - 1 ? 8 : 0}
                    alignItems="center"
                    backgroundColor={colors.card}
                  >
                    <Check size={16} color={colors.success} />
                    <Text fontSize={14} marginLeft={8} flex={1} color={colors.text}>
                      {getProductName(productId)}
                    </Text>
                  </XStack>
                ))}
              </YStack>
            )}

            {selectedDateUsage.morning.length === 0 && selectedDateUsage.evening.length === 0 && (
              <Text fontSize={14} textAlign="center" color={colors.subtext}>
                No products used on this day
              </Text>
            )}
          </YStack>
        )}

        {selectedDate && !selectedDateUsage && (
          <YStack marginTop={24} alignItems="center">
            <Text fontSize={14} color={colors.subtext}>
              No routine data for {format(selectedDate, 'MMMM d, yyyy')}
            </Text>
          </YStack>
        )}

        <YStack height={40} />
      </ScrollView>
    </SafeAreaView>
  );
}
