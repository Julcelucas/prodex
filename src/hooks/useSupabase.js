import { useState, useCallback } from 'react';
import { assertSupabaseConfigured, createIsolatedSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

const generateOrderId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `order-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const normalizeOrderPayload = (input = {}, options = {}) => {
  const { ensureId = false } = options;
  const normalized = {
    ...input,
    ...(ensureId ? { id: input.id || generateOrderId() } : {}),
    customer_id: input.customer_id || input.customerId || null,
    type: input.type || input.order_type || null,
    address: input.address || input.delivery_address || input.customer_address || null,
    phone: input.phone || input.customer_phone || null,
  };

  delete normalized.order_type;
  delete normalized.customerId;
  delete normalized.delivery_address;
  delete normalized.customer_address;
  delete normalized.customer_phone;

  return normalized;
};

export const useSupabase = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [employees, setEmployees] = useState([]);

  const getOrders = useCallback((companyId) => orders.filter((order) => order.company_id === companyId), [orders]);

  const getEmployees = useCallback((companyId) => employees.filter((employee) => employee.company_id === companyId), [employees]);

  const appendOrderHistory = useCallback(async (client, orderId, oldStatus, newStatus, changedBy) => {
    if (!oldStatus || oldStatus === newStatus) {
      return;
    }

    const { error } = await client.from('order_history').insert({
      order_id: orderId,
      old_status: oldStatus,
      new_status: newStatus,
      changed_by: changedBy || currentUser?.id || null,
      changed_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('[useSupabase] Failed to append order history', error);
    }
  }, [currentUser]);

  const getCompanyInfo = useCallback(async (companyId) => {
    const client = assertSupabaseConfigured();
    const { data, error } = await client
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  }, []);

  const loadOrders = useCallback(async (companyId = null) => {
    try {
      setLoading(true);
      const client = assertSupabaseConfigured();
      const targetCompanyId = companyId || currentUser?.company_id;

      let query = client
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (targetCompanyId) {
        query = query.eq('company_id', targetCompanyId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setOrders(data || []);
      return data || [];
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const loadEmployees = useCallback(async (companyId = null) => {
    try {
      setLoading(true);
      const client = assertSupabaseConfigured();
      const targetCompanyId = companyId || currentUser?.company_id;

      let query = client
        .from('profiles')
        .select('*')
        .order('name', { ascending: true });

      if (targetCompanyId) {
        query = query.eq('company_id', targetCompanyId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const filteredEmployees = (data || []).filter((employee) => {
        const userType = String(employee?.user_type || '').toLowerCase();
        return userType === 'funcionario' || userType === 'employee' || !userType;
      });

      setEmployees(filteredEmployees);
      return filteredEmployees;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const getOrderStats = useCallback(() => {
    const now = Date.now();

    return orders.reduce((stats, order) => {
      const isDelayed = order.desired_delivery_time && new Date(order.desired_delivery_time).getTime() < now;

      if (order.status === 'pending') stats.pending += 1;
      if (order.status === 'in_delivery') stats.in_delivery += 1;
      if (order.status === 'delivered') stats.delivered += 1;
      if (isDelayed && order.status !== 'delivered' && order.status !== 'cancelled') stats.delayed += 1;

      return stats;
    }, { pending: 0, delayed: 0, in_delivery: 0, delivered: 0 });
  }, [orders]);

  const createOrder = useCallback(async (orderData) => {
    setLoading(true);
    try {
      const client = assertSupabaseConfigured();
      const now = new Date().toISOString();
      const normalizedOrderData = normalizeOrderPayload(orderData, { ensureId: true });
      const newOrder = {
        ...normalizedOrderData,
        company_id: currentUser?.company_id || normalizedOrderData.company_id || null,
        customer_id: normalizedOrderData.customer_id || currentUser?.id || null,
        status: normalizedOrderData.status || 'pending',
        assigned_to: normalizedOrderData.assigned_to ?? null,
        created_at: normalizedOrderData.created_at || now,
        updated_at: now,
      };

      const { data, error } = await client
        .from('orders')
        .insert(newOrder)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      setOrders((previousOrders) => [data, ...previousOrders]);
      return { success: true, data };
    } catch (e) {
      return { success: false, error: e.message };
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const updateOrderStatus = useCallback(async (orderId, newStatus, changedBy) => {
    setLoading(true);
    try {
      const client = assertSupabaseConfigured();

      const existingOrder = orders.find((order) => order.id === orderId);
      const oldStatus = existingOrder?.status || null;

      const { data: updatedOrder, error: updateError } = await client
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select('*')
        .single();

      if (updateError) {
        throw updateError;
      }

      await appendOrderHistory(client, orderId, oldStatus, newStatus, changedBy);

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order.id === orderId ? { ...order, ...updatedOrder } : order
        )
      );

      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    } finally {
      setLoading(false);
    }
  }, [appendOrderHistory, currentUser, orders]);

  const updateOrder = useCallback(async (orderId, updates, changedBy) => {
    setLoading(true);
    try {
      const client = assertSupabaseConfigured();
      const existingOrder = orders.find((order) => order.id === orderId);
      const normalizedUpdates = normalizeOrderPayload(updates);
      const payload = {
        ...normalizedUpdates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await client
        .from('orders')
        .update(payload)
        .eq('id', orderId)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      await appendOrderHistory(client, orderId, existingOrder?.status || null, data.status, changedBy);

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order.id === orderId ? { ...order, ...data } : order
        )
      );

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [appendOrderHistory, orders]);

  const deleteOrder = useCallback(async (orderId) => {
    setLoading(true);
    try {
      const client = assertSupabaseConfigured();
      const { error } = await client.from('orders').delete().eq('id', orderId);

      if (error) {
        throw error;
      }

      setOrders((previousOrders) => previousOrders.filter((order) => order.id !== orderId));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const assignOrder = useCallback(async (orderId, employeeId) => {
    return updateOrder(orderId, { assigned_to: employeeId ?? null }, currentUser?.id);
  }, [currentUser?.id, updateOrder]);

  const createEmployeeAccount = useCallback(async ({ email, password, name, phone, companyId }) => {
    setLoading(true);
    try {
      const authClient = createIsolatedSupabaseClient();
      const normalizedEmail = String(email || '').trim().toLowerCase();
      const normalizedName = String(name || '').trim();
      const normalizedPhone = String(phone || '').trim();
      const targetCompanyId = companyId || currentUser?.company_id || null;

      const { data, error } = await authClient.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            name: normalizedName,
            phone: normalizedPhone,
            user_type: 'funcionario',
            company_id: targetCompanyId,
          },
        },
      });

      if (error) {
        throw error;
      }

      const userId = data?.user?.id;
      if (!userId) {
        throw new Error('Não foi possível criar a conta do funcionário.');
      }

      const profilePayload = {
        id: userId,
        email: normalizedEmail,
        name: normalizedName,
        phone: normalizedPhone,
        user_type: 'funcionario',
        company_id: targetCompanyId,
      };

      const { data: profile, error: profileError } = await authClient
        .from('profiles')
        .upsert(profilePayload, { onConflict: 'id' })
        .select('*')
        .single();

      if (profileError) {
        throw profileError;
      }

      setEmployees((previousEmployees) => {
        const exists = previousEmployees.some((employee) => employee.id === profile.id);
        if (exists) {
          return previousEmployees.map((employee) => employee.id === profile.id ? { ...employee, ...profile } : employee);
        }
        return [...previousEmployees, profile];
      });

      return { success: true, data: profile };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [currentUser?.company_id]);

  const updateEmployee = useCallback(async (employeeId, updates) => {
    setLoading(true);
    try {
      const client = assertSupabaseConfigured();
      const payload = {
        name: updates.name,
        phone: updates.phone || null,
      };

      const { data, error } = await client
        .from('profiles')
        .update(payload)
        .eq('id', employeeId)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      setEmployees((previousEmployees) =>
        previousEmployees.map((employee) =>
          employee.id === employeeId ? { ...employee, ...data } : employee
        )
      );

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteEmployee = useCallback(async (employeeId) => {
    setLoading(true);
    try {
      const client = assertSupabaseConfigured();

      const { error: unassignError } = await client
        .from('orders')
        .update({ assigned_to: null, updated_at: new Date().toISOString() })
        .eq('assigned_to', employeeId);

      if (unassignError) {
        throw unassignError;
      }

      const { error } = await client.from('profiles').delete().eq('id', employeeId);

      if (error) {
        throw error;
      }

      setEmployees((previousEmployees) => previousEmployees.filter((employee) => employee.id !== employeeId));
      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order.assigned_to === employeeId ? { ...order, assigned_to: null } : order
        )
      );

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSubscription = useCallback(async (companyId, plan, durationDays) => {
    try {
      const client = assertSupabaseConfigured();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + durationDays);

      const { data: company, error: companyError } = await client
        .from('companies')
        .update({
          subscription_status: 'active',
          subscription_plan: plan,
          subscription_end_date: endDate.toISOString(),
        })
        .eq('id', companyId)
        .select('*')
        .single();

      if (companyError) {
        throw companyError;
      }

      const { error: paymentError } = await client.from('payments').insert({
        company_id: companyId,
        amount: plan === 'basic' ? 29 : plan === 'pro' ? 79 : 199,
        status: 'completed',
        stripe_payment_id: 'mock_' + crypto.randomUUID(),
        created_at: new Date().toISOString(),
      });

      if (paymentError) {
        throw paymentError;
      }

      return { success: true, company };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  return {
    loading,
    orders,
    employees,
    loadOrders,
    loadEmployees,
    getOrderStats,
    getOrders,
    getEmployees,
    getCompanyInfo,
    createOrder,
    updateOrderStatus,
    updateOrder,
    deleteOrder,
    assignOrder,
    createEmployeeAccount,
    updateEmployee,
    deleteEmployee,
    updateSubscription
  };
};