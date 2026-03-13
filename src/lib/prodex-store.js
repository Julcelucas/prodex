import { useSyncExternalStore } from 'react';

const cloneData = (value) => JSON.parse(JSON.stringify(value));

const INITIAL_DELIVERIES = [
  { id: 'DEL-1001', customerName: 'João Silva', phone: '923123456', address: 'Luanda, Mutamba', type: 'Express', status: 'Pendente', employee: '', expectedDate: new Date(Date.now() + 86400000).toISOString(), createdDate: new Date().toISOString(), priority: 'High', notes: 'Ligar antes de entregar.' },
  { id: 'DEL-1002', customerName: 'Maria Costa', phone: '912333444', address: 'Talatona', type: 'Standard', status: 'Em Andamento', employee: 'EMP-001', expectedDate: new Date(Date.now() - 3600000).toISOString(), createdDate: new Date(Date.now() - 86400000).toISOString(), priority: 'Medium', notes: '' },
  { id: 'DEL-1003', customerName: 'Carlos Bento', phone: '934555666', address: 'Benfica', type: 'Standard', status: 'Entregue', employee: 'EMP-002', expectedDate: new Date(Date.now() - 172800000).toISOString(), createdDate: new Date(Date.now() - 259200000).toISOString(), priority: 'Low', notes: '' },
];

const INITIAL_EMPLOYEES = [
  { id: 'EMP-001', name: 'Ana Souza', email: 'ana.s@prodex.ao', phone: '999111222', status: 'Active', deliveriesAssigned: 1 },
  { id: 'EMP-002', name: 'Paulo Santos', email: 'paulo.s@prodex.ao', phone: '999333444', status: 'Active', deliveriesAssigned: 1 },
];

const INITIAL_APP_DATA = {
  company: {
    name: 'PRODEX Angola Lda',
    email: 'geral@prodex.ao',
    phone: '+244 900 000 000',
    address: 'Luanda, Angola',
    subscription: 'Pro',
    status: 'active'
  },
  employees: [
    { id: 'emp-1', name: 'João Silva', email: 'joao@prodex.ao', phone: '923000111', status: 'active', deliveries: 12 },
    { id: 'emp-2', name: 'Maria Santos', email: 'maria@prodex.ao', phone: '923000222', status: 'active', deliveries: 8 }
  ],
  deliveries: [
    { id: 'DEL-001', customer_name: 'Ana Costa', phone: '912333444', address: 'Talatona', type: 'Standard', date: new Date().toISOString(), expected: new Date(Date.now() + 86400000).toISOString(), status: 'Pendente', assigned_to: 'emp-1' },
    { id: 'DEL-002', customer_name: 'Carlos Bento', phone: '912333555', address: 'Mutamba', type: 'Express', date: new Date().toISOString(), expected: new Date(Date.now() - 86400000).toISOString(), status: 'Em Andamento', assigned_to: 'emp-2' }
  ]
};

const createInitialDb = () => ({
  users: [],
  companies: [],
  orders: [],
  order_history: [],
  payments: []
});

const createInitialState = () => ({
  db: createInitialDb(),
  orders: [],
  testOrders: [],
  deliveries: cloneData(INITIAL_DELIVERIES),
  employees: cloneData(INITIAL_EMPLOYEES),
  alerts: { active: [], history: [], muted: [] },
  settings: { autoRefresh: false, soundEnabled: true },
  sound: { volume: 0.8, muted: false },
  alertPanel: { muted: false },
  appData: cloneData(INITIAL_APP_DATA)
});

let store = createInitialState();

const listeners = new Set();

const emitChange = () => {
  listeners.forEach((listener) => listener());
};

const replaceStore = (nextStore) => {
  store = nextStore;
  emitChange();
  return store;
};

const setSlice = (sliceName, value) => replaceStore({
  ...store,
  [sliceName]: cloneData(value)
});

const updateSlice = (sliceName, updater) => {
  const nextValue = updater(cloneData(store[sliceName]));
  return setSlice(sliceName, nextValue);
};

export const subscribeProdexStore = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useProdexStore = (selector = (state) => state) => useSyncExternalStore(
  subscribeProdexStore,
  () => selector(store),
  () => selector(store)
);

export const getDbSnapshot = () => cloneData(store.db);
export const setDbSnapshot = (db) => setSlice('db', db);
export const updateDbSnapshot = (updater) => updateSlice('db', updater);

export const getOrdersSnapshot = () => cloneData(store.orders);
export const setOrdersSnapshot = (orders) => setSlice('orders', orders);
export const updateOrdersSnapshot = (updater) => updateSlice('orders', updater);

export const getTestOrdersSnapshot = () => cloneData(store.testOrders);
export const setTestOrdersSnapshot = (orders) => setSlice('testOrders', orders);

export const getDeliveriesSnapshot = () => cloneData(store.deliveries);
export const setDeliveriesSnapshot = (deliveries) => setSlice('deliveries', deliveries);

export const getEmployeesSnapshot = () => cloneData(store.employees);
export const setEmployeesSnapshot = (employees) => setSlice('employees', employees);

export const getAlertsSnapshot = () => cloneData(store.alerts);
export const setAlertsSnapshot = (alerts) => setSlice('alerts', alerts);

export const getSettingsSnapshot = () => cloneData(store.settings);
export const setSettingsSnapshot = (settings) => setSlice('settings', settings);

export const getSoundSettingsSnapshot = () => cloneData(store.sound);
export const setSoundSettingsSnapshot = (sound) => setSlice('sound', sound);
export const updateSoundSettingsSnapshot = (updater) => updateSlice('sound', updater);

export const getAlertPanelSnapshot = () => cloneData(store.alertPanel);
export const setAlertPanelSnapshot = (alertPanel) => setSlice('alertPanel', alertPanel);

export const getAppDataSnapshot = () => cloneData(store.appData);
export const setAppDataSnapshot = (appData) => setSlice('appData', appData);
export const updateAppDataSnapshot = (updater) => updateSlice('appData', updater);

export const resetProdexStore = () => replaceStore(createInitialState());