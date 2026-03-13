
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Package, Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { pt } from '@/lib/translations';

const DeliveryManagement = ({ orders, employees, updateOrder }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredOrders = orders.filter(o => 
    o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    if (status === 'delivered') return 'bg-green-100 text-green-800';
    if (status === 'cancelled') return 'bg-gray-100 text-gray-800';
    if (status === 'in_progress') return 'bg-blue-100 text-blue-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Pesquisar por funcionário ou ID..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="bg-primary"><Plus className="h-4 w-4 mr-2"/> Nova Entrega</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-sm">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-lg">Lista de Entregas</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-700 uppercase text-xs border-b">
                    <tr>
                      <th className="px-4 py-3">Funcionário / Destino</th>
                      <th className="px-4 py-3">Data Prevista</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Motorista</th>
                      <th className="px-4 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredOrders.map(o => {
                      const emp = employees.find(e => e.id === o.assigned_to);
                      return (
                        <tr key={o.id} className={`hover:bg-gray-50 cursor-pointer ${selectedOrder?.id === o.id ? 'bg-green-50' : ''}`} onClick={() => setSelectedOrder(o)}>
                          <td className="px-4 py-3">
                            <p className="font-bold text-gray-900">{o.customer_name}</p>
                            <p className="text-xs text-gray-500">{o.customer_address}</p>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {new Date(o.desired_delivery_time).toLocaleString('pt-AO')}
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={getStatusColor(o.status)}>
                              {pt.status?.[o.status] || o.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">{emp ? emp.name : 'Não atribuído'}</td>
                          <td className="px-4 py-3 text-right flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600"><Eye className="h-4 w-4"/></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600"><Edit className="h-4 w-4"/></Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          {selectedOrder ? (
            <Card className="shadow-md border-primary sticky top-24">
              <CardHeader className="bg-primary/5 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary"/> Detalhes da Entrega
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs font-bold uppercase">ID da Entrega</p>
                  <p className="font-mono text-gray-900">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-bold uppercase">Funcionário / Destinatário</p>
                  <p className="font-medium text-gray-900">{selectedOrder.customer_name}</p>
                  <p className="text-gray-600">{selectedOrder.customer_address}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-bold uppercase">Descrição</p>
                  <p className="text-gray-900">{selectedOrder.description || 'Nenhuma descrição fornecida.'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-bold uppercase">Data Esperada</p>
                  <p className="text-gray-900">{new Date(selectedOrder.desired_delivery_time).toLocaleString('pt-AO')}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-bold uppercase mb-1">Status Atual</p>
                  <Badge className={getStatusColor(selectedOrder.status)}>{pt.status?.[selectedOrder.status] || selectedOrder.status}</Badge>
                </div>
                <div className="pt-4 border-t flex gap-2">
                  <Button className="w-full bg-primary" size="sm">Atualizar</Button>
                  <Button variant="outline" className="text-red-600" size="sm"><Trash2 className="h-4 w-4"/></Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-sm bg-gray-50 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Package className="h-12 w-12 mb-2" />
                <p>Selecione uma entrega para ver os detalhes</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryManagement;
