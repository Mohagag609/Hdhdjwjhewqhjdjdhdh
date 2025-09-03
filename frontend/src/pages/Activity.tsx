import React from 'react';
import { Activity as ActivityIcon, Clock, User, ArrowUpDown } from 'lucide-react';

const Activity: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">سجل النشاط</h1>
        <p className="text-gray-600">تتبع جميع الأنشطة والمعاملات في النظام</p>
      </div>

      {/* Coming Soon */}
      <div className="card">
        <div className="card-body text-center py-12">
          <div className="flex justify-center mb-4">
            <ActivityIcon className="h-16 w-16 text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            سجل النشاط
          </h3>
          <p className="text-gray-600 mb-6">
            قريباً ستتوفر ميزة تتبع النشاط التي تشمل:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <Clock className="h-8 w-8 text-primary-600 ml-3" />
              <div>
                <h4 className="font-medium text-gray-900">التسلسل الزمني</h4>
                <p className="text-sm text-gray-600">تتبع جميع الأنشطة بالوقت</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <User className="h-8 w-8 text-success-600 ml-3" />
              <div>
                <h4 className="font-medium text-gray-900">تتبع المستخدمين</h4>
                <p className="text-sm text-gray-600">معرفة من قام بكل عملية</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <ArrowUpDown className="h-8 w-8 text-warning-600 ml-3" />
              <div>
                <h4 className="font-medium text-gray-900">تتبع المعاملات</h4>
                <p className="text-sm text-gray-600">تفاصيل كاملة لكل معاملة</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <ActivityIcon className="h-8 w-8 text-danger-600 ml-3" />
              <div>
                <h4 className="font-medium text-gray-900">الأنشطة المهمة</h4>
                <p className="text-sm text-gray-600">تسليط الضوء على الأنشطة المهمة</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Activity;