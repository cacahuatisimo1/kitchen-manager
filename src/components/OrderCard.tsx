import React from 'react';
import { Clock, Users, AlertTriangle, Timer, Check } from 'lucide-react';
import { Order, OrderStatus, useOrderStore } from '../store/orders';
import clsx from 'clsx';

interface OrderCardProps extends Order {}

export const OrderCard: React.FC<OrderCardProps> = ({
  id,
  orderNumber,
  tableNumber,
  items,
  status,
  priority,
  timeReceived,
  estimatedTime,
  guests,
  readyTime,
  deliveredTime,
  progress = 0,
  isDelayed,
  startTime,
}) => {
  const { updateOrderStatus, updateOrderPriority } = useOrderStore();

  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'ready': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'delivered': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  };

  const priorityColors = {
    'high': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'medium': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    'low': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  };

  const handleStatusChange = (newStatus: OrderStatus) => {
    updateOrderStatus(id, newStatus);
  };

  const getProgressColor = () => {
    if (isDelayed) return 'bg-red-500';
    if (progress >= 100) return 'bg-green-500';
    return 'bg-blue-500';
  };

  const getTimeRemaining = () => {
    if (!startTime || status !== 'in-progress') return null;
    const start = new Date(`2024-01-01 ${startTime}`);
    const now = new Date();
    now.setFullYear(2024, 0, 1);
    const elapsedMinutes = Math.floor((now.getTime() - start.getTime()) / (1000 * 60));
    const remaining = estimatedTime - elapsedMinutes;
    return remaining > 0 ? remaining : 0;
  };

  const timeRemaining = getTimeRemaining();

  return (
    <div className={clsx(
      "bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-all",
      "border-l-4",
      {
        'border-red-500': priority === 'high',
        'border-orange-400': priority === 'medium',
        'border-gray-300': priority === 'low',
        'opacity-75': status === 'delivered',
      }
    )}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Order #{orderNumber}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Table {tableNumber}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColors[priority]}`}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </span>
        </div>
      </div>
      
      {status === 'in-progress' && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all ${getProgressColor()}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          {isDelayed && (
            <div className="flex items-center mt-2 text-red-500 dark:text-red-400">
              <AlertTriangle className="w-4 h-4 mr-1" />
              <span className="text-sm">Order is delayed</span>
            </div>
          )}
          {timeRemaining !== null && (
            <div className="text-sm mt-2 text-gray-600 dark:text-gray-400">
              Time remaining: {timeRemaining} minutes
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.id} className="text-gray-700 dark:text-gray-300 flex justify-between">
              <span>• {item.name} x{item.quantity}</span>
              {item.notes && (
                <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                  ({item.notes})
                </span>
              )}
            </li>
          ))}
        </ul>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span className="text-sm">{timeReceived}</span>
            </div>
            <div className="flex items-center">
              <Timer className="w-4 h-4 mr-1" />
              <span className="text-sm">{estimatedTime} min</span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span className="text-sm">{guests}</span>
            </div>
          </div>
        </div>

        {(readyTime || deliveredTime) && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {readyTime && <p>Ready at: {readyTime}</p>}
            {deliveredTime && <p>Delivered at: {deliveredTime}</p>}
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <button
            onClick={() => handleStatusChange('pending')}
            className={clsx(
              "flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              status === 'pending'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                : 'bg-gray-100 text-gray-600 hover:bg-yellow-50 dark:bg-gray-700 dark:text-gray-300'
            )}
          >
            Pending
          </button>
          <button
            onClick={() => handleStatusChange('in-progress')}
            className={clsx(
              "flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              status === 'in-progress'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                : 'bg-gray-100 text-gray-600 hover:bg-blue-50 dark:bg-gray-700 dark:text-gray-300'
            )}
          >
            In Progress
          </button>
          <button
            onClick={() => handleStatusChange('ready')}
            className={clsx(
              "flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              status === 'ready'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-gray-100 text-gray-600 hover:bg-green-50 dark:bg-gray-700 dark:text-gray-300'
            )}
          >
            Ready
          </button>
          <button
            onClick={() => handleStatusChange('delivered')}
            className={clsx(
              "flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              status === 'delivered'
                ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            )}
          >
            <Check className="w-4 h-4 mx-auto" />
          </button>
        </div>
      </div>
    </div>
  );
};