import { create } from 'zustand';

export type OrderStatus = 'pending' | 'in-progress' | 'ready' | 'delivered';
export type OrderPriority = 'high' | 'medium' | 'low';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  tableNumber: string;
  items: OrderItem[];
  status: OrderStatus;
  priority: OrderPriority;
  timeReceived: string;
  estimatedTime: number; // in minutes
  guests: number;
  readyTime?: string;
  deliveredTime?: string;
  waiterNotified?: boolean;
  startTime?: string;
  isDelayed?: boolean;
  progress?: number;
}

interface OrderStore {
  orders: Order[];
  notifications: string[];
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateOrderPriority: (orderId: string, priority: OrderPriority) => void;
  getFilteredOrders: (status?: OrderStatus) => Order[];
  markAsNotified: (orderId: string) => void;
  clearNotification: (index: number) => void;
  updateOrderProgress: (orderId: string, progress: number) => void;
  checkDelays: () => void;
}

// Mock data
const initialOrders: Order[] = [
  {
    id: '1',
    orderNumber: '001',
    tableNumber: '15',
    items: [
      { id: '1', name: 'Grilled Salmon', quantity: 1 },
      { id: '2', name: 'Caesar Salad', quantity: 1 },
      { id: '3', name: 'Chocolate Mousse', quantity: 1 }
    ],
    status: 'pending',
    priority: 'high',
    timeReceived: '14:30',
    estimatedTime: 25,
    guests: 2,
    progress: 0
  },
  {
    id: '2',
    orderNumber: '002',
    tableNumber: '07',
    items: [
      { id: '4', name: 'Ribeye Steak', quantity: 2, notes: 'Medium rare' },
      { id: '5', name: 'Mashed Potatoes', quantity: 2 },
      { id: '6', name: 'Wine', quantity: 1 }
    ],
    status: 'in-progress',
    priority: 'medium',
    timeReceived: '14:25',
    estimatedTime: 30,
    guests: 4,
    progress: 30
  },
  {
    id: '3',
    orderNumber: '003',
    tableNumber: '23',
    items: [
      { id: '7', name: 'Pasta Carbonara', quantity: 2 },
      { id: '8', name: 'Garlic Bread', quantity: 1 },
      { id: '9', name: 'Tiramisu', quantity: 2 }
    ],
    status: 'ready',
    priority: 'low',
    timeReceived: '14:15',
    estimatedTime: 20,
    guests: 3,
    progress: 100
  }
];

const calculateTimeElapsed = (startTime: string): number => {
  const start = new Date(`2024-01-01 ${startTime}`);
  const now = new Date();
  now.setFullYear(2024, 0, 1); // Set to same date for comparison
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60)); // Convert to minutes
};

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: initialOrders,
  notifications: [],
  updateOrderStatus: (orderId, status) =>
    set((state) => {
      const currentTime = new Date().toLocaleTimeString();
      const updatedOrders = state.orders.map((order) => {
        if (order.id === orderId) {
          const updates: Partial<Order> = { status };
          
          if (status === 'in-progress' && !order.startTime) {
            updates.startTime = currentTime;
            updates.progress = 0;
          } else if (status === 'ready') {
            updates.readyTime = currentTime;
            updates.progress = 100;
            if (!order.waiterNotified) {
              state.notifications.push(`Order #${order.orderNumber} for Table ${order.tableNumber} is ready for pickup!`);
            }
          } else if (status === 'delivered') {
            updates.deliveredTime = currentTime;
          }
          
          return { ...order, ...updates };
        }
        return order;
      });

      return {
        orders: updatedOrders,
        notifications: [...state.notifications],
      };
    }),
  updateOrderPriority: (orderId, priority) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId ? { ...order, priority } : order
      ),
    })),
  getFilteredOrders: (status) => {
    const orders = get().orders;
    if (!status) return orders;
    return orders.filter((order) => order.status === status);
  },
  markAsNotified: (orderId) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId ? { ...order, waiterNotified: true } : order
      ),
    })),
  clearNotification: (index) =>
    set((state) => ({
      notifications: state.notifications.filter((_, i) => i !== index),
    })),
  updateOrderProgress: (orderId, progress) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId ? { ...order, progress } : order
      ),
    })),
  checkDelays: () =>
    set((state) => {
      const updatedOrders = state.orders.map((order) => {
        if (order.status === 'in-progress' && order.startTime) {
          const timeElapsed = calculateTimeElapsed(order.startTime);
          const isNowDelayed = timeElapsed > order.estimatedTime;
          
          if (isNowDelayed && !order.isDelayed) {
            state.notifications.push(
              `⚠️ Alert: Order #${order.orderNumber} for Table ${order.tableNumber} is taking longer than estimated!`
            );
          }
          
          return { ...order, isDelayed: isNowDelayed };
        }
        return order;
      });

      return {
        orders: updatedOrders,
        notifications: [...state.notifications],
      };
    }),
}));