
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Plus, UserCog, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EmployeeManagement = ({ employees, orders }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const filteredEmployees = employees.filter(e => 
    e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPerformance = (empId) => {
    const empOrders = orders.filter(o => o.assigned_to === empId);
    if (empOrders.length === 0) return 'N/A';
    const completed = empOrders.filter(o => o.status === 'delivered').length;
    const rate = Math.round((completed / empOrders.length) * 100);
    return `${rate}%`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Pesquisar por nome ou email..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="bg-primary" onClick={() => toast({title: "Novo Funcionário", description: "Módulo em desenvolvimento."})}>
          <Plus className="h-4 w-4 mr-2"/> Adicionar Funcionário
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-lg flex items-center gap-2"><UserCog className="h-5 w-5"/> Equipa e Motoristas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-700 uppercase text-xs border-b">
                <tr>
                  <th className="px-4 py-3">Nome / Detalhes</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Entregas Atribuídas</th>
                  <th className="px-4 py-3 text-center">Taxa de Sucesso</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEmployees.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-bold text-gray-900">{e.name}</p>
                      <p className="text-xs text-gray-500">{e.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-gray-700">
                      {orders.filter(o => o.assigned_to === e.id).length}
                    </td>
                    <td className="px-4 py-3 text-center text-primary font-medium">
                      {getPerformance(e.id)}
                    </td>
                    <td className="px-4 py-3 text-right flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600"><Edit className="h-4 w-4"/></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600"><Trash2 className="h-4 w-4"/></Button>
                    </td>
                  </tr>
                ))}
                {filteredEmployees.length === 0 && (
                  <tr><td colSpan="5" className="text-center py-8 text-gray-500">Nenhum funcionário encontrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeManagement;
