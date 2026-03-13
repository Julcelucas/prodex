
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const GestorReports = ({ orders, employees }) => {
  // Chart Data Preparation
  const statusData = [
    { name: 'Recebida', value: orders.filter(o => o.status === 'Recebida').length },
    { name: 'Em Processamento', value: orders.filter(o => o.status === 'Em Processamento').length },
    { name: 'Completa', value: orders.filter(o => o.status === 'Completa').length }
  ];

  const COLORS = ['#3b82f6', '#f59e0b', '#10b981'];

  const typeCounts = orders.reduce((acc, order) => {
    acc[order.type] = (acc[order.type] || 0) + 1;
    return acc;
  }, {});

  const typeData = Object.keys(typeCounts).map(key => ({
    name: key,
    total: typeCounts[key]
  }));

  // Employee Performance Table
  const employeePerformance = (employees || []).map(emp => {
    const empOrders = orders.filter(o => o.employee === emp.id);
    const completed = empOrders.filter(o => o.status === 'Completa').length;
    const processing = empOrders.filter(o => o.status === 'Em Processamento').length;
    return {
      name: emp.name,
      totalAssigned: empOrders.length,
      completed,
      processing,
      rate: empOrders.length > 0 ? Math.round((completed / empOrders.length) * 100) : 0
    };
  }).sort((a, b) => b.rate - a.rate);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="bg-white border-b pb-4">
            <CardTitle>Distribuição de Status</CardTitle>
            <CardDescription>Estado atual de todas as encomendas</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-200">
          <CardHeader className="bg-white border-b pb-4">
            <CardTitle>Volume por Tipo de Produto</CardTitle>
            <CardDescription>Análise de gargalos por categoria</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <RechartsTooltip cursor={{fill: '#f3f4f6'}} />
                <Bar dataKey="total" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-gray-200">
        <CardHeader className="bg-white border-b pb-4">
          <CardTitle>Performance da Equipa</CardTitle>
          <CardDescription>Métricas de processamento por funcionário</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-semibold text-gray-700">Funcionário</TableHead>
                <TableHead className="font-semibold text-gray-700 text-center">Total Atribuído</TableHead>
                <TableHead className="font-semibold text-gray-700 text-center">Em Processamento</TableHead>
                <TableHead className="font-semibold text-gray-700 text-center">Completas</TableHead>
                <TableHead className="font-semibold text-gray-700 text-right">Taxa de Conclusão</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employeePerformance.map((emp, i) => (
                <TableRow key={i} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{emp.name}</TableCell>
                  <TableCell className="text-center">{emp.totalAssigned}</TableCell>
                  <TableCell className="text-center text-amber-600 font-medium">{emp.processing}</TableCell>
                  <TableCell className="text-center text-green-600 font-medium">{emp.completed}</TableCell>
                  <TableCell className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      emp.rate >= 80 ? 'bg-green-100 text-green-800' : 
                      emp.rate >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {emp.rate}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {employeePerformance.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-gray-500">Sem dados de funcionários.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default GestorReports;
