'use client';

import { useState, useEffect } from 'react';
import { servicesAPI, type Service, type ServiceCategory } from '@/lib/api';

export default function ServicesPage() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', icon: '', order: 0 });
  const [serviceForm, setServiceForm] = useState({ name: '', description: '', categoryId: '', duration: 30, price: 0, order: 0 });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [categoriesRes, servicesRes] = await Promise.all([
        servicesAPI.getCategories(),
        servicesAPI.getAll(),
      ]);
      setCategories(categoriesRes.data);
      setServices(servicesRes.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Мэдээлэл ачаалахад алдаа гарлаа';
      setError(message);
      console.error('[Services] Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCategoryModal = (category?: ServiceCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({ name: category.name, description: category.description || '', icon: category.icon || '', order: category.order });
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

  const openServiceModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setServiceForm({ name: service.name, description: service.description || '', categoryId: service.categoryId, duration: service.duration, price: service.price || 0, order: service.order });
    } else {
      setEditingService(null);
      setServiceForm({ name: '', description: '', categoryId: categories[0]?.id || '', duration: 30, price: 0, order: 0 });
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
      <div className="space-y-4 animate-fade-in">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="skeleton w-8 h-8 rounded-lg" />
              <div className="skeleton h-4 w-32 rounded" />
            </div>
            <div className="p-5 space-y-3">
              {[1, 2].map((j) => (
                <div key={j} className="skeleton h-12 rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Үйлчилгээнүүд</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {categories.length} ангилал · {services.length} үйлчилгээ
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => openCategoryModal()} className="btn btn-secondary btn-sm">
            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Ангилал
          </button>
          <button onClick={() => openServiceModal()} className="btn btn-primary btn-sm">
            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Үйлчилгээ нэмэх
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {/* Categories & Services */}
      <div className="space-y-4">
        {categories.map((category) => {
          const categoryServices = services.filter((s) => s.categoryId === category.id);
          const activeCount = categoryServices.filter((s) => s.isActive).length;

          return (
            <div key={category.id} className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
              {/* Category Header */}
              <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">{category.name}</h2>
                    <p className="text-xs text-slate-400">
                      {categoryServices.length} үйлчилгээ{activeCount > 0 ? ` · ${activeCount} идэвхтэй` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => openCategoryModal(category)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Засварлах"
                  >
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                    title="Устгах"
                  >
                    <svg className="w-4 h-4 text-slate-400 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Services */}
              {categoryServices.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-sm text-slate-400">Үйлчилгээ байхгүй</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block">
                    <table className="w-full">
                      <thead>
                        <tr className="table-header">
                          <th className="table-th">Нэр</th>
                          <th className="table-th">Хугацаа</th>
                          <th className="table-th">Үнэ</th>
                          <th className="table-th">Төлөв</th>
                          <th className="table-th text-right">Үйлдэл</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {categoryServices.map((service) => (
                          <tr key={service.id} className="table-row">
                            <td className="table-td">
                              <p className="text-sm font-medium text-slate-900">{service.name}</p>
                              {service.description && (
                                <p className="text-xs text-slate-400 truncate max-w-xs">{service.description}</p>
                              )}
                            </td>
                            <td className="table-td">
                              <span className="text-sm text-slate-500">{service.duration} мин</span>
                            </td>
                            <td className="table-td">
                              <span className="text-sm font-medium text-slate-900">
                                {service.price ? `${service.price.toLocaleString()}₮` : '—'}
                              </span>
                            </td>
                            <td className="table-td">
                              <button
                                onClick={() => handleToggleService(service)}
                                className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blush-500/10"
                                style={{ backgroundColor: service.isActive ? '#ea5672' : '#e2e8f0' }}
                              >
                                <span
                                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${
                                    service.isActive ? 'translate-x-[18px]' : 'translate-x-[3px]'
                                  }`}
                                />
                              </button>
                            </td>
                            <td className="table-td text-right">
                              <div className="flex items-center justify-end gap-0.5">
                                <button
                                  onClick={() => openServiceModal(service)}
                                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                                  title="Засах"
                                >
                                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteService(service.id)}
                                  className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Устгах"
                                >
                                  <svg className="w-4 h-4 text-slate-400 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden divide-y divide-slate-100">
                    {categoryServices.map((service) => (
                      <div key={service.id} className="px-4 py-3 flex items-center justify-between">
                        <div className="flex-1 min-w-0 mr-3">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-slate-900 truncate">{service.name}</p>
                            {!service.isActive && (
                              <span className="badge badge-default flex-shrink-0">Идэвхгүй</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {service.duration} мин · {service.price ? `${service.price.toLocaleString()}₮` : '—'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => openServiceModal(service)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                            </svg>
                          </button>
                          <button onClick={() => handleDeleteService(service.id)} className="p-1.5 hover:bg-red-50 rounded-lg">
                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}

        {categories.length === 0 && (
          <div className="empty-state py-16">
            <svg className="w-10 h-10 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
            <p className="text-sm font-medium text-slate-500">Ангилал бүртгэгдээгүй</p>
            <p className="text-xs text-slate-400 mt-0.5">Эхлээд ангилал нэмнэ үү</p>
          </div>
        )}
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="modal max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-sm font-semibold text-slate-900">
                {editingCategory ? 'Ангилал засварлах' : 'Ангилал нэмэх'}
              </h2>
              <button onClick={() => setShowCategoryModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCategorySubmit}>
              <div className="modal-body space-y-4">
                <div>
                  <label className="label">Нэр *</label>
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
                  <label className="label">Тайлбар</label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    rows={2}
                    className="input resize-none"
                    placeholder="Тайлбар оруулах"
                  />
                </div>
                <div>
                  <label className="label">Эрэмбэ</label>
                  <input
                    type="number"
                    value={categoryForm.order}
                    onChange={(e) => setCategoryForm({ ...categoryForm, order: parseInt(e.target.value) || 0 })}
                    className="input"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowCategoryModal(false)} className="btn btn-secondary btn-sm">
                  Болих
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingCategory ? 'Хадгалах' : 'Нэмэх'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {showServiceModal && (
        <div className="overlay" onClick={() => setShowServiceModal(false)}>
          <div className="modal max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-sm font-semibold text-slate-900">
                {editingService ? 'Үйлчилгээ засварлах' : 'Үйлчилгээ нэмэх'}
              </h2>
              <button onClick={() => setShowServiceModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleServiceSubmit}>
              <div className="modal-body space-y-4">
                <div>
                  <label className="label">Ангилал *</label>
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
                  <label className="label">Нэр *</label>
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
                  <label className="label">Тайлбар</label>
                  <textarea
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                    rows={2}
                    className="input resize-none"
                    placeholder="Тайлбар оруулах"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Хугацаа (мин)</label>
                    <input
                      type="number"
                      value={serviceForm.duration}
                      onChange={(e) => setServiceForm({ ...serviceForm, duration: parseInt(e.target.value) || 30 })}
                      min="5"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Үнэ (₮)</label>
                    <input
                      type="number"
                      value={serviceForm.price}
                      onChange={(e) => setServiceForm({ ...serviceForm, price: parseInt(e.target.value) || 0 })}
                      min="0"
                      className="input"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowServiceModal(false)} className="btn btn-secondary btn-sm">
                  Болих
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
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
