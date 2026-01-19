'use client';

import { useState, useEffect } from 'react';
import { servicesAPI, type Service, type ServiceCategory } from '@/lib/api';

export default function ServicesPage() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form states
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', icon: '', order: 0 });
  const [serviceForm, setServiceForm] = useState({ 
    name: '', 
    description: '', 
    categoryId: '', 
    duration: 30, 
    price: 0,
    order: 0 
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesRes, servicesRes] = await Promise.all([
        servicesAPI.getCategories(),
        servicesAPI.getAll(),
      ]);
      setCategories(categoriesRes);
      setServices(servicesRes);
    } catch (err) {
      setError('Мэдээлэл ачаалахад алдаа гарлаа');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Category handlers
  const openCategoryModal = (category?: ServiceCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        description: category.description || '',
        icon: category.icon || '',
        order: category.order,
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: '', description: '', icon: '', order: 0 });
    }
    setShowCategoryModal(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await servicesAPI.updateCategory(editingCategory.id, categoryForm);
      } else {
        await servicesAPI.createCategory(categoryForm);
      }
      setShowCategoryModal(false);
      loadData();
    } catch (err) {
      alert('Алдаа гарлаа');
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Энэ ангилалыг устгах уу?')) return;
    try {
      await servicesAPI.deleteCategory(id);
      loadData();
    } catch (err) {
      alert('Устгахад алдаа гарлаа');
      console.error(err);
    }
  };

  // Service handlers
  const openServiceModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setServiceForm({
        name: service.name,
        description: service.description || '',
        categoryId: service.categoryId,
        duration: service.duration,
        price: service.price || 0,
        order: service.order,
      });
    } else {
      setEditingService(null);
      setServiceForm({ 
        name: '', 
        description: '', 
        categoryId: categories[0]?.id || '', 
        duration: 30, 
        price: 0,
        order: 0 
      });
    }
    setShowServiceModal(true);
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingService) {
        await servicesAPI.updateService(editingService.id, serviceForm);
      } else {
        await servicesAPI.createService(serviceForm);
      }
      setShowServiceModal(false);
      loadData();
    } catch (err) {
      alert('Алдаа гарлаа');
      console.error(err);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Энэ үйлчилгээг устгах уу?')) return;
    try {
      await servicesAPI.deleteService(id);
      loadData();
    } catch (err) {
      alert('Устгахад алдаа гарлаа');
      console.error(err);
    }
  };

  const handleToggleService = async (service: Service) => {
    try {
      await servicesAPI.updateService(service.id, { isActive: !service.isActive });
      loadData();
    } catch (err) {
      alert('Алдаа гарлаа');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Үйлчилгээнүүд</h1>
          <p className="text-gray-500 mt-1">
            {categories.length} ангилал, {services.length} үйлчилгээ бүртгэлтэй
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => openCategoryModal()}
            className="btn-secondary"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ангилал нэмэх
          </button>
          <button
            onClick={() => openServiceModal()}
            className="btn-primary"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Үйлчилгээ нэмэх
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-card p-4 text-red-700 flex items-center gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Categories & Services */}
      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-card shadow-card overflow-hidden">
            {/* Category Header */}
            <div className="bg-gradient-to-r from-surface-50 to-white px-6 py-4 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{category.name}</h2>
                  {category.description && (
                    <p className="text-sm text-gray-500 mt-0.5">{category.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openCategoryModal(category)}
                  className="text-brand-600 hover:bg-brand-50 p-2 rounded-lg transition-colors"
                  title="Засварлах"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  title="Устгах"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Services Table */}
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-surface-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Нэр</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Хугацаа</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Үнэ</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Төлөв</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Үйлдэл</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {services
                  .filter((s) => s.categoryId === category.id)
                  .map((service) => (
                    <tr key={service.id} className="hover:bg-surface-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{service.name}</div>
                          {service.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">{service.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 bg-surface-100 rounded-lg text-gray-600 text-sm">
                          <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {service.duration} мин
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {service.price ? `${service.price.toLocaleString()}₮` : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleService(service)}
                          className={`badge cursor-pointer hover:opacity-80 transition-opacity ${
                            service.isActive
                              ? 'badge-success'
                              : 'badge-default'
                          }`}
                        >
                          {service.isActive ? 'Идэвхтэй' : 'Идэвхгүй'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right space-x-1">
                        <button
                          onClick={() => openServiceModal(service)}
                          className="inline-flex items-center px-3 py-1.5 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors text-sm"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Засах
                        </button>
                        <button
                          onClick={() => handleDeleteService(service.id)}
                          className="inline-flex items-center px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Устгах
                        </button>
                      </td>
                    </tr>
                  ))}
                {services.filter((s) => s.categoryId === category.id).length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-surface-100 rounded-xl flex items-center justify-center mb-3">
                          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                        </div>
                        <p className="text-gray-500">Үйлчилгээ байхгүй байна</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ))}

        {categories.length === 0 && (
          <div className="bg-white rounded-card shadow-card p-16 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">Ангилал бүртгэгдээгүй байна</p>
              <p className="text-gray-400 text-sm mt-1">Эхлээд ангилал нэмнэ үү</p>
            </div>
          </div>
        )}
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-card shadow-xl w-full max-w-md p-6 mx-4 animate-slideIn">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCategory ? 'Ангилал засварлах' : 'Ангилал нэмэх'}
              </h2>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCategorySubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Нэр *</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  required
                  className="input"
                  placeholder="Ангилалын нэр"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Тайлбар</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  rows={3}
                  className="input resize-none"
                  placeholder="Тайлбар оруулах"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Эрэмбэ</label>
                <input
                  type="number"
                  value={categoryForm.order}
                  onChange={(e) => setCategoryForm({ ...categoryForm, order: parseInt(e.target.value) || 0 })}
                  className="input"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="btn-secondary"
                >
                  Болих
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {editingCategory ? 'Хадгалах' : 'Нэмэх'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-card shadow-xl w-full max-w-md p-6 mx-4 animate-slideIn">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingService ? 'Үйлчилгээ засварлах' : 'Үйлчилгээ нэмэх'}
              </h2>
              <button
                onClick={() => setShowServiceModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleServiceSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ангилал *</label>
                <select
                  value={serviceForm.categoryId}
                  onChange={(e) => setServiceForm({ ...serviceForm, categoryId: e.target.value })}
                  required
                  className="input"
                >
                  <option value="">Сонгоно уу</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Нэр *</label>
                <input
                  type="text"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  required
                  className="input"
                  placeholder="Үйлчилгээний нэр"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Тайлбар</label>
                <textarea
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  rows={3}
                  className="input resize-none"
                  placeholder="Тайлбар оруулах"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Хугацаа (мин)</label>
                  <input
                    type="number"
                    value={serviceForm.duration}
                    onChange={(e) => setServiceForm({ ...serviceForm, duration: parseInt(e.target.value) || 30 })}
                    min="5"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Үнэ (₮)</label>
                  <input
                    type="number"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: parseInt(e.target.value) || 0 })}
                    min="0"
                    className="input"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
                  className="btn-secondary"
                >
                  Болих
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {editingService ? 'Хадгалах' : 'Нэмэх'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
