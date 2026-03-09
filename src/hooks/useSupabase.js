import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export const useSupabase = () => {
  const [loading, setLoading] = useState(false);

  // ============================
  // EMPRESAS
  // ============================
  const getCompanyInfo = useCallback(async (companyId) => {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    if (error) {
      console.error("Erro ao buscar empresa:", error);
      return null;
    }
    return data;
  }, []);

  const updateSubscription = useCallback(async (companyId, plan, durationDays) => {
    setLoading(true);
    try {
      const { data: company, error } = await supabase
        .from('companies')
        .update({
          subscription_status: 'active',
          subscription_end_date: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('id', companyId)
        .select()
        .single();

      if (error) throw error;

      // Registrar pagamento
      await supabase.from('payments').insert({
        company_id: companyId,
        amount: plan === 'basic' ? 29 : plan === 'pro' ? 79 : 199,
        status: 'completed',
        stripe_payment_id: 'mock_' + crypto.randomUUID(),
        created_at: new Date().toISOString()
      });

      return { success: true, company };
    } catch (error) {
      console.error(error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================
  // FUNCIONÁRIOS
  // ============================
  const getEmployees = useCallback(async (companyId) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('company_id', companyId)
      .eq('user_type', 'funcionario');

    if (error) {
      console.error("Erro ao buscar funcionários:", error);
      return [];
    }
    return data || [];
  }, []);

  // ============================
  // ENCOMENDAS
  // ============================
  const getOrders = useCallback(async (companyId) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('company_id', companyId);

    if (error) {
      console.error("Erro ao buscar encomendas:", error);
      return [];
    }
    return data || [];
  }, []);

  const createOrder = useCallback(async (orderData) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          ...orderData,
          status: 'pendente',
          assigned_to: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error(error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrderStatus = useCallback(async (orderId, newStatus, changedBy) => {
    setLoading(true);
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();
      if (error) throw error;

      await supabase.from('order_history').insert({
        order_id: orderId,
        old_status: order.status,
        new_status: newStatus,
        changed_by: changedBy,
        changed_at: new Date().toISOString()
      });

      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const assignOrder = useCallback(async (orderId, employeeId) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          assigned_to: employeeId,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    getCompanyInfo,
    updateSubscription,
    getEmployees,
    getOrders,
    createOrder,
    updateOrderStatus,
    assignOrder
  };
};