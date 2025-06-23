import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';
import { PaymentMethod } from '../services/payment';

interface PaymentMethodDetailsProps {
  visible: boolean;
  onClose: () => void;
  method: PaymentMethod;
  onRemove: () => void;
}

export default function PaymentMethodDetails({ visible, onClose, method, onRemove }: PaymentMethodDetailsProps) {
  const { t } = useTranslation();
  const [createdAt, setCreatedAt] = useState<string>('');
 
  useEffect(() => {
    fetchDetailpayments();
  }, []);

  const fetchDetailpayments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      console.log('Fetching payment method with ID:', method.id);
      
      const { data, error } = await supabase
        .from('payment_methods')
        .select('created_at')
        .eq('stripe_payment_method_id', method.id)
        .single();

      console.log('Supabase response:', { data, error });

      if (error) throw error;
      
      if (data?.created_at) {
        console.log('Raw created_at:', data.created_at);
        const formattedDate = format(new Date(data.created_at), 'MMM dd, yyyy');
        console.log('Formatted date:', formattedDate);
        setCreatedAt(formattedDate);
      } else {
        console.log('No created_at data found');
      }
    } catch (error) {
      console.error('Error fetching payment method details:', error);
    }
  };

  const handleRemove = () => {
    Alert.alert(
      t('common.removePaymentMethod'),
      t('common.removePaymentMethodConfirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.remove'),
          style: 'destructive',
          onPress: () => {
            onRemove();
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {method.type === 'bank_account' ? t('common.bankAccountDetails') : t('common.cardDetails')}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <LinearGradient
            colors={method.type === 'bank_account' ? ['#2196F3', '#1976D2'] : ['#2196F3', '#1976D2']}
            style={styles.methodCard}
          >
            <View style={styles.methodIcon}>
              <Image 
                source={require('../../assets/home/cards.png')} 
                style={styles.methodIconImage} 
              />
            </View>
            <View style={styles.methodInfo}>
              <Text style={styles.methodType}>
                {method.type === 'bank_account' ? method.bankAccount?.bankName : 'Debit Card'}
              </Text>
              <Text style={styles.methodDetails}>**** {method.last4}</Text>
            </View>
          </LinearGradient>

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('common.status')}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{t('common.active')}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('common.addedOn')}</Text>
              <Text style={styles.detailValue}>{createdAt}</Text>
            </View>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.editButton]}
              onPress={() => {
                Alert.alert(t('common.comingSoon'));
              }}
            >
              <Ionicons name="pencil" size={20} color="#2196F3" />
              <Text style={[styles.actionButtonText, styles.editButtonText]}>
                {t('common.edit')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.removeButton]}
              onPress={handleRemove}
            >
              <Ionicons name="trash-outline" size={20} color="#FF5252" />
              <Text style={[styles.actionButtonText, styles.removeButtonText]}>
                {t('common.remove')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Satoshi-Bold',
    color: '#000',
  },
  closeButton: {
    padding: 5,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodIconImage: {
    width: 24,
    height: 24,
  },
  methodInfo: {
    flex: 1,
    marginLeft: 15,
  },
  methodType: {
    fontSize: 18,
    fontFamily: 'Satoshi-Bold',
    color: '#fff',
  },
  methodDetails: {
    fontSize: 14,
    fontFamily: 'Satoshi-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  detailsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'Satoshi-Regular',
    color: '#000',
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: '#4CAF50',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 8,
  },
  editButton: {
    backgroundColor: '#E3F2FD',
  },
  removeButton: {
    backgroundColor: '#FFEBEE',
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
  },
  editButtonText: {
    color: '#2196F3',
  },
  removeButtonText: {
    color: '#FF5252',
  },
}); 