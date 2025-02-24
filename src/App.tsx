import React, { useEffect } from 'react';
import { ChefHat, LayoutGrid, List, Filter, Clock } from 'lucide-react';
import { ThemeToggle } from './components/ThemeToggle';
import { OrderCard } from './components/OrderCard';
import { Notifications } from './components/Notifications';
import { useThemeStore } from './store/theme';
import { useOrderStore, OrderStatus } from './store/orders';
import clsx from 'clsx';

function App() {
  const { isDarkMode } = useThemeStore();
  const { orders, getFilteredOrders, checkDelays } = useOrderStore();
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = React.useState<OrderStatus | undefined>();
  const [sortBy, setSortBy] = React.useState<'priority' | 'time'>('priority');

  // Check for delays every minute
  useEffect(() => {
    const interval = setInterval(checkDelays, 60000);
    return () => clearInterval(interval);
  }, [checkDelays]);

  const filteredOrders = React.useMemo(() => {
    const filtered = getFilteredOrders(statusFilter);
    
    if (sortBy === 'priority') {
      return filtered.sort((a, b) => {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      });
    } else {
      return filtered.sort((a, b) => {
        // Sort by estimated completion time for in-progress orders
        if (a.status === 'in-progress' && b.status === 'in-progress') {
          const aTime = a.startTime ? new Date(`2024-01-01 ${a.startTime}`).getTime() + (a.estimatedTime * 60000) : 0;
          const bTime = b.startTime ? new Date(`2024-01-01 ${b.startTime}`).getTime() + (b.estimatedTime * 60000) : 0;
          return aTime - bTime;
        }
        // Put in-progress orders first
        if (a.status === 'in-progress') return -1;
        if (b.status === 'in-progress') return 1;
        // Then sort by received time
        return new Date(`2024-01-01 ${a.timeReceived}`).getTime() - new Date(`2024-01-01 ${b.timeReceived}`).getTime();
      });
    }
  }, [getFilteredOrders, statusFilter, sortBy]);

  return (
    <div className={clsx('min-h-screen transition-colors', {
      'dark': isDarkMode,
      'bg-gray-100 text-gray-900': !isDarkMode,
      'bg-gray-900 text-white': isDarkMode,
    })}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <ChefHat className="w-8 h-8 text-orange-500" />
              <h1 className="text-2xl font-bold">Kitchen Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Notifications />
              <div className="flex space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={clsx('p-2 rounded-md transition-colors', {
                    'bg-white dark:bg-gray-600 shadow-sm': viewMode === 'grid',
                    'hover:bg-gray-200 dark:hover:bg-gray-600': viewMode !== 'grid',
                  })}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={clsx('p-2 rounded-md transition-colors', {
                    'bg-white dark:bg-gray-600 shadow-sm': viewMode === 'list',
                    'hover:bg-gray-200 dark:hover:bg-gray-600': viewMode !== 'list',
                  })}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
              <ThemeToggle />
            </div>
          </div>

          {/* Filters and Sorting */}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium">Filter by status:</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setStatusFilter(undefined)}
                className={clsx('px-3 py-1 rounded-md text-sm font-medium transition-colors', {
                  'bg-gray-200 dark:bg-gray-600': !statusFilter,
                  'hover:bg-gray-100 dark:hover:bg-gray-700': statusFilter,
                })}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={clsx('px-3 py-1 rounded-md text-sm font-medium transition-colors', {
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': statusFilter === 'pending',
                  'hover:bg-yellow-50 dark:hover:bg-yellow-900/50': statusFilter !== 'pending',
                })}
              >
                Pending
              </button>
              <button
                onClick={() => setStatusFilter('in-progress')}
                className={clsx('px-3 py-1 rounded-md text-sm font-medium transition-colors', {
                  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': statusFilter === 'in-progress',
                  'hover:bg-blue-50 dark:hover:bg-blue-900/50': statusFilter !== 'in-progress',
                })}
              >
                In Progress
              </button>
              <button
                onClick={() => setStatusFilter('ready')}
                className={clsx('px-3 py-1 rounded-md text-sm font-medium transition-colors', {
                  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': statusFilter === 'ready',
                  'hover:bg-green-50 dark:hover:bg-green-900/50': statusFilter !== 'ready',
                })}
              >
                Ready
              </button>
              <button
                onClick={() => setStatusFilter('delivered')}
                className={clsx('px-3 py-1 rounded-md text-sm font-medium transition-colors', {
                  'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-800': statusFilter === 'delivered',
                  'hover:bg-gray-200 dark:hover:bg-gray-700': statusFilter !== 'delivered',
                })}
              >
                Delivered
              </button>
            </div>

            <div className="flex items-center space-x-2 ml-auto">
              <Clock className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium">Sort by:</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSortBy('priority')}
                  className={clsx('px-3 py-1 rounded-md text-sm font-medium transition-colors', {
                    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200': sortBy === 'priority',
                    'hover:bg-purple-50 dark:hover:bg-purple-900/50': sortBy !== 'priority',
                  })}
                >
                  Priority
                </button>
                <button
                  onClick={() => setSortBy('time')}
                  className={clsx('px-3 py-1 rounded-md text-sm font-medium transition-colors', {
                    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200': sortBy === 'time',
                    'hover:bg-indigo-50 dark:hover:bg-indigo-900/50': sortBy !== 'time',
                  })}
                >
                  Estimated Time
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={clsx('grid gap-6', {
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-3': viewMode === 'grid',
          'grid-cols-1': viewMode === 'list',
        })}>
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} {...order} />
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;