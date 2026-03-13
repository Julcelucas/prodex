
import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Edit, Trash2, Users, Star, Copy, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const EmployeesManagement = ({ employees = [], setEmployees, deliveries = [], onCreateEmployee, onUpdateEmployee, onDeleteEmployee, loading = false }) => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentEmp, setCurrentEmp] = useState({});
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Data Isolation: Filter employees by current admin's Company ID
  const companyEmployees = useMemo(() => {
    if (!currentUser?.company_id) return [];
    return employees.filter(e => e.company_id === currentUser.company_id);
  }, [employees, currentUser?.company_id]);

  const filteredEmployees = useMemo(() => {
    return companyEmployees.filter(e => {
      const searchLower = searchTerm.toLowerCase();
      return (e.name?.toLowerCase() || '').includes(searchLower) || 
             (e.email?.toLowerCase() || '').includes(searchLower) ||
             (e.phone || '').includes(searchTerm);
    });
  }, [companyEmployees, searchTerm]);

  const calcPerformance = useCallback((empId) => {
    const empDeliveries = deliveries.filter(d => d.employee === empId && d.company_id === currentUser?.company_id);
    const total = empDeliveries.length;
    if(total === 0) return { total: 0, completed: 0, rate: 0, rating: 0 };
    
    const completed = empDeliveries.filter(d => d.status === 'Concluído' || d.status === 'Entregue').length;
    const rate = Math.round((completed / total) * 100);
    const rating = Math.round((rate / 100) * 5);
    return { total, completed, rate, rating };
  }, [deliveries, currentUser?.company_id]);

  const openAddModal = useCallback(() => {
    setModalMode('add');
    setGeneratedCredentials(null);
    setCurrentEmp({ name: '', email: '', phone: '', status: 'Active' });
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((e) => {
    setModalMode('edit');
    setGeneratedCredentials(null);
    setCurrentEmp(e);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Tem a certeza que deseja remover este funcionário?')) {
      return;
    }

    if (onDeleteEmployee) {
      const result = await onDeleteEmployee(id);
      if (!result?.success) {
        toast({ title: 'Erro', description: result?.error || 'Não foi possível remover o funcionário.', variant: 'destructive' });
        return;
      }
      toast({ title: 'Sucesso', description: 'Funcionário removido.' });
      return;
    }

    setEmployees(prev => prev.filter(e => e.id !== id));
    toast({ title: 'Sucesso', description: 'Funcionário removido.' });
  }, [onDeleteEmployee, setEmployees, toast]);

  const generatePassword = useCallback(() => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }, []);

  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copiado!', description: 'Credenciais copiadas para a área de transferência.' });
  }, [toast]);

  const handleSave = useCallback(async (e) => {
    e.preventDefault();
    if (!currentEmp.name || !currentEmp.email) {
      toast({ title: 'Erro', description: 'Preencha os campos obrigatórios.', variant: 'destructive' });
      return;
    }

    if (!currentUser?.company_id) {
      toast({ title: 'Erro de Segurança', description: 'ID da Empresa inválido.', variant: 'destructive' });
      return;
    }

    setSubmitting(true);

    try {
      if (modalMode === 'add') {
        const password = generatePassword();
        const payload = {
          ...currentEmp,
          password,
          company_id: currentUser.company_id,
        };

        if (onCreateEmployee) {
          const result = await onCreateEmployee(payload);
          if (!result?.success) {
            throw new Error(result?.error || 'Não foi possível criar o funcionário.');
          }
          const employeeId = result?.data?.id || result?.credentials?.id;
          setGeneratedCredentials({ email: payload.email, password, id: employeeId });
        } else {
          const empId = `EMP-${Math.floor(10000 + Math.random() * 90000)}`;
          const newEmp = {
            ...currentEmp,
            id: empId,
            company_id: currentUser.company_id,
            deliveriesAssigned: 0,
            temp_password: password
          };
          setEmployees(prev => [...prev, newEmp]);
          setGeneratedCredentials({ email: newEmp.email, password, id: empId });
        }

        toast({ title: 'Funcionário Criado', description: 'Credenciais geradas com sucesso.' });
      } else {
        if (onUpdateEmployee) {
          const result = await onUpdateEmployee(currentEmp);
          if (!result?.success) {
            throw new Error(result?.error || 'Não foi possível atualizar o funcionário.');
          }
        } else {
          setEmployees(prev => prev.map(emp => emp.id === currentEmp.id ? currentEmp : emp));
        }

        toast({ title: 'Sucesso', description: 'Funcionário atualizado!' });
        setIsModalOpen(false);
      }
    } catch (error) {
      toast({ title: 'Erro', description: error.message || 'Falha ao guardar funcionário.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  }, [currentEmp, currentUser, modalMode, generatePassword, onCreateEmployee, onUpdateEmployee, setEmployees, toast]);

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
        <CardTitle className="text-xl font-bold flex items-center gap-2"><Users className="h-5 w-5" /> Gestão de Funcionários</CardTitle>
        <Button onClick={openAddModal} className="bg-primary hover:bg-primary/90 text-white font-semibold">
          <Plus className="h-4 w-4 mr-2" /> Novo Funcionário
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Pesquisar por Nome, E-mail ou Telefone..." 
            className="pl-9 text-gray-900 bg-white border-gray-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="table-container">
          <table className="w-full text-left">
            <thead className="table-header">
              <tr>
                <th className="px-4 py-3">ID / Nome</th>
                <th className="px-4 py-3">Contactos</th>
                <th className="px-4 py-3 text-center">Pedidos Totais</th>
                <th className="px-4 py-3 text-center">Performance</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map(emp => {
                const perf = calcPerformance(emp.id);
                return (
                  <tr key={emp.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-bold text-gray-900 text-sm">{emp.name}</p>
                      <p className="text-xs text-gray-500 font-mono bg-gray-100 inline-block px-1 rounded mt-1">{emp.id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-800">{emp.email}</p>
                      <p className="text-xs text-gray-500">{emp.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-gray-700">{perf.total}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center items-center gap-1 text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < perf.rating ? 'fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1 font-medium">{perf.rate}% Sucesso</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={emp.status === 'Active' ? 'default' : 'secondary'} className={emp.status === 'Active' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}>
                        {emp.status === 'Active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => openEditModal(emp)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(emp.id)}><Trash2 className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                );
              })}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-500 font-medium">Nenhum funcionário registado na sua empresa.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-in zoom-in-95">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {generatedCredentials ? 'Credenciais do Funcionário' : modalMode === 'add' ? 'Novo Funcionário' : `Editar Funcionário`}
                </h2>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-800 text-2xl font-bold">&times;</button>
              </div>
              <div className="p-6">
                {generatedCredentials ? (
                  <div className="space-y-6">
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-sm text-yellow-800 mb-4">
                      <strong>Aviso Importante:</strong> Guarde estas credenciais agora. A palavra-passe não será mostrada novamente por motivos de segurança.
                    </div>
                    
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                      <div><span className="text-xs text-gray-500 uppercase font-bold">Empresa ID</span><p className="font-mono font-medium text-gray-900">{currentUser?.company_id}</p></div>
                      <div><span className="text-xs text-gray-500 uppercase font-bold">Funcionário ID</span><p className="font-mono font-medium text-primary">{generatedCredentials.id}</p></div>
                      <div><span className="text-xs text-gray-500 uppercase font-bold">E-mail (Login)</span><p className="font-medium text-gray-900">{generatedCredentials.email}</p></div>
                      <div><span className="text-xs text-gray-500 uppercase font-bold">Palavra-passe</span><p className="font-mono font-bold text-gray-900 tracking-wider">{generatedCredentials.password}</p></div>
                      
                      <Button 
                        size="sm" 
                        type="button"
                        className="absolute top-4 right-4" 
                        variant="outline"
                        onClick={() => copyToClipboard(`ID Empresa: ${currentUser?.company_id}\nEmail: ${generatedCredentials.email}\nPassword: ${generatedCredentials.password}`)}
                      >
                        {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>

                    <Button type="button" className="w-full font-bold" onClick={() => setIsModalOpen(false)}>Concluir</Button>
                  </div>
                ) : (
                  <form onSubmit={handleSave} className="space-y-4 text-sm">
                    {modalMode === 'add' && (
                      <div className="bg-gray-100 p-3 rounded-md mb-4 flex justify-between items-center border border-gray-200">
                        <span className="text-gray-600 font-medium">Atribuir à Empresa:</span>
                        <Badge variant="secondary" className="font-mono">{currentUser?.company_id}</Badge>
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      <Label className="text-gray-700 font-semibold">Nome Completo *</Label>
                      <Input required value={currentEmp.name || ''} onChange={e => setCurrentEmp(prev => ({...prev, name: e.target.value}))} className="bg-white text-gray-900 border-gray-300" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-gray-700 font-semibold">E-mail (Usado para Login) *</Label>
                      <Input type="email" required value={currentEmp.email || ''} onChange={e => setCurrentEmp(prev => ({...prev, email: e.target.value}))} className="bg-white text-gray-900 border-gray-300" disabled={modalMode === 'edit'} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-gray-700 font-semibold">Telefone</Label>
                      <Input value={currentEmp.phone || ''} onChange={e => setCurrentEmp(prev => ({...prev, phone: e.target.value}))} className="bg-white text-gray-900 border-gray-300" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-gray-700 font-semibold">Estado</Label>
                      <select className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary" value={currentEmp.status || 'Active'} onChange={e => setCurrentEmp(prev => ({...prev, status: e.target.value}))}>
                        <option value="Active">Ativo</option>
                        <option value="Inactive">Inativo</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-6 mt-2 border-t border-gray-100">
                      <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="text-gray-700 font-semibold" disabled={submitting || loading}>Cancelar</Button>
                      <Button type="submit" className="bg-primary hover:bg-primary/90 text-white font-semibold" disabled={submitting || loading}>
                        {submitting ? 'A guardar...' : modalMode === 'add' ? 'Gerar Credenciais e Guardar' : 'Guardar Alterações'}
                      </Button>
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

export default EmployeesManagement;
