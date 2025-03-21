'use client';
import { useState, useEffect } from 'react';
import { 
  Calendar, 
  ChartLine, 
  ChartBar, 
  Clock, 
  Globe, 
  Users, 
  ArrowsClockwise, 
  CaretDown, 
  CaretLeft, 
  CaretRight,
  FileArrowDown
} from 'phosphor-react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { LoadingState } from '@/components/admin/LoadingState';
import { formatDuration, formatAnalyticsDate } from '@/lib/index.mjs';

// Import chart components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('7days');
  const [customPeriod, setCustomPeriod] = useState({
    startDate: '',
    endDate: ''
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [cleanupMessage, setCleanupMessage] = useState(null);
  const [cleaningUp, setCleaningUp] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [period, customPeriod]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ period });
      
      if (period === 'custom') {
        params.append('startDate', customPeriod.startDate);
        params.append('endDate', customPeriod.endDate);
      }
      
      const res = await fetch(`/api/admin/analytics?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const data = await res.json();
      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        throw new Error(data.error || 'Failed to fetch analytics data');
      }
    } catch (error) {
      setError(error.message);
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    if (newPeriod !== 'custom') {
      setShowDatePicker(false);
    }
  };

  const handleDateChange = (e, field) => {
    setCustomPeriod({
      ...customPeriod,
      [field]: e.target.value
    });
  };

  const exportToCsv = () => {
    if (!analytics) return;
    
    // Convert analytics data to CSV format
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Page Views
    csvContent += 'Daily Page Views\n';
    csvContent += 'Date,Count\n';
    analytics.dailyPageViews.forEach(item => {
      csvContent += `${item._id},${item.count}\n`;
    });
    
    // Unique Visitors
    csvContent += '\nDaily Unique Visitors\n';
    csvContent += 'Date,Count\n';
    analytics.dailyUniqueVisitors.forEach(item => {
      csvContent += `${item._id},${item.count}\n`;
    });
    
    // Most Visited Pages
    csvContent += '\nMost Visited Pages\n';
    csvContent += 'Page,Visits\n';
    analytics.mostVisitedPages.forEach(item => {
      csvContent += `${item._id},${item.visits}\n`;
    });
    
    // Avg Time Spent
    csvContent += '\nAverage Time Spent\n';
    csvContent += 'Page,Average Duration (seconds),Total Visits\n';
    analytics.avgTimeSpent.forEach(item => {
      csvContent += `${item._id},${item.avgDuration.toFixed(2)},${item.totalVisits}\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `analytics-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const cleanupAdminData = async () => {
    if (!confirm("This will permanently remove any admin analytics data that may have been accidentally collected. Continue?")) {
      return;
    }
    
    try {
      setCleaningUp(true);
      const res = await fetch('/api/admin/analytics/cleanup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      const data = await res.json();
      if (data.success) {
        setCleanupMessage({
          type: 'success',
          text: `Cleanup successful: ${data.stats.adminUserEntriesRemoved} admin user entries and ${data.stats.adminPathEntriesRemoved} admin path entries removed.`
        });
        fetchAnalytics(); // Refresh analytics after cleanup
      } else {
        throw new Error(data.error || 'Failed to clean up admin data');
      }
    } catch (error) {
      setCleanupMessage({
        type: 'error',
        text: `Error: ${error.message}`
      });
      console.error('Error cleaning up admin data:', error);
    } finally {
      setCleaningUp(false);
      setTimeout(() => setCleanupMessage(null), 5000); // Clear message after 5 seconds
    }
  };

  if (loading && !analytics) {
    return <LoadingState />;
  }

  // Prepare chart data
  const prepareVisitsChartData = () => {
    if (!analytics) return null;
    
    const labels = analytics.dailyPageViews.map(item => formatAnalyticsDate(item._id));
    const pageViews = analytics.dailyPageViews.map(item => item.count);
    const uniqueVisitors = analytics.dailyUniqueVisitors.map(item => {
      const matchingDate = analytics.dailyUniqueVisitors.find(v => v._id === item._id);
      return matchingDate ? matchingDate.count : 0;
    });
    
    return {
      labels,
      datasets: [
        {
          label: 'Page Views',
          data: pageViews,
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
        {
          label: 'Unique Visitors',
          data: uniqueVisitors,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
      ],
    };
  };
  
  const preparePageVisitsData = () => {
    if (!analytics) return null;
    
    const labels = analytics.mostVisitedPages.map(item => {
      // Shorten page names for display
      const page = item._id;
      return page.length > 20 ? page.substring(0, 20) + '...' : page;
    });
    const visits = analytics.mostVisitedPages.map(item => item.visits);
    
    return {
      labels,
      datasets: [
        {
          label: 'Page Visits',
          data: visits,
          backgroundColor: 'rgba(83, 214, 149, 0.6)',
        },
      ],
    };
  };
  
  const prepareTimeSpentData = () => {
    if (!analytics) return null;
    
    const labels = analytics.avgTimeSpent.map(item => {
      // Shorten page names for display
      const page = item._id;
      return page.length > 15 ? page.substring(0, 15) + '...' : page;
    });
    const durations = analytics.avgTimeSpent.map(item => item.avgDuration.toFixed(1));
    
    return {
      labels,
      datasets: [
        {
          label: 'Average Time (seconds)',
          data: durations,
          backgroundColor: [
            'rgba(83, 214, 149, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(199, 199, 199, 0.6)',
            'rgba(83, 102, 255, 0.6)',
            'rgba(255, 99, 255, 0.6)',
          ],
        },
      ],
    };
  };

  return (
    <AdminGuard>
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-xl font-bold text-gray-900">User Analytics</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track user behavior and site performance metrics
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative">
              <div 
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white cursor-pointer"
              >
                <Calendar size={18} className="text-gray-500" />
                <span className="text-sm text-gray-700">
                  {period === '24h' && 'Last 24 hours'}
                  {period === '7days' && 'Last 7 days'}
                  {period === '30days' && 'Last 30 days'}
                  {period === 'custom' && 'Custom range'}
                </span>
                <CaretDown size={16} className="text-gray-500" />
              </div>
              
              {showDatePicker && (
                <div className="absolute right-0 mt-2 p-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-56">
                  <div className="space-y-1">
                    <button 
                      onClick={() => handlePeriodChange('24h')}
                      className={`text-sm w-full text-left px-3 py-2 rounded ${period === '24h' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                    >
                      Last 24 hours
                    </button>
                    <button 
                      onClick={() => handlePeriodChange('7days')}
                      className={`text-sm w-full text-left px-3 py-2 rounded ${period === '7days' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                    >
                      Last 7 days
                    </button>
                    <button 
                      onClick={() => handlePeriodChange('30days')}
                      className={`text-sm w-full text-left px-3 py-2 rounded ${period === '30days' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                    >
                      Last 30 days
                    </button>
                    <button 
                      onClick={() => {
                        handlePeriodChange('custom');
                        setShowDatePicker(true);
                      }}
                      className={`text-sm w-full text-left px-3 py-2 rounded ${period === 'custom' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                    >
                      Custom range
                    </button>
                    
                    {period === 'custom' && (
                      <div className="pt-2 border-t mt-2">
                        <div className="mb-2">
                          <label className="block text-xs text-gray-500 mb-1">Start date</label>
                          <input
                            type="date"
                            value={customPeriod.startDate}
                            onChange={(e) => handleDateChange(e, 'startDate')}
                            className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">End date</label>
                          <input
                            type="date"
                            value={customPeriod.endDate}
                            onChange={(e) => handleDateChange(e, 'endDate')}
                            className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={fetchAnalytics}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 bg-white"
            >
              <ArrowsClockwise size={18} className="text-gray-500" />
              <span className="text-sm text-gray-700">Refresh</span>
            </button>
            
            <button
              onClick={exportToCsv}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[#53D695] text-white"
            >
              <FileArrowDown size={18} />
              <span className="text-sm">Export</span>
            </button>
            
            <button
              onClick={cleanupAdminData}
              disabled={cleaningUp}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              {cleaningUp ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
              ) : (
                <ArrowsClockwise size={18} />
              )}
              <span className="text-sm">Clean Admin Data</span>
            </button>
          </div>
        </div>
        
        {/* Show cleanup message */}
        {cleanupMessage && (
          <div className={`mb-4 p-3 rounded-lg ${
            cleanupMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {cleanupMessage.text}
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-500">Total Page Views</div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Globe size={18} weight="fill" className="text-blue-500" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-gray-900">
                {analytics?.dailyPageViews.reduce((sum, day) => sum + day.count, 0) || 0}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                During selected period
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-500">Unique Visitors</div>
              <div className="p-2 bg-green-50 rounded-lg">
                <Users size={18} weight="fill" className="text-green-500" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-gray-900">
                {analytics?.dailyUniqueVisitors.reduce((sum, day) => sum + day.count, 0) || 0}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                During selected period
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-500">Avg. Time on Site</div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <Clock size={18} weight="fill" className="text-purple-500" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-gray-900">
                {analytics ? formatDuration(
                  Math.round(
                    analytics.avgTimeSpent.reduce((sum, page) => sum + page.avgDuration * page.totalVisits, 0) / 
                    analytics.avgTimeSpent.reduce((sum, page) => sum + page.totalVisits, 1)
                  )
                ) : '0 sec'}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Per session
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-500">Bounce Rate</div>
              <div className="p-2 bg-orange-50 rounded-lg">
                <ArrowsClockwise size={18} weight="fill" className="text-orange-500" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-gray-900">
                {analytics?.bounceRate ? `${analytics.bounceRate.toFixed(1)}%` : '0%'}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Single page sessions
              </div>
            </div>
          </div>
        </div>
        
        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Traffic Overview</h2>
            {analytics && <Line data={prepareVisitsChartData()} options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                tooltip: {
                  mode: 'index',
                  intersect: false,
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    precision: 0
                  }
                }
              },
              interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
              }
            }} />}
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Most Visited Pages</h2>
            {analytics && <Bar data={preparePageVisitsData()} options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  callbacks: {
                    title: function(context) {
                      // Show full page path in tooltip
                      const index = context[0].dataIndex;
                      return analytics.mostVisitedPages[index]._id;
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    precision: 0
                  }
                }
              }
            }} />}
          </div>
        </div>
        
        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Time Spent per Page</h2>
            <div className="h-[350px]">
              {analytics && <Doughnut data={prepareTimeSpentData()} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                  },
                  tooltip: {
                    callbacks: {
                      title: function(context) {
                        // Show full page path in tooltip
                        const index = context[0].dataIndex;
                        return analytics.avgTimeSpent[index]._id;
                      },
                      label: function(context) {
                        const value = context.raw;
                        return `Average time: ${formatDuration(value)}`;
                      }
                    }
                  }
                }
              }} />}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
            <h2 className="text-lg font-medium text-gray-800 mb-4">User Engagement by Hour</h2>
            <div className="h-[350px] flex items-center justify-center">
              {analytics?.hourlyEngagement?.length > 0 ? (
                <div>Chart will be displayed here</div>
              ) : (
                <div className="text-gray-500 text-center">
                  <p>Not enough hourly data to display</p>
                  <p className="text-sm mt-1">Try selecting a larger date range</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
