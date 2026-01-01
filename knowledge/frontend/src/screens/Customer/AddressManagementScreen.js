/**
 * Address Management Screen - Manage delivery addresses
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { theme } from '@styles/theme';
import { fetchAddresses, addAddress, updateAddress, deleteAddress } from '../../redux/slices/userSlice';

const { colors, spacing, typography } = theme;

const AddressManagementScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { addresses = [], loading } = useSelector(state => state.user);
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ street: '', city: '', postalCode: '', addressType: 'home', isDefault: false });

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  const resetForm = () => {
    setForm({ street: '', city: '', postalCode: '', addressType: 'home', isDefault: false });
    setEditing(null);
  };

  const openAdd = () => {
    resetForm();
    setFormVisible(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      street: item.street,
      city: item.city,
      postalCode: item.postalCode,
      addressType: item.addressType || 'home',
      isDefault: item.isDefault || false,
    });
    setFormVisible(true);
  };

  const handleSave = async () => {
    if (!form.street?.trim()) return;
    const payload = { ...form };
    if (editing) {
      await dispatch(updateAddress({ id: editing.id, data: payload }));
    } else {
      await dispatch(addAddress(payload));
    }
    setFormVisible(false);
    resetForm();
    dispatch(fetchAddresses());
  };

  const handleDelete = async (id) => {
    await dispatch(deleteAddress(id));
    dispatch(fetchAddresses());
  };

  const renderAddress = ({ item }) => (
    <View style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <Text style={styles.addressLabel}>{item.addressType || 'Address'}</Text>
        {item.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Default</Text>
          </View>
        )}
      </View>
      <Text style={styles.addressText}>{item.street}</Text>
      <Text style={styles.addressText}>
        {item.city}, {item.postalCode}
      </Text>
      <View style={styles.addressActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => openEdit(item)}>
          <Ionicons name="pencil" size={20} color={colors.primary} />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash-outline" size={20} color={colors.error} />
          <Text style={[styles.actionText, { color: colors.error }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Addresses</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={addresses}
        renderItem={renderAddress}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No saved addresses yet</Text>
        }
        refreshing={loading}
        onRefresh={() => dispatch(fetchAddresses())}
      />

      <TouchableOpacity style={styles.addButton} onPress={openAdd}>
        <Ionicons name="add-circle" size={24} color={colors.white} />
        <Text style={styles.addButtonText}>Add New Address</Text>
      </TouchableOpacity>

      <Modal
        visible={formVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFormVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editing ? 'Edit Address' : 'Add Address'}</Text>
              <TouchableOpacity onPress={() => { setFormVisible(false); resetForm(); }}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Street and house no."
              value={form.street}
              onChangeText={(v) => setForm({ ...form, street: v })}
            />
            <TextInput
              style={styles.input}
              placeholder="City"
              value={form.city}
              onChangeText={(v) => setForm({ ...form, city: v })}
            />
            <TextInput
              style={styles.input}
              placeholder="Postal Code"
              keyboardType="numeric"
              value={form.postalCode}
              onChangeText={(v) => setForm({ ...form, postalCode: v })}
            />
            <TextInput
              style={styles.input}
              placeholder="Address Type (home, work, other)"
              value={form.addressType}
              onChangeText={(v) => setForm({ ...form, addressType: v })}
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>{editing ? 'Update' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h2,
    fontSize: 18,
  },
  listContainer: {
    padding: spacing.md,
  },
  addressCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...theme.shadows.small,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  addressLabel: {
    ...typography.h3,
    fontSize: 16,
  },
  defaultBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  addressText: {
    ...typography.body,
    color: colors.textLight,
    marginBottom: 4,
  },
  addressActions: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  actionText: {
    marginLeft: spacing.xs,
    color: colors.primary,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
  },
  addButtonText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  modalTitle: {
    ...typography.h3,
    fontSize: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  saveButtonText: {
    color: colors.white,
    fontWeight: '700',
  },
});

export default AddressManagementScreen;
