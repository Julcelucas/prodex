import {
  getAlertsSnapshot,
  getDeliveriesSnapshot,
  getEmployeesSnapshot,
  getSettingsSnapshot,
  setAlertsSnapshot,
  setDeliveriesSnapshot,
  setEmployeesSnapshot,
  setSettingsSnapshot,
} from '@/lib/prodex-store';

export const useProdexDataStore = () => ({
  getDeliveries: getDeliveriesSnapshot,
  saveDeliveries: setDeliveriesSnapshot,
  getEmployees: getEmployeesSnapshot,
  saveEmployees: setEmployeesSnapshot,
  getAlerts: getAlertsSnapshot,
  saveAlerts: setAlertsSnapshot,
  getSettings: getSettingsSnapshot,
  saveSettings: setSettingsSnapshot,
});