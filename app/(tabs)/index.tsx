import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, addDays, isSameDay, subDays, differenceInDays } from 'date-fns';
import { Check, Sun, Moon } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { useRoutine, TimeOfDay } from '@/context/routine';
import { useCosmetics } from '@/context/cosmetics';
import { useTheme } from '@/context/theme';
import { PageTitleBar } from '@/components/PageTitleBar';

export default function RoutineScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { routineConfig, routineHistory, toggleCompletion } = useRoutine();
  const { products } = useCosmetics();
  const { colors } = useTheme();
  const router = useRouter();

  const calendarDays = useMemo(() => {
    const today = new Date();
    const start = subDays(today, 7);
    return Array.from({ length: 14 }).map((_, i) => addDays(start, i));
  }, []);

  const getProductDetails = (id: string) => products.find((p) => p.id === id);

  const getVisibleProducts = (productIds: string[]) => {
    return productIds.filter((id) => {
      const product = getProductDetails(id);
      if (!product) return false;

      if (!product.frequency || product.frequency.type === 'daily') return true;

      if (product.frequency.type === 'weekly') {
        const currentDay = selectedDate.getDay();
        return product.frequency.daysOfWeek.includes(currentDay);
      }

      if (product.frequency.type === 'interval') {
        const startDate = product.openedAt ? new Date(product.openedAt) : new Date();
        const diff = differenceInDays(selectedDate, startDate);
        
        if (diff < 0) return false;
        
        return diff % product.frequency.days === 0;
      }

      return true;
    });
  };

  const isCompleted = (productId: string, timeOfDay: TimeOfDay) => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const dayHistory = routineHistory[dateKey];
    return dayHistory?.[timeOfDay]?.includes(productId) ?? false;
  };

  const handleToggle = (productId: string, timeOfDay: TimeOfDay) => {
    toggleCompletion({
      date: format(selectedDate, 'yyyy-MM-dd'),
      timeOfDay,
      productId,
    });
  };

  const renderRoutineSection = (title: string, icon: React.ReactNode, productIds: string[], timeOfDay: TimeOfDay) => {
    const visibleProductIds = getVisibleProducts(productIds);
    if (visibleProductIds.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>{icon}</View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        </View>
        <View style={styles.cardContainer}>
          {visibleProductIds.map((id, index) => {
            const product = getProductDetails(id);
            if (!product) return null;
            const completed = isCompleted(id, timeOfDay);
            const isLast = index === visibleProductIds.length - 1;

            return (
              <View key={id} style={!isLast ? styles.taskCardWrapper : undefined}>
                <TouchableOpacity
                  style={[
                    styles.taskCard, 
                    { backgroundColor: colors.card, borderColor: 'transparent' },
                    completed && { backgroundColor: colors.background, shadowOpacity: 0, elevation: 0 }
                  ]}
                  onPress={() => handleToggle(id, timeOfDay)}
                  activeOpacity={0.7}
                >
                  <View style={styles.taskContent}>
                    <Text style={[styles.productBrand, { color: colors.tint }, completed && styles.textCompleted]}>{product.brand}</Text>
                    <Text style={[styles.productName, { color: colors.text }, completed && styles.textCompleted]}>{product.name}</Text>
                  </View>
                  <View style={[styles.checkbox, { borderColor: colors.border }, completed && { backgroundColor: colors.tint, borderColor: colors.tint }]}>
                    {completed && <Check size={14} color="#FFF" strokeWidth={3} />}
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const isEmpty = routineConfig.morning.length === 0 && routineConfig.evening.length === 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <PageTitleBar title="My Routine" />

      <View style={styles.calendarContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.calendarContent}
        >
          {calendarDays.map((date) => {
            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, new Date());
            
            return (
              <TouchableOpacity
                key={date.toISOString()}
                style={[
                  styles.dayItem, 
                  isSelected && { backgroundColor: colors.tint }
                ]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[styles.dayName, { color: colors.subtext }, isSelected && styles.dayTextSelected]}>
                  {format(date, 'EEE')}
                </Text>
                <View style={[
                  styles.dayNumberContainer, 
                  isToday && !isSelected && { backgroundColor: colors.border }
                ]}>
                  <Text style={[
                    styles.dayNumber, 
                    { color: colors.text },
                    isSelected && styles.dayTextSelected,
                    isToday && !isSelected && { color: colors.text }
                  ]}>
                    {format(date, 'd')}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {isEmpty ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.text }]}>Your routine is empty.</Text>
            <Text style={[styles.emptySubtext, { color: colors.subtext }]}>Add products to your shelf and assign them to your routine to get started.</Text>
            <TouchableOpacity 
              style={[styles.emptyButton, { backgroundColor: colors.tint }]}
              onPress={() => router.push('/(tabs)/shelf')}
            >
              <Text style={styles.emptyButtonText}>Go to Shelf</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {renderRoutineSection('Morning', <Sun size={20} color={colors.tint} />, routineConfig.morning, 'morning')}
            {renderRoutineSection('Evening', <Moon size={20} color={colors.text} />, routineConfig.evening, 'evening')}
            
            {(routineConfig.morning.length > 0 || routineConfig.evening.length > 0) && (
               <View style={styles.footer}>
                 <Text style={[styles.footerText, { color: colors.subtext }]}>
                   {format(selectedDate, 'EEEE, MMMM do')}
                 </Text>
               </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendarContainer: {
    marginBottom: 10,
  },
  calendarContent: {
    paddingHorizontal: 15,
  },
  dayItem: {
    width: 50,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  dayName: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '500' as const,
    textTransform: 'uppercase',
  },
  dayNumberContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  dayTextSelected: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  cardContainer: {
  },
  taskCardWrapper: {
    marginBottom: 12,
  },
  taskCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
  },
  taskContent: {
    flex: 1,
  },
  productBrand: {
    fontSize: 12,
    fontWeight: '600' as const,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  textCompleted: {
    opacity: 0.5,
    textDecorationLine: 'line-through',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600' as const,
    fontSize: 16,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
  }
});
