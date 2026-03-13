
import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Edit, Trash2, Eye, Calendar, Package } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const DeliveriesManagement = ({ deliveries = [], setDeliveries, employees = [], onCreateDelivery, onUpdateDelivery, onDeleteDelivery, loading = false }) => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'expectedDate', direction: 'asc' });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentDelivery, setCurrentDelivery] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Data Isolation: Filter deliveries by current admin's Company ID
  const companyDeliveries = useMemo(() => {
    if (!currentUser?.company_id) return [];
    return deliveries.filter(d => d.company_id === currentUser.company_id);
  }, [deliveries, currentUser?.company_id]);

  // Data Isolation: Filter employees by current admin's Company ID
  const companyEmployees = useMemo(() => {
    if (!currentUser?.company_id) return [];
    return employees.filter(e => e.company_id === currentUser.company_id);
  }, [employees, currentUser?.company_id]);

  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const filteredAndSorted = useMemo(() => {
    const result = companyDeliveries.filter(d => {
      const matchSearch = (d.customerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                          (d.id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (d.phone || '').includes(searchTerm);
      const matchStatus = statusFilter === 'All' || d.status === statusFilter;
      return matchSearch && matchStatus;
    });

    return result.sort((a, b) => {
      const aVal = a[sortConfig.key] || '';
      const bVal = b[sortConfig.key] || '';
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [companyDeliveries, searchTerm, statusFilter, sortConfig]);

  const openAddModal = useCallback(() => {
    setModalMode('add');
    setCurrentDelivery({
      customerName: '', phone: '', address: '', type: 'Standard', priority: 'Medium',
      expectedDate: new Date().toISOString().split('T')[0], employee: '', notes: '', status: 'Recebido'
    });
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((d) => {
    setModalMode('edit');
    setCurrentDelivery({...d, expectedDate: d.expectedDate ? d.expectedDate.split('T')[0] : ''});
    setIsModalOpen(true);
  }, []);

  const openViewModal = useCallback((d) => {
    setModalMode('view');
    setCurrentDelivery(d);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Tem a certeza que deseja eliminar este pedido?')) {
      return;
    }

    if (onDeleteDelivery) {
      const result = await onDeleteDelivery(id);
      if (!result?.success) {
        toast({ title: 'Erro', description: result?.error || 'Não foi possível eliminar o pedido.', variant: 'destructive' });
        return;
      }
      toast({ title: 'Sucesso', description: 'Pedido eliminado com sucesso.' });
      return;
    }

    setDeliveries(prev => prev.filter(d => d.id !== id));
    toast({ title: 'Sucesso', description: 'Pedido eliminado com sucesso.' });
  }, [onDeleteDelivery, setDeliveries, toast]);

  const handleSave = useCallback(async (e) => {
    e.preventDefault();
    if (!currentDelivery.customerName || !currentDelivery.phone || !currentDelivery.address) {
      toast({ title: 'Erro', description: 'Preencha os campos obrigatórios.', variant: 'destructive' });
      return;
    }

    if (!currentUser?.company_id) {
      toast({ title: 'Erro de Segurança', description: 'ID da Empresa não encontrado.', variant: 'destructive' });
      return;
    }

    const expectedDateStr = currentDelivery.expectedDate ? new Date(currentDelivery.expectedDate).toISOString() : new Date().toISOString();

    const payload = {
      ...currentDelivery,
      expectedDate: expectedDateStr,
      company_id: currentUser.company_id // Enforce Data Isolation
    };

    setSubmitting(true);

    try {
      if (modalMode === 'add') {
        if (onCreateDelivery) {
          const result = await onCreateDelivery(payload);
          if (!result?.success) {
            throw new Error(result?.error || 'Não foi possível criar o pedido.');
          }
        } else {
          payload.id = `PED-${Math.floor(1000 + Math.random() * 9000)}`;
          payload.createdDate = new Date().toISOString();
          setDeliveries(prev => [payload, ...prev]);
        }
        toast({ title: 'Sucesso', description: 'Novo pedido adicionado!' });
      } else {
        if (onUpdateDelivery) {
          const result = await onUpdateDelivery(payload);
          if (!result?.success) {
            throw new Error(result?.error || 'Não foi possível atualizar o pedido.');
          }
        } else {
          setDeliveries(prev => prev.map(d => d.id === payload.id ? payload : d));
        }
        toast({ title: 'Sucesso', description: 'Pedido atualizado!' });
      }
      setIsModalOpen(false);
    } catch (error) {
      toast({ title: 'Erro', description: error.message || 'Falha ao guardar pedido.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  }, [currentDelivery, currentUser, modalMode, onCreateDelivery, onUpdateDelivery, setDeliveries, toast]);

  const getStatusBadge = useCallback((status) => {
    switch(status) {
      case 'Concluído': 
      case 'Entregue': return 'bg-green-100 text-green-800';
      case 'Em Processamento': 
      case 'Em Andamento': return 'bg-blue-100 text-blue-800';
      case 'Cancelado': 
      case 'Cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  }, []);

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-col md:flex-row items-center justify-between border-b pb-4 gap-4">
        <CardTitle className="text-xl font-bold flex items-center gap-2"><Package className="h-5 w-5" /> Gestão de Pedidos</CardTitle>
        <Button onClick={openAddModal} className="bg-primary hover:bg-primary/90 text-white font-semibold">
          <Plus className="h-4 w-4 mr-2" /> Novo Pedido
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Pesquisar por ID, Cliente ou Telefone..." 
              className="pl-9 text-gray-900 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="h-10 px-3 py-2 rounded-md border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">Todos os Estados</option>
            <option value="Recebido">Recebido</option>
            <option value="Em Processamento">Em Processamento</option>
            <option value="Concluído">Concluído</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>
        
        <div className="table-container">
          <table className="w-full text-left">
            <thead className="table-header">
              <tr>
                <th className="px-4 py-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('id')}>ID {sortConfig.key==='id' && (sortConfig.direction==='asc'?'↑':'↓')}</th>
                <th className="px-4 py-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('customerName')}>Cliente {sortConfig.key==='customerName' && (sortConfig.direction==='asc'?'↑':'↓')}</th>
                <th className="px-4 py-3">Morada</th>
                <th className="px-4 py-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('expectedDate')}>Data Prevista</th>
                <th className="px-4 py-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('status')}>Estado</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.map(d => (
                <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-sm font-semibold">{d.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-gray-900 text-sm">{d.customerName}</p>
                    <p className="text-xs text-gray-500">{d.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-[150px]" title={d.address}>{d.address}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {d.expectedDate ? new Date(d.expectedDate).toLocaleDateString('pt-AO') : 'N/A'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(d.status)}`}>
                      {d.status === 'Entregue' ? 'Concluído' : d.status === 'Em Andamento' ? 'Em Processamento' : d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => openViewModal(d)}><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(d)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(d.id)}><Trash2 className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
              {filteredAndSorted.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-500 font-medium">Nenhum pedido encontrado para a sua empresa.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold text-gray-900">
                  {modalMode === 'add' ? 'Novo Pedido' : modalMode === 'edit' ? `Editar ${currentDelivery.id}` : `Detalhes ${currentDelivery.id}`}
                </h2>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-800 text-2xl font-bold">&times;</button>
              </div>
              <div className="p-6">
                {modalMode === 'view' ? (
                  <div className="space-y-4 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg"><strong className="block text-gray-500 mb-1">Cliente</strong> {currentDelivery.customerName}</div>
                      <div className="bg-gray-50 p-3 rounded-lg"><strong className="block text-gray-500 mb-1">Telefone</strong> {currentDelivery.phone}</div>
                      <div className="col-span-2 bg-gray-50 p-3 rounded-lg"><strong className="block text-gray-500 mb-1">Morada</strong> {currentDelivery.address}</div>
                      <div className="bg-gray-50 p-3 rounded-lg"><strong className="block text-gray-500 mb-1">Estado</strong> <Badge>{currentDelivery.status === 'Entregue' ? 'Concluído' : currentDelivery.status}</Badge></div>
                      <div className="bg-gray-50 p-3 rounded-lg"><strong className="block text-gray-500 mb-1">Prioridade</strong> {currentDelivery.priority}</div>
                      <div className="bg-gray-50 p-3 rounded-lg"><strong className="block text-gray-500 mb-1">Data Prevista</strong> {currentDelivery.expectedDate ? new Date(currentDelivery.expectedDate).toLocaleString('pt-AO') : 'N/A'}</div>
                      <div className="bg-gray-50 p-3 rounded-lg"><strong className="block text-gray-500 mb-1">Funcionário</strong> {companyEmployees.find(e => e.id === currentDelivery.employee)?.name || 'Não atribuído'}</div>
                      <div className="col-span-2 bg-gray-50 p-3 rounded-lg"><strong className="block text-gray-500 mb-1">Notas</strong> {currentDelivery.notes || 'Sem notas.'}</div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSave} className="space-y-4 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-gray-700 font-semibold">Nome do Cliente *</Label>
                        <Input required value={currentDelivery.customerName || ''} onChange={e => setCurrentDelivery(prev => ({...prev, customerName: e.target.value}))} className="bg-white text-gray-900 border-gray-300" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-gray-700 font-semibold">Telefone *</Label>
                        <Input required value={currentDelivery.phone || ''} onChange={e => setCurrentDelivery(prev => ({...prev, phone: e.target.value}))} className="bg-white text-gray-900 border-gray-300" />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-gray-700 font-semibold">Morada do Pedido *</Label>
                        <Input required value={currentDelivery.address || ''} onChange={e => setCurrentDelivery(prev => ({...prev, address: e.target.value}))} className="bg-white text-gray-900 border-gray-300" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-gray-700 font-semibold">Data Prevista *</Label>
                        <Input type="date" required value={currentDelivery.expectedDate || ''} onChange={e => setCurrentDelivery(prev => ({...prev, expectedDate: e.target.value}))} className="bg-white text-gray-900 border-gray-300" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-gray-700 font-semibold">Estado</Label>
                        <select className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary" value={currentDelivery.status || 'Recebido'} onChange={e => setCurrentDelivery(prev => ({...prev, status: e.target.value}))}>
                          <option value="Recebido">Recebido</option>
                          <option value="Em Processamento">Em Processamento</option>
                          <option value="Concluído">Concluído</option>
                          <option value="Cancelado">Cancelado</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-gray-700 font-semibold">Funcionário Atribuído</Label>
                        <select className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary" value={currentDelivery.employee || ''} onChange={e => setCurrentDelivery(prev => ({...prev, employee: e.target.value}))}>
                          <option value="">-- Não Atribuído --</option>
                          {companyEmployees.filter(e => String(e.status || '').toLowerCase() !== 'inactive').map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-gray-700 font-semibold">Prioridade</Label>
                        <select className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary" value={currentDelivery.priority || 'Medium'} onChange={e => setCurrentDelivery(prev => ({...prev, priority: e.target.value}))}>
                          <option value="Low">Baixa</option>
                          <option value="Medium">Média</option>
                          <option value="High">Alta</option>
                        </select>
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-gray-700 font-semibold">Notas Adicionais</Label>
                        <textarea className="w-full p-3 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary h-20 resize-none" value={currentDelivery.notes || ''} onChange={e => setCurrentDelivery(prev => ({...prev, notes: e.target.value}))}></textarea>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
                      <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="text-gray-700 font-semibold" disabled={submitting || loading}>Cancelar</Button>
                      <Button type="submit" className="bg-primary hover:bg-primary/90 text-white font-semibold px-6" disabled={submitting || loading}>{submitting ? 'A guardar...' : 'Guardar Pedido'}</Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeliveriesManagement;
