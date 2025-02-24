import React, { useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { useOrderStore } from '../store/orders';
import clsx from 'clsx';

export const Notifications: React.FC = () => {
  const { notifications, clearNotification } = useOrderStore();
  const [isOpen, setIsOpen] = React.useState(false);

  useEffect(() => {
    if (notifications.length > 0) {
      setIsOpen(true);
    }
  }, [notifications.length]);

  if (notifications.length === 0) {
    return (
      <button className="relative p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
        <Bell className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      >
        <Bell className="w-5 h-5 text-orange-500" />
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {notifications.length}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Notifications</h3>
            <div className="space-y-2">
              {notifications.map((notification, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between bg-orange-50 dark:bg-orange-900/20 p-3 rounded-md"
                >
                  <p className="text-sm flex-1">{notification}</p>
                  <button
                    onClick={() => clearNotification(index)}
                    className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};