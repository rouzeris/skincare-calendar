import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Modal, Pressable } from 'react-native';
import { YStack, XStack, Text, Input, ScrollView } from 'tamagui';
import { useTheme } from '@/context/theme';
import { useCosmetics, Frequency } from '@/context/cosmetics';
import { useRoutine, TimeOfDay } from '@/context/routine';
import { useRouter } from 'expo-router';
import { X, ChevronLeft, ChevronRight, Check, Camera, Image as ImageIcon, Calendar, RotateCcw } from 'lucide-react-native';
import { format } from 'date-fns';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';

const MOCK_SUGGESTIONS = [
  { brand: 'The Ordinary', name: 'Niacinamide 10% + Zinc 1%' },
  { brand: 'The Ordinary', name: 'Hyaluronic Acid 2% + B5' },
  { brand: 'CeraVe', name: 'Hydrating Cleanser' },
  { brand: 'CeraVe', name: 'Moisturizing Cream' },
  { brand: 'La Roche-Posay', name: 'Anthelios UV Mune 400' },
  { brand: 'La Roche-Posay', name: 'Cicaplast Baume B5' },
  { brand: "Paula's Choice", name: 'Skin Perfecting 2% BHA Liquid Exfoliant' },
  { brand: 'Cosrx', name: 'Advanced Snail 96 Mucin Power Essence' },
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AddProductScreen() {
  const router = useRouter();
  const { addProduct } = useCosmetics();
  const { addToRoutine } = useRoutine();
  const { colors } = useTheme();

  const [brand, setBrand] = useState('');
  const [name, setName] = useState('');
  const [pao, setPao] = useState('12');
  const [openedAt, setOpenedAt] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState<TimeOfDay[]>([]);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const [freqType, setFreqType] = useState<'daily' | 'interval' | 'weekly'>('daily');
  const [intervalDays, setIntervalDays] = useState('2');
  const [selectedWeekDays, setSelectedWeekDays] = useState<number[]>([]);

  const [suggestions, setSuggestions] = useState<typeof MOCK_SUGGESTIONS>([]);

  const handleNameChange = (text: string) => {
    setName(text);
    if (text.length > 1) {
      const filtered = MOCK_SUGGESTIONS.filter(
        s => s.name.toLowerCase().includes(text.toLowerCase()) ||
          s.brand.toLowerCase().includes(text.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 3));
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (item: typeof MOCK_SUGGESTIONS[0]) => {
    setBrand(item.brand);
    setName(item.name);
    setSuggestions([]);
  };

  const toggleRoutine = (time: TimeOfDay) => {
    if (selectedRoutine.includes(time)) {
      setSelectedRoutine(prev => prev.filter(t => t !== time));
    } else {
      setSelectedRoutine(prev => [...prev, time]);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const toggleWeekDay = (dayIndex: number) => {
    if (selectedWeekDays.includes(dayIndex)) {
      setSelectedWeekDays(prev => prev.filter(d => d !== dayIndex));
    } else {
      setSelectedWeekDays(prev => [...prev, dayIndex]);
    }
  };

  const handleSave = () => {
    if (!name || !brand) return;

    let frequency: Frequency = { type: 'daily' };

    if (freqType === 'interval') {
      frequency = { type: 'interval', days: parseInt(intervalDays) || 2 };
    } else if (freqType === 'weekly') {
      frequency = { type: 'weekly', daysOfWeek: selectedWeekDays.length > 0 ? selectedWeekDays : [1, 3, 5] };
    }

    const newProduct = {
      id: Math.random().toString(36).substr(2, 9),
      brand,
      name,
      openedAt: openedAt.toISOString(),
      periodAfterOpening: parseInt(pao) || 12,
      image: imageUri || undefined,
      frequency
    };

    addProduct(newProduct, {
      onSuccess: () => {
        selectedRoutine.forEach(time => {
          addToRoutine({ productId: newProduct.id, timeOfDay: time });
        });

        router.back();
      }
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <XStack
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal={20}
        paddingTop={20}
        paddingBottom={15}
        borderBottomWidth={1}
        borderBottomColor={colors.border}
      >
        <YStack padding={8} marginLeft={-8} onPress={() => router.back()}>
          <X size={24} color={colors.text} />
        </YStack>
        <Text fontSize={18} fontWeight="600" color={colors.text}>Add Product</Text>
        <YStack
          paddingHorizontal={16}
          paddingVertical={8}
          borderRadius={20}
          backgroundColor={(!name || !brand) ? colors.border : colors.tint}
          opacity={(!name || !brand) ? 0.7 : 1}
          onPress={handleSave}
          disabled={!name || !brand}
        >
          <Text fontWeight="600" fontSize={14} color={(!name || !brand) ? colors.subtext : '#FFF'}>
            Save
          </Text>
        </YStack>
      </XStack>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Image Picker */}
        <YStack alignItems="center" marginBottom={8}>
          <YStack
            width={120}
            height={120}
            borderRadius={40}
            justifyContent="center"
            alignItems="center"
            backgroundColor={colors.card}
            shadowColor="#000"
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.1}
            shadowRadius={8}
            elevation={3}
            position="relative"
            onPress={pickImage}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%', borderRadius: 40 }} contentFit="cover" />
            ) : (
              <YStack alignItems="center">
                <Camera size={32} color={colors.tabIconDefault} />
                <Text fontSize={12} fontWeight="500" color={colors.subtext}>Add Photo</Text>
              </YStack>
            )}
            {imageUri && (
              <YStack
                position="absolute"
                bottom={0}
                right={0}
                padding={6}
                borderRadius={12}
                borderWidth={2}
                backgroundColor={colors.tint}
                borderColor={colors.background}
              >
                <ImageIcon size={12} color="#FFF" />
              </YStack>
            )}
          </YStack>
        </YStack>

        {/* Inputs */}
        <YStack zIndex={10}>
          <Text fontSize={14} fontWeight="500" marginLeft={4} color={colors.subtext}>Product Name</Text>
          <Input
            borderRadius={16}
            padding={16}
            fontSize={16}
            borderWidth={1}
            borderColor="transparent"
            backgroundColor={colors.card}
            color={colors.text}
            placeholder="e.g. Niacinamide 10% + Zinc 1%"
            value={name}
            onChangeText={handleNameChange}
            placeholderTextColor={colors.subtext}
          />
          {suggestions.length > 0 && (
            <YStack
              position="absolute"
              top="100%"
              left={0}
              right={0}
              borderRadius={16}
              marginTop={4}
              padding={8}
              zIndex={100}
              backgroundColor={colors.card}
              shadowColor="#000"
              shadowOffset={{ width: 0, height: 4 }}
              shadowOpacity={0.1}
              shadowRadius={12}
              elevation={8}
            >
              {suggestions.map((item, index) => (
                <YStack
                  key={index}
                  paddingVertical={12}
                  paddingHorizontal={12}
                  borderBottomWidth={1}
                  borderBottomColor={colors.border}
                  onPress={() => selectSuggestion(item)}
                >
                  <Text fontSize={14} color={colors.text}>
                    <Text fontWeight="600">{item.brand}</Text> {item.name}
                  </Text>
                </YStack>
              ))}
            </YStack>
          )}
        </YStack>

        <YStack zIndex={10}>
          <Text fontSize={14} fontWeight="500" marginLeft={4} color={colors.subtext}>Brand</Text>
          <Input
            borderRadius={16}
            padding={16}
            fontSize={16}
            borderWidth={1}
            borderColor="transparent"
            backgroundColor={colors.card}
            color={colors.text}
            placeholder="e.g. The Ordinary"
            value={brand}
            onChangeText={setBrand}
            placeholderTextColor={colors.subtext}
          />
        </YStack>

        <XStack zIndex={0}>
          <YStack flex={1} marginRight={10}>
            <Text fontSize={14} fontWeight="500" marginLeft={4} color={colors.subtext}>Opened Date</Text>
            <XStack
              borderRadius={16}
              padding={16}
              alignItems="center"
              backgroundColor={colors.card}
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar size={16} color={colors.subtext} style={{ marginRight: 8 }} />
              <Text fontSize={16} color={colors.text}>{format(openedAt, 'MMM dd, yyyy')}</Text>
            </XStack>
          </YStack>

          <YStack flex={1} marginRight={10}>
            <Text fontSize={14} fontWeight="500" marginLeft={4} color={colors.subtext}>PAO (Months)</Text>
            <XStack
              borderRadius={16}
              paddingHorizontal={16}
              alignItems="center"
              height={54}
              backgroundColor={colors.card}
            >
              <RotateCcw size={16} color={colors.subtext} style={{ marginRight: 8 }} />
              <Input
                flex={1}
                fontSize={16}
                height="100%"
                backgroundColor="transparent"
                borderWidth={0}
                color={colors.text}
                placeholder="12"
                value={pao}
                onChangeText={setPao}
                keyboardType="numeric"
                placeholderTextColor={colors.subtext}
              />
            </XStack>
          </YStack>
        </XStack>

        {/* Frequency Settings */}
        <YStack marginTop={8}>
          <Text fontSize={16} fontWeight="600" color={colors.text}>Frequency</Text>

          <XStack borderRadius={16} padding={4} marginBottom={8} backgroundColor={colors.border}>
            <YStack
              flex={1}
              paddingVertical={10}
              alignItems="center"
              borderRadius={12}
              backgroundColor={freqType === 'daily' ? colors.card : 'transparent'}
              onPress={() => setFreqType('daily')}
            >
              <Text fontSize={13} color={freqType === 'daily' ? colors.text : colors.subtext} fontWeight={freqType === 'daily' ? '600' : '500'}>
                Daily
              </Text>
            </YStack>
            <YStack
              flex={1}
              paddingVertical={10}
              alignItems="center"
              borderRadius={12}
              backgroundColor={freqType === 'weekly' ? colors.card : 'transparent'}
              onPress={() => setFreqType('weekly')}
            >
              <Text fontSize={13} color={freqType === 'weekly' ? colors.text : colors.subtext} fontWeight={freqType === 'weekly' ? '600' : '500'}>
                Specific Days
              </Text>
            </YStack>
            <YStack
              flex={1}
              paddingVertical={10}
              alignItems="center"
              borderRadius={12}
              backgroundColor={freqType === 'interval' ? colors.card : 'transparent'}
              onPress={() => setFreqType('interval')}
            >
              <Text fontSize={13} color={freqType === 'interval' ? colors.text : colors.subtext} fontWeight={freqType === 'interval' ? '600' : '500'}>
                Interval
              </Text>
            </YStack>
          </XStack>

          {freqType === 'interval' && (
            <XStack alignItems="center" justifyContent="center" paddingVertical={8}>
              <Text fontSize={16} color={colors.text}>Repeat every</Text>
              <Input
                width={60}
                height={44}
                borderRadius={12}
                fontSize={18}
                fontWeight="600"
                textAlign="center"
                marginHorizontal={8}
                backgroundColor={colors.card}
                color={colors.tint}
                borderWidth={0}
                value={intervalDays}
                onChangeText={setIntervalDays}
                keyboardType="numeric"
              />
              <Text fontSize={16} color={colors.text}>days</Text>
            </XStack>
          )}

          {freqType === 'weekly' && (
            <XStack justifyContent="space-between" paddingVertical={8}>
              {WEEKDAYS.map((day, index) => (
                <YStack
                  key={day}
                  width={36}
                  height={36}
                  borderRadius={18}
                  justifyContent="center"
                  alignItems="center"
                  borderWidth={1}
                  borderColor="transparent"
                  backgroundColor={selectedWeekDays.includes(index) ? colors.tint : colors.card}
                  onPress={() => toggleWeekDay(index)}
                >
                  <Text fontSize={12} fontWeight="600" color={selectedWeekDays.includes(index) ? '#FFF' : colors.subtext}>
                    {day.charAt(0)}
                  </Text>
                </YStack>
              ))}
            </XStack>
          )}
        </YStack>

        <YStack marginTop={8}>
          <Text fontSize={16} fontWeight="600" color={colors.text}>Routine Time</Text>
          <XStack gap={12}>
            <XStack
              flex={1}
              alignItems="center"
              justifyContent="center"
              paddingVertical={14}
              borderRadius={16}
              borderWidth={1}
              borderColor="transparent"
              backgroundColor={selectedRoutine.includes('morning') ? colors.tint : colors.card}
              onPress={() => toggleRoutine('morning')}
            >
              <Text fontSize={15} fontWeight="500" color={selectedRoutine.includes('morning') ? '#FFF' : colors.text}>
                Morning
              </Text>
              {selectedRoutine.includes('morning') && <Check size={16} color="#FFF" style={{ marginLeft: 8 }} />}
            </XStack>

            <XStack
              flex={1}
              alignItems="center"
              justifyContent="center"
              paddingVertical={14}
              borderRadius={16}
              borderWidth={1}
              borderColor="transparent"
              backgroundColor={selectedRoutine.includes('evening') ? colors.tint : colors.card}
              onPress={() => toggleRoutine('evening')}
            >
              <Text fontSize={15} fontWeight="500" color={selectedRoutine.includes('evening') ? '#FFF' : colors.text}>
                Evening
              </Text>
              {selectedRoutine.includes('evening') && <Check size={16} color="#FFF" style={{ marginLeft: 8 }} />}
            </XStack>
          </XStack>
        </YStack>

        {/* Date Picker Modal */}
        <Modal visible={showDatePicker} transparent animationType="fade">
          <Pressable
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
            onPress={() => setShowDatePicker(false)}
          >
            <YStack width="80%" padding={24} borderRadius={24} alignItems="center" backgroundColor={colors.background}>
              <Text fontSize={18} fontWeight="600" color={colors.text}>Select Date</Text>
              <XStack alignItems="center" justifyContent="space-between" width="100%">
                <YStack onPress={() => setOpenedAt(prev => new Date(prev.setDate(prev.getDate() - 1)))}>
                  <ChevronLeft size={24} color={colors.text} />
                </YStack>
                <Text fontSize={18} fontWeight="500" color={colors.text}>{format(openedAt, 'MMMM dd, yyyy')}</Text>
                <YStack onPress={() => setOpenedAt(prev => new Date(prev.setDate(prev.getDate() + 1)))}>
                  <ChevronRight size={24} color={colors.text} />
                </YStack>
              </XStack>
              <YStack
                paddingHorizontal={32}
                paddingVertical={12}
                borderRadius={20}
                width="100%"
                alignItems="center"
                backgroundColor={colors.tint}
                onPress={() => setShowDatePicker(false)}
              >
                <Text color="#FFFFFF" fontSize={16} fontWeight="600">Confirm</Text>
              </YStack>
            </YStack>
          </Pressable>
        </Modal>

        <YStack height={40} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
