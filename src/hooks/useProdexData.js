
import { useProdexStore, updateAppDataSnapshot } from '@/lib/prodex-store';

export const useProdexData = () => {
  const data = useProdexStore((state) => state.appData);

  const addDelivery = (delivery) => {
    updateAppDataSnapshot((previousData) => ({
      ...previousData,
      deliveries: [{ ...delivery, id: `DEL-${Date.now()}` }, ...previousData.deliveries]
    }));
  };

  const updateDelivery = (id, updates) => {
    updateAppDataSnapshot((previousData) => ({
      ...previousData,
      deliveries: previousData.deliveries.map((delivery) => delivery.id === id ? { ...delivery, ...updates } : delivery)
    }));
  };

  const deleteDelivery = (id) => {
    updateAppDataSnapshot((previousData) => ({
      ...previousData,
      deliveries: previousData.deliveries.filter((delivery) => delivery.id !== id)
    }));
  };

  const addEmployee = (emp) => {
    updateAppDataSnapshot((previousData) => ({
      ...previousData,
      employees: [{ ...emp, id: `emp-${Date.now()}`, deliveries: 0 }, ...previousData.employees]
    }));
  };

  const updateEmployee = (id, updates) => {
    updateAppDataSnapshot((previousData) => ({
      ...previousData,
      employees: previousData.employees.map((employee) => employee.id === id ? { ...employee, ...updates } : employee)
    }));
  };

  const deleteEmployee = (id) => {
    updateAppDataSnapshot((previousData) => ({
      ...previousData,
      employees: previousData.employees.filter((employee) => employee.id !== id)
    }));
  };

  const updateCompany = (updates) => {
    updateAppDataSnapshot((previousData) => ({
      ...previousData,
      company: { ...previousData.company, ...updates }
    }));
  };

  return {
    data,
    addDelivery,
    updateDelivery,
    deleteDelivery,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    updateCompany
  };
};
