import React from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Activity,
  DollarSign,
  ArrowUpDown
} from 'lucide-react';

const Analytics: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">التحليلات المالية</h1>
        <p className="text-gray-600">تحليل متقدم للأداء المالي والاتجاهات</p>
      </div>

      {/* Coming Soon */}
      <div className="card">
        <div className="card-body text-center py-12">
          <div className="flex justify-center mb-4">
            <BarChart3 className="h-16 w-16 text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            التحليلات المتقدمة
          </h3>
          <p className="text-gray-600 mb-6">
            قريباً ستتوفر تحليلات متقدمة تشمل:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-success-600 ml-3" />
              <div>
                <h4 className="font-medium text-gray-900">تحليل الاتجاهات</h4>
                <p className="text-sm text-gray-600">تحليل الاتجاهات المالية</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <PieChart className="h-8 w-8 text-primary-600 ml-3" />
              <div>
                <h4 className="font-medium text-gray-900">توزيع الأموال</h4>
                <p className="text-sm text-gray-600">تحليل توزيع الأموال</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <Activity className="h-8 w-8 text-warning-600 ml-3" />
              <div>
                <h4 className="font-medium text-gray-900">النشاط المالي</h4>
                <p className="text-sm text-gray-600">تحليل النشاط المالي</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <DollarSign className="h-8 w-8 text-success-600 ml-3" />
              <div>
                <h4 className="font-medium text-gray-900">التوقعات</h4>
                <p className="text-sm text-gray-600">التوقعات المالية</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <ArrowUpDown className="h-8 w-8 text-danger-600 ml-3" />
              <div>
                <h4 className="font-medium text-gray-900">تحليل المخاطر</h4>
                <p className="text-sm text-gray-600">تقييم المخاطر المالية</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <BarChart3 className="h-8 w-8 text-primary-600 ml-3" />
              <div>
                <h4 className="font-medium text-gray-900">تقارير مخصصة</h4>
                <p className="text-sm text-gray-600">تقارير مخصصة حسب الحاجة</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;