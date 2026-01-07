import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    if (daysLeft <= 30) return { status: 'warning', label: `${daysLeft} days left`, color: '#F59E0B' }; // Amber 500
    return { status: 'good', label: `${daysLeft} days left`, color: colors.success };
  };

  const renderItem = ({ item }: { item: Product }) => {
    const expiration = getExpirationStatus(item);

    return (
      <View style={[styles.card, styles.cardWrapper, { backgroundColor: colors.card }]}>
        <View style={styles.cardContent}>
          <View style={[styles.imagePlaceholder, styles.imageWrapper, { backgroundColor: colors.border }]}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.productImage} contentFit="cover" />
            ) : (
              <Text style={[styles.initials, { color: colors.subtext }]}>{item.brand.substring(0, 1)}{item.name.substring(0, 1)}</Text>
            )}
          </View>
          <View style={styles.info}>
            <Text style={[styles.brand, { color: colors.tint }]}>{item.brand}</Text>
            <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
            
            {expiration ? (
               <View style={styles.expirationContainer}>
                 <View style={styles.expirationIcon}>
                   {expiration.status === 'expired' ? (
                     <AlertCircle size={14} color={expiration.color} />
                   ) : (
                     <Clock size={14} color={expiration.color} />
                   )}
                 </View>
                 <Text style={[styles.expirationText, { color: expiration.color }]}>
                   {expiration.label}
                 </Text>
               </View>
            ) : (
              <Text style={[styles.metaText, { color: colors.subtext }]}>Not opened yet</Text>
            )}
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={() => removeProduct(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Trash2 size={20} color={colors.subtext} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <PageTitleBar 
        title="My Shelf" 
        rightElement={
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: colors.tint }]}
            onPress={() => router.push('/add-product')}
          >
            <Plus size={24} color="#FFF" />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.text }]}>Your shelf is empty</Text>
            <Text style={[styles.emptySubtext, { color: colors.subtext }]}>Add your skincare products to track expiration dates and build your routine.</Text>
            <TouchableOpacity 
              style={[styles.ctaButton, { backgroundColor: colors.tint }]}
              onPress={() => router.push('/add-product')}
            >
              <Text style={styles.ctaButtonText}>Add First Product</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  listContent: {
    padding: 20,
    paddingTop: 10,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  imageWrapper: {
    marginRight: 16,
  },
  imagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // Ensure image respects border radius
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  initials: {
    fontSize: 18,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  info: {
    flex: 1,
  },
  brand: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  expirationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expirationIcon: {
    marginRight: 4,
  },
  expirationText: {
    fontSize: 12,
    fontWeight: '500',
  },
  metaText: {
    fontSize: 12,
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  ctaButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
