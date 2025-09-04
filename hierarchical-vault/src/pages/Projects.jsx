import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/api';
import Loading from '../components/Loading';
import Error from '../components/Error';
import EmptyState from '../components/EmptyState';
import {
  DocumentTextIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await projectService.getAll();
      setProjects(response.data.data);
    } catch (err) {
      setError('فشل في تحميل المشاريع');
      console.error('خطأ في تحميل المشاريع:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (project) => {
    setProjectToDelete(project);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;

    try {
      await projectService.delete(projectToDelete.id);
      setProjects(prev => prev.filter(p => p.id !== projectToDelete.id));
      setShowDeleteModal(false);
      setProjectToDelete(null);
    } catch (err) {
      console.error('خطأ في حذف المشروع:', err);
      alert('فشل في حذف المشروع');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { class: 'badge-success', text: 'نشط' },
      completed: { class: 'badge-info', text: 'مكتمل' },
      suspended: { class: 'badge-warning', text: 'معلق' },
    };

    const config = statusConfig[status] || statusConfig.active;
    return (
      <span className={`badge ${config.class}`}>
        {config.text}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading size="lg" text="جاري تحميل المشاريع..." />
      </div>
    );
  }

  if (error) {
    return <Error message={error} onRetry={fetchProjects} />;
  }

  return (
    <div className="space-y-6">
      {/* العنوان والأزرار */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المشاريع</h1>
          <p className="text-gray-600 mt-1">
            إدارة المشاريع والأنشطة المالية
          </p>
        </div>
        {user?.role === 'admin' && (
          <Link
            to="/projects/new"
            className="btn-primary flex items-center space-x-2 space-x-reverse"
          >
            <PlusIcon className="w-5 h-5" />
            <span>إضافة مشروع جديد</span>
          </Link>
        )}
      </div>

      {/* قائمة المشاريع */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <DocumentTextIcon className="w-8 h-8 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {project.vault_name}
                    </p>
                  </div>
                </div>
                {getStatusBadge(project.status)}
              </div>

              {project.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {project.description}
                </p>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">الخزينة:</span>
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <FolderIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{project.vault_name}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">الرصيد:</span>
                  <span className="font-medium text-gray-900">
                    {new Intl.NumberFormat('ar-SA', {
                      style: 'currency',
                      currency: 'SAR',
                    }).format(project.vault_balance)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">التقارير:</span>
                  <span className="text-gray-900">{project.reports_count}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <Link
                  to={`/projects/${project.id}`}
                  className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                >
                  عرض التفاصيل
                </Link>
                
                {user?.role === 'admin' && (
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Link
                      to={`/projects/${project.id}/edit`}
                      className="p-1 text-gray-400 hover:text-blue-600 rounded"
                      title="تعديل"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(project)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                      title="حذف"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          type="projects"
          title="لا توجد مشاريع"
          description="لم يتم إنشاء أي مشاريع بعد"
          action={
            user?.role === 'admin' ? (
              <Link to="/projects/new" className="btn-primary">
                إضافة مشروع جديد
              </Link>
            ) : null
          }
        />
      )}

      {/* نافذة تأكيد الحذف */}
      {showDeleteModal && projectToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              تأكيد الحذف
            </h3>
            <p className="text-gray-600 mb-6">
              هل أنت متأكد من حذف المشروع "{projectToDelete.name}"؟ 
              لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex items-center justify-end space-x-3 space-x-reverse">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setProjectToDelete(null);
                }}
                className="btn-secondary"
              >
                إلغاء
              </button>
              <button
                onClick={confirmDelete}
                className="btn-danger"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;