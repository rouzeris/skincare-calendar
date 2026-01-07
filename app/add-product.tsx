import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Modal, Pressable } from 'react-native';
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
  const [pao, setPao] = useState('12'); // Months
  const [openedAt, setOpenedAt] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState<TimeOfDay[]>([]);
  const [imageUri, setImageUri] = useState<string | null>(null);
  
  // Frequency State
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
      style={[styles.container, { backgroundColor: colors.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Add Product</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          disabled={!name || !brand}
          style={[
            styles.saveButton, 
            { backgroundColor: colors.tint },
            (!name || !brand) && { backgroundColor: colors.border }
          ]}
        >
          <Text style={[
            styles.saveButtonText, 
            (!name || !brand) && { color: colors.subtext }
          ]}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Image Picker */}
        <View style={styles.imageSection}>
          <TouchableOpacity onPress={pickImage} style={[styles.imageContainer, { backgroundColor: colors.card }]}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.productImage} contentFit="cover" />
            ) : (
              <View style={styles.placeholderImage}>
                <Camera size={32} color={colors.tabIconDefault} />
                <Text style={[styles.addPhotoText, { color: colors.subtext }]}>Add Photo</Text>
              </View>
            )}
            {imageUri && (
              <View style={[styles.editBadge, { backgroundColor: colors.tint, borderColor: colors.background }]}>
                <ImageIcon size={12} color="#FFF" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Inputs - Reordered: Name first, then Brand */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.subtext }]}>Product Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
            placeholder="e.g. Niacinamide 10% + Zinc 1%"
            value={name}
            onChangeText={handleNameChange}
            placeholderTextColor={colors.subtext}
          />
          {suggestions.length > 0 && (
            <View style={[styles.suggestionsContainer, { backgroundColor: colors.card }]}>
              {suggestions.map((item, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
                  onPress={() => selectSuggestion(item)}
                >
                  <Text style={[styles.suggestionText, { color: colors.text }]}>
                    <Text style={{fontWeight: '600'}}>{item.brand}</Text> {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.subtext }]}>Brand</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
            placeholder="e.g. The Ordinary"
            value={brand}
            onChangeText={setBrand}
            placeholderTextColor={colors.subtext}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={[styles.label, { color: colors.subtext }]}>Opened Date</Text>
            <TouchableOpacity 
              style={[styles.dateInput, { backgroundColor: colors.card }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar size={16} color={colors.subtext} style={{ marginRight: 8 }} />
              <Text style={[styles.dateText, { color: colors.text }]}>{format(openedAt, 'MMM dd, yyyy')}</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.formGroup, { flex: 1, marginLeft: 10 }]}>
            <Text style={[styles.label, { color: colors.subtext }]}>PAO (Months)</Text>
            <View style={[styles.paoInputContainer, { backgroundColor: colors.card }]}>
              <RotateCcw size={16} color={colors.subtext} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.paoInput, { color: colors.text }]}
                placeholder="12"
                value={pao}
                onChangeText={setPao}
                keyboardType="numeric"
                placeholderTextColor={colors.subtext}
              />
            </View>
          </View>
        </View>

        {/* Frequency Settings */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Frequency</Text>
          
          <View style={[styles.freqTypeContainer, { backgroundColor: colors.border }]}>
            <TouchableOpacity 
              style={[styles.freqTypeBtn, freqType === 'daily' && { backgroundColor: colors.card, shadowColor: "#000" }]}
              onPress={() => setFreqType('daily')}
            >
              <Text style={[styles.freqTypeText, { color: colors.subtext }, freqType === 'daily' && { color: colors.text, fontWeight: '600' }]}>Daily</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.freqTypeBtn, freqType === 'weekly' && { backgroundColor: colors.card, shadowColor: "#000" }]}
              onPress={() => setFreqType('weekly')}
            >
              <Text style={[styles.freqTypeText, { color: colors.subtext }, freqType === 'weekly' && { color: colors.text, fontWeight: '600' }]}>Specific Days</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.freqTypeBtn, freqType === 'interval' && { backgroundColor: colors.card, shadowColor: "#000" }]}
              onPress={() => setFreqType('interval')}
            >
              <Text style={[styles.freqTypeText, { color: colors.subtext }, freqType === 'interval' && { color: colors.text, fontWeight: '600' }]}>Interval</Text>
            </TouchableOpacity>
          </View>

          {freqType === 'interval' && (
             <View style={styles.intervalConfig}>
               <Text style={[styles.configLabel, { color: colors.text }]}>Repeat every</Text>
               <TextInput
                 style={[styles.intervalInput, { backgroundColor: colors.card, color: colors.tint }]}
                 value={intervalDays}
                 onChangeText={setIntervalDays}
                 keyboardType="numeric"
                 textAlign="center"
               />
               <Text style={[styles.configLabel, { color: colors.text }]}>days</Text>
             </View>
          )}

          {freqType === 'weekly' && (
            <View style={styles.weekDaysContainer}>
              {WEEKDAYS.map((day, index) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayCircle,
                    { backgroundColor: colors.card },
                    selectedWeekDays.includes(index) && { backgroundColor: colors.tint }
                  ]}
                  onPress={() => toggleWeekDay(index)}
                >
                  <Text style={[
                    styles.dayText,
                    { color: colors.subtext },
                    selectedWeekDays.includes(index) && { color: '#FFF' }
                  ]}>
                    {day.charAt(0)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Routine Time</Text>
          <View style={styles.routineOptions}>
            <TouchableOpacity 
              style={[
                styles.routineOption, 
                { backgroundColor: colors.card },
                selectedRoutine.includes('morning') && { backgroundColor: colors.tint }
              ]}
              onPress={() => toggleRoutine('morning')}
            >
              <Text style={[
                styles.routineOptionText, 
                { color: colors.text },
                selectedRoutine.includes('morning') && { color: '#FFF' }
              ]}>
                Morning
              </Text>
              {selectedRoutine.includes('morning') && <Check size={16} color="#FFF" />}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.routineOption, 
                { backgroundColor: colors.card },
                selectedRoutine.includes('evening') && { backgroundColor: colors.tint }
              ]}
              onPress={() => toggleRoutine('evening')}
            >
              <Text style={[
                styles.routineOptionText, 
                { color: colors.text },
                selectedRoutine.includes('evening') && { color: '#FFF' }
              ]}>
                Evening
              </Text>
               {selectedRoutine.includes('evening') && <Check size={16} color="#FFF" />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Mock Date Picker Modal */}
        <Modal visible={showDatePicker} transparent animationType="fade">
          <Pressable style={styles.modalOverlay} onPress={() => setShowDatePicker(false)}>
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Date</Text>
               <View style={styles.datePickerControls}>
                 <TouchableOpacity onPress={() => setOpenedAt(prev => new Date(prev.setDate(prev.getDate() - 1)))}>
                   <ChevronLeft size={24} color={colors.text} />
                 </TouchableOpacity>
                 <Text style={[styles.modalDateText, { color: colors.text }]}>{format(openedAt, 'MMMM dd, yyyy')}</Text>
                 <TouchableOpacity onPress={() => setOpenedAt(prev => new Date(prev.setDate(prev.getDate() + 1)))}>
                   <ChevronRight size={24} color={colors.text} />
                 </TouchableOpacity>
               </View>
               <TouchableOpacity style={[styles.confirmButton, { backgroundColor: colors.tint }]} onPress={() => setShowDatePicker(false)}>
                 <Text style={styles.confirmButtonText}>Confirm</Text>
               </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>

        <View style={{height: 40}} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
    marginLeft: -8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    padding: 20,
  },
  formSection: {
    marginBottom: 24,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 8,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  placeholderImage: {
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
  },
  addPhotoText: {
    fontSize: 12,
    fontWeight: '500',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    padding: 6,
    borderRadius: 12,
    borderWidth: 2,
  },
  formGroup: {
    zIndex: 1,
  },
  labelSpacing: {
    marginBottom: 8,
  },
  sectionContainer: {
    marginTop: 8,
  },
  sectionTitleSpacing: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  input: {
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    zIndex: 0,
  },
  dateInput: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  paoInputContainer: {
    borderRadius: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    height: 54, // Match other inputs
  },
  paoInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  dateText: {
    fontSize: 16,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderRadius: 16,
    marginTop: 4,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  suggestionText: {
    fontSize: 14,
  },
  
  // Frequency Styles
  freqTypeContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    marginBottom: 8,
  },
  freqTypeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  freqTypeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  intervalConfig: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  intervalLabel: {
    marginHorizontal: 6,
  },
  configLabel: {
    fontSize: 16,
  },
  intervalInput: {
    width: 60,
    height: 44,
    borderRadius: 12,
    fontSize: 18,
    fontWeight: '600',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
  },

  routineOptions: {
    flexDirection: 'row',
  },
  routineOptionFirst: {
    marginRight: 12,
  },
  routineOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  routineOptionIcon: {
    marginLeft: 8,
  },
  routineOptionText: {
    fontSize: 15,
    fontWeight: '500',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
  },
  modalTitleSpacing: {
    marginBottom: 20,
  },
  datePickerSpacing: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  datePickerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalDateText: {
    fontSize: 18,
    fontWeight: '500',
  },
  confirmButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
