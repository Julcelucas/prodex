
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, PlayCircle, CheckCircle, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MyOrders = ({ myOrders, updateOrderStatus }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { toast } = useToast();

  const filteredOrders = myOrders.filter(o => {
    const matchesSearch = o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || o.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completa': return 'bg-green-100 text-green-800';
      case 'Em Processamento': return 'bg-amber-100 text-amber-800';
      case 'Recebida': default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="bg-white border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Fila de Trabalho
        </CardTitle>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input placeholder="Pesquisar ID ou Cliente..." className="pl-8 bg-gray-50 border-gray-200" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
          </div>
          <select className="h-10 px-3 rounded-md border border-gray-300 bg-white" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
            <option value="all">Todos Status</option>
            <option value="Recebida">Recebida</option>
            <option value="Em Processamento">Em Processamento</option>
            <option value="Completa">Completa</option>
          </select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-semibold text-gray-700">ID Encomenda</TableHead>
                <TableHead className="font-semibold text-gray-700">Cliente / Setor</TableHead>
                <TableHead className="font-semibold text-gray-700">Tipo</TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">Ações de Processamento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map(o => (
                <TableRow key={o.id} className="hover:bg-blue-50/50 transition-colors">
                  <TableCell>
                    <div className="font-bold text-gray-900">{o.id}</div>
                    <div className="text-xs text-gray-500">{new Date(o.createdDate).toLocaleDateString('pt-AO')}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-900">{o.customerName}</div>
                    <div className="text-xs text-gray-600">{o.address}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-white">{o.type}</Badge>
                    {o.priority === 'High' && <Badge variant="destructive" className="ml-2 text-[10px]">Urgente</Badge>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusColor(o.status)}>{o.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {o.status === 'Recebida' && (
                      <Button size="sm" onClick={() => updateOrderStatus(o.id, 'Em Processamento')} className="bg-amber-500 hover:bg-amber-600 text-white shadow-sm">
                        <PlayCircle className="h-4 w-4 mr-1" /> Iniciar
                      </Button>
                    )}
                    {o.status === 'Em Processamento' && (
                      <Button size="sm" onClick={() => updateOrderStatus(o.id, 'Completa')} className="bg-green-600 hover:bg-green-700 text-white shadow-sm">
                        <CheckCircle className="h-4 w-4 mr-1" /> Concluir
                      </Button>
                    )}
                    {o.status === 'Completa' && (
                       <span className="text-xs text-green-600 font-bold px-2">Finalizado</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                    <Package className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    Nenhuma encomenda na sua fila de trabalho.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default MyOrders;
