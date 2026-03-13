
import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Trash2, Edit } from 'lucide-react';

const OrdersManagement = ({ orders = [], setOrders, employees = [], currentUser }) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAdding, setIsAdding] = useState(false);
  
  const [newOrder, setNewOrder] = useState({
    customerName: '', phone: '', address: '', type: 'Documentos', priority: 'Medium', expectedDate: '', employee: ''
  });

  const handleAddOrder = useCallback((e) => {
    e.preventDefault();
    if (!newOrder.customerName || !newOrder.type) {
      toast({ title: 'Erro', description: 'Preencha os campos obrigatórios.', variant: 'destructive' });
      return;
    }

    const payload = {
      ...newOrder,
      id: `ENC-${Math.floor(1000 + Math.random() * 9000)}`,
      createdDate: new Date().toISOString(),
      expectedDate: newOrder.expectedDate ? new Date(newOrder.expectedDate).toISOString() : new Date().toISOString(),
      status: 'Recebida',
      company_id: currentUser?.company_id
    };

    setOrders(prev => {
      return [payload, ...prev];
    });
    
    setNewOrder({ customerName: '', phone: '', address: '', type: 'Documentos', priority: 'Medium', expectedDate: '', employee: '' });
    setIsAdding(false);
    toast({ title: 'Sucesso', description: 'Encomenda adicionada com sucesso.' });
  }, [newOrder, currentUser, setOrders, toast]);

  const handleDelete = useCallback((id) => {
    if(window.confirm('Tem certeza que deseja apagar esta encomenda?')) {
      setOrders(prev => {
        return prev.filter(o => o.id !== id);
      });
      toast({ title: 'Apagado', description: 'Encomenda removida.' });
    }
  }, [setOrders, toast]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = (o.customerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                            (o.id?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, filterStatus]);

  const getStatusColor = useCallback((status) => {
    switch(status) {
      case 'Completa': return 'bg-green-100 text-green-800';
      case 'Em Processamento': return 'bg-amber-100 text-amber-800';
      case 'Recebida': default: return 'bg-blue-100 text-blue-800';
    }
  }, []);

  return (
    <div className="space-y-6">
      {isAdding ? (
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="bg-gray-50 border-b flex flex-row justify-between items-center">
            <CardTitle>Adicionar Nova Encomenda</CardTitle>
            <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancelar</Button>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleAddOrder} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Cliente *</Label>
                  <Input required value={newOrder.customerName} onChange={e=>setNewOrder(prev=>({...prev, customerName: e.target.value}))} />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input value={newOrder.phone} onChange={e=>setNewOrder(prev=>({...prev, phone: e.target.value}))} />
                </div>
                <div className="space-y-2">
                  <Label>Setor / Morada</Label>
                  <Input value={newOrder.address} onChange={e=>setNewOrder(prev=>({...prev, address: e.target.value}))} />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Produto</Label>
                  <select className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white" value={newOrder.type} onChange={e=>setNewOrder(prev=>({...prev, type: e.target.value}))}>
                    <option value="Documentos">Documentos</option>
                    <option value="Eletrónicos">Eletrónicos</option>
                    <option value="Mobiliário">Mobiliário</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Prioridade</Label>
                  <select className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white" value={newOrder.priority} onChange={e=>setNewOrder(prev=>({...prev, priority: e.target.value}))}>
                    <option value="Low">Baixa</option>
                    <option value="Medium">Média</option>
                    <option value="High">Alta</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Atribuir a Funcionário</Label>
                  <select className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white" value={newOrder.employee} onChange={e=>setNewOrder(prev=>({...prev, employee: e.target.value}))}>
                    <option value="">Não Atribuído</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <Button type="submit" className="w-full mt-4">Guardar Encomenda</Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="bg-white border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>Gestão de Encomendas</CardTitle>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input placeholder="Pesquisar..." className="pl-8" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
              </div>
              <select className="h-10 px-3 rounded-md border border-gray-300 bg-white" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
                <option value="all">Todos Status</option>
                <option value="Recebida">Recebida</option>
                <option value="Em Processamento">Em Processamento</option>
                <option value="Completa">Completa</option>
              </select>
              <Button onClick={() => setIsAdding(true)}><Plus className="h-4 w-4 mr-2" /> Adicionar</Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>ID / Data</TableHead>
                  <TableHead>Cliente / Tipo</TableHead>
                  <TableHead>Atribuído A</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map(o => (
                  <TableRow key={o.id}>
                    <TableCell>
                      <div className="font-medium text-gray-900">{o.id}</div>
                      <div className="text-xs text-gray-500">{new Date(o.createdDate).toLocaleDateString('pt-AO')}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{o.customerName}</div>
                      <div className="text-xs text-gray-500">{o.type}</div>
                    </TableCell>
                    <TableCell>
                      {o.employee ? (employees.find(e=>e.id===o.employee)?.name || 'Desconhecido') : <span className="text-red-500 text-xs font-semibold">Não Atribuído</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={o.priority === 'High' ? 'border-red-500 text-red-700 bg-red-50' : 'bg-gray-50'}>
                        {o.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusColor(o.status)}>{o.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={()=>toast({title:'Info', description: 'Edição em modal por implementar'})}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={()=>handleDelete(o.id)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredOrders.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8">Nenhuma encomenda encontrada.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrdersManagement;
