import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { COLORS } from '../constants';
import { toDateString } from '../services/calculations';
import { Expense } from '../types';

function generateId(): string {
  return `expense-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function ExpenseFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { state, addExpense, updateExpense, addExpenseCategory } = useApp();

  const editingExpense = id ? state.expenses.find((e) => e.id === id) : undefined;
  const isEditing = !!editingExpense;

  const today = toDateString(new Date());

  const [title, setTitle] = useState(editingExpense?.title ?? '');
  const [amount, setAmount] = useState(editingExpense ? String(editingExpense.amount) : '');
  const [category, setCategory] = useState(editingExpense?.category ?? state.expenseCategories[0]);
  const [date, setDate] = useState(editingExpense?.date ?? today);
  const [isRecurring, setIsRecurring] = useState(editingExpense?.isRecurring ?? false);
  const [recurrenceMonths, setRecurrenceMonths] = useState(
    String(editingExpense?.recurrenceMonths ?? 12),
  );
  const [notes, setNotes] = useState(editingExpense?.notes ?? '');
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Başlık zorunludur.';
    if (!amount || parseFloat(amount.replace(',', '.')) <= 0)
      errs.amount = 'Geçerli bir tutar girin.';
    if (!category) errs.category = 'Kategori seçimi zorunludur.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddCategory = async () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    await addExpenseCategory(trimmed);
    setCategory(trimmed);
    setNewCategory('');
    setShowNewCategory(false);
  };

  const handleSave = async () => {
    if (!validate()) return;

    const parsedAmount = parseFloat(amount.replace(',', '.'));
    const now = new Date().toISOString();

    if (isEditing) {
      const expense: Expense = {
        ...editingExpense!,
        title: title.trim(),
        amount: parsedAmount,
        category,
        date,
        isRecurring,
        recurrenceMonths: isRecurring ? parseInt(recurrenceMonths) || 1 : undefined,
        notes: notes.trim() || undefined,
      };
      await updateExpense(expense);
      router.back();
      return;
    }

    // For recurring, create multiple entries
    const months = isRecurring ? Math.max(1, Math.min(60, parseInt(recurrenceMonths) || 1)) : 1;

    for (let i = 0; i < months; i++) {
      const expDate = new Date(date);
      expDate.setMonth(expDate.getMonth() + i);
      // Handle month-end edge cases
      const lastDay = new Date(expDate.getFullYear(), expDate.getMonth() + 1, 0).getDate();
      if (expDate.getDate() > lastDay) expDate.setDate(lastDay);

      const expense: Expense = {
        id: generateId(),
        title: title.trim(),
        amount: parsedAmount,
        category,
        date: toDateString(expDate),
        isRecurring,
        recurrenceMonths: isRecurring ? months : undefined,
        notes: notes.trim() || undefined,
        createdAt: now,
      };
      await addExpense(expense);
    }

    router.back();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.handle} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Gideri Düzenle' : 'Yeni Gider'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <Input
            label="Başlık"
            placeholder="Örn: Ocak Kirası"
            value={title}
            onChangeText={setTitle}
            error={errors.title}
            required
          />

          {/* Amount */}
          <Input
            label="Tutar (₺)"
            placeholder="0"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            error={errors.amount}
            prefix={<Text style={{ color: COLORS.textMuted, fontSize: 16 }}>₺</Text>}
            required
          />

          {/* Category */}
          <Text style={styles.fieldLabel}>
            Kategori <Text style={styles.required}>*</Text>
          </Text>
          {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
          <View style={styles.categoryGrid}>
            {state.expenseCategories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryBtn,
                  category === cat && styles.categoryBtnActive,
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryLabel,
                    category === cat && styles.categoryLabelActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.categoryBtn, styles.categoryAddBtn]}
              onPress={() => setShowNewCategory(!showNewCategory)}
            >
              <Ionicons
                name={showNewCategory ? 'remove' : 'add'}
                size={16}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          </View>

          {showNewCategory && (
            <View style={styles.newCategoryRow}>
              <Input
                placeholder="Yeni kategori adı"
                value={newCategory}
                onChangeText={setNewCategory}
                style={{ flex: 1, marginBottom: 0 }}
              />
              <TouchableOpacity
                style={styles.addCategoryBtn}
                onPress={handleAddCategory}
              >
                <Ionicons name="checkmark" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          {/* Date */}
          <Input
            label="Tarih"
            placeholder="YYYY-AA-GG"
            value={date}
            onChangeText={setDate}
            keyboardType="numeric"
            required
          />

          {/* Recurring Toggle */}
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>Tekrarlayan Gider</Text>
              <Text style={styles.toggleSub}>
                Otomatik olarak sonraki aylara ekler
              </Text>
            </View>
            <Switch
              value={isRecurring}
              onValueChange={setIsRecurring}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor="#fff"
            />
          </View>

          {isRecurring && !isEditing && (
            <Input
              label="Kaç Ay?"
              placeholder="12"
              value={recurrenceMonths}
              onChangeText={setRecurrenceMonths}
              keyboardType="number-pad"
              hint="1 ile 60 ay arası"
            />
          )}

          {/* Notes */}
          <Input
            label="Notlar (İsteğe Bağlı)"
            placeholder="Ek bilgi..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={2}
            style={{ minHeight: 56, textAlignVertical: 'top' }}
          />

          {/* Info for recurring */}
          {isRecurring && !isEditing && (
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={16} color={COLORS.info} />
              <Text style={styles.infoText}>
                {parseInt(recurrenceMonths) || 1} aylık gider kaydı oluşturulacak.
              </Text>
            </View>
          )}

          <Button
            label={isEditing ? 'Değişiklikleri Kaydet' : 'Gideri Ekle'}
            onPress={handleSave}
            fullWidth
            size="lg"
            style={{ marginTop: 8 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: COLORS.background,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  content: { padding: 20 },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  required: { color: COLORS.danger },
  errorText: { fontSize: 12, color: COLORS.danger, marginBottom: 6 },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: '#fff',
  },
  categoryBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  categoryAddBtn: {
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    width: 38,
    height: 38,
    padding: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: { fontSize: 13, fontWeight: '500', color: COLORS.textMuted },
  categoryLabelActive: { color: COLORS.primaryDark },
  newCategoryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  addCategoryBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  toggleLabel: { fontSize: 15, fontWeight: '500', color: COLORS.text },
  toggleSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.infoLight,
    borderRadius: 10,
    padding: 12,
    gap: 8,
    marginBottom: 16,
  },
  infoText: { fontSize: 13, color: COLORS.info, flex: 1 },
});
