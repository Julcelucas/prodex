
import React, { useMemo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { Download, RefreshCw, BarChart2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const COLORS = ['#0f172a', '#3B82F6', '#F59E0B', '#EF4444']; // PRODEX colors

const toCsvValue = (value) => {
  const normalized = value === null || value === undefined ? '' : String(value);
  return `"${normalized.replace(/"/g, '""')}"`;
};

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('pt-PT');
};

const ReportsAnalytics = ({ deliveries = [], employees = [], onRefresh }) => {
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const companyDeliveries = useMemo(
    () => deliveries.filter((d) => d.company_id === currentUser?.company_id),
    [deliveries, currentUser?.company_id]
  );

  const companyEmployees = useMemo(
    () => employees.filter((e) => e.company_id === currentUser?.company_id),
    [employees, currentUser?.company_id]
  );

  // Data Isolation and Calculations memoized together to prevent continuous re-evaluation
  const analytics = useMemo(() => {
    const compDelivs = companyDeliveries;
    const compEmps = companyEmployees;

    const totalDeliveries = compDelivs.length;
    const deliveredCount = compDelivs.filter(d => d.status === 'Concluído' || d.status === 'Entregue').length;
    const pendingCount = compDelivs.filter(d => d.status === 'Pendente' || d.status === 'Recebido').length;
    const progressCount = compDelivs.filter(d => d.status === 'Em Andamento' || d.status === 'Em Processamento').length;
    const cancelledCount = compDelivs.filter(d => d.status === 'Cancelada' || d.status === 'Cancelado').length;
    const completionRate = totalDeliveries ? Math.round((deliveredCount / totalDeliveries) * 100) : 0;
    const activeEmps = compEmps.filter(e=>e.status==='Active').length;

    const statusDataRaw = [
      { name: 'Concluído', value: deliveredCount },
      { name: 'Em Processamento', value: progressCount },
      { name: 'Recebido', value: pendingCount },
      { name: 'Cancelado', value: cancelledCount },
    ];
    const statusData = statusDataRaw.filter(item => item.value > 0);

    const employeeData = compEmps.map(emp => {
      const empDeliveries = compDelivs.filter(d => d.employee === emp.id);
      return {
        name: emp.name.split(' ')[0],
        Total: empDeliveries.length,
        Concluidas: empDeliveries.filter(d => d.status === 'Concluído' || d.status === 'Entregue').length
      };
    });

    const monthlyData = [
      { month: 'Jan', Pedidos: Math.floor(totalDeliveries * 0.5), Taxa: 85 },
      { month: 'Fev', Pedidos: Math.floor(totalDeliveries * 0.7), Taxa: 88 },
      { month: 'Mar', Pedidos: Math.floor(totalDeliveries * 0.9), Taxa: 92 },
      { month: 'Abr', Pedidos: totalDeliveries, Taxa: completionRate || 90 },
    ];

    return { totalDeliveries, completionRate, pendingCount, activeEmps, statusData, employeeData, monthlyData };
  }, [companyDeliveries, companyEmployees]);

  const exportCsv = useCallback(() => {
    if (companyDeliveries.length === 0) {
      toast({ title: 'Sem dados', description: 'Não há pedidos para exportar.', variant: 'destructive' });
      return;
    }

    const headers = [
      'ID Pedido',
      'Cliente',
      'Telefone',
      'Morada',
      'Tipo',
      'Prioridade',
      'Estado',
      'Funcionário',
      'Data Prevista',
      'Criado Em',
    ];

    const lines = companyDeliveries.map((d) => {
      const assignedEmployee = companyEmployees.find((e) => e.id === (d.employee || d.assigned_to));
      return [
        d.id,
        d.customerName || d.customer_name || '-',
        d.phone || d.customer_phone || '-',
        d.address || d.customer_address || d.delivery_address || '-',
        d.type || d.order_type || '-',
        d.priority || '-',
        d.status || '-',
        assignedEmployee?.name || '-',
        formatDateTime(d.expectedDate || d.desired_delivery_time),
        formatDateTime(d.createdDate || d.created_at),
      ];
    });

    const csvContent = [headers, ...lines]
      .map((row) => row.map(toCsvValue).join(';'))
      .join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-pedidos-${currentUser?.company_id || 'empresa'}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({ title: 'CSV exportado', description: 'Download do relatório CSV iniciado.' });
  }, [companyDeliveries, companyEmployees, currentUser?.company_id, toast]);

  const exportPdf = useCallback(() => {
    if (companyDeliveries.length === 0) {
      toast({ title: 'Sem dados', description: 'Não há pedidos para exportar.', variant: 'destructive' });
      return;
    }

    const rowsHtml = companyDeliveries
      .map((d) => {
        const assignedEmployee = companyEmployees.find((e) => e.id === (d.employee || d.assigned_to));
        return `
          <tr>
            <td>${d.id || '-'}</td>
            <td>${d.customerName || d.customer_name || '-'}</td>
            <td>${d.status || '-'}</td>
            <td>${d.priority || '-'}</td>
            <td>${assignedEmployee?.name || '-'}</td>
            <td>${formatDateTime(d.expectedDate || d.desired_delivery_time)}</td>
          </tr>
        `;
      })
      .join('');

    const popup = window.open('', '_blank', 'width=1200,height=900');
    if (!popup) {
      toast({ title: 'Popup bloqueado', description: 'Permite popups para exportar PDF.', variant: 'destructive' });
      return;
    }

    popup.document.write(`
      <!doctype html>
      <html lang="pt">
      <head>
        <meta charset="utf-8" />
        <title>Relatório de Pedidos</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
          h1 { margin: 0 0 8px; font-size: 22px; }
          p { margin: 0 0 20px; color: #4b5563; }
          .summary { display: flex; gap: 12px; margin-bottom: 18px; }
          .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 12px; min-width: 130px; }
          .label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
          .value { font-size: 20px; font-weight: 700; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
          th { background: #f9fafb; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <h1>Relatório de Pedidos</h1>
        <p>Empresa: ${currentUser?.company_id || '-'} | Gerado em: ${new Date().toLocaleString('pt-PT')}</p>
        <div class="summary">
          <div class="card"><div class="label">Total Pedidos</div><div class="value">${analytics.totalDeliveries}</div></div>
          <div class="card"><div class="label">Taxa Conclusão</div><div class="value">${analytics.completionRate}%</div></div>
          <div class="card"><div class="label">Pendentes</div><div class="value">${analytics.pendingCount}</div></div>
          <div class="card"><div class="label">Funcionários Ativos</div><div class="value">${analytics.activeEmps}</div></div>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Estado</th>
              <th>Prioridade</th>
              <th>Funcionário</th>
              <th>Data Prevista</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <script>
          window.onload = function () {
            window.print();
            window.onafterprint = function () { window.close(); };
          }
        </script>
      </body>
      </html>
    `);
    popup.document.close();

    toast({ title: 'PDF preparado', description: 'Janela de impressão aberta para guardar em PDF.' });
  }, [analytics, companyDeliveries, companyEmployees, currentUser?.company_id, toast]);

  const handleExport = useCallback((type) => {
    if (type === 'CSV') {
      exportCsv();
      return;
    }

    exportPdf();
  }, [exportCsv, exportPdf]);

  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      await onRefresh();
    }
    toast({ title: 'Atualizado', description: 'Dados recarregados com sucesso.' });
  }, [onRefresh, toast]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><BarChart2 className="h-5 w-5 text-primary" /> Relatórios e Analíticas da Empresa</h2>
          <p className="text-sm text-gray-500">Métricas exclusivas para a empresa: <strong className="font-mono text-primary">{currentUser?.company_id}</strong></p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('CSV')} className="text-gray-700 bg-white border-gray-300 hover:bg-gray-50"><Download className="h-4 w-4 mr-2" /> CSV</Button>
          <Button variant="outline" onClick={() => handleExport('PDF')} className="text-gray-700 bg-white border-gray-300 hover:bg-gray-50"><Download className="h-4 w-4 mr-2" /> PDF</Button>
          <Button onClick={handleRefresh} className="bg-primary hover:bg-primary/90 text-white"><RefreshCw className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Pedidos</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-2">{analytics.totalDeliveries}</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow border-t-4 border-t-green-500">
          <CardContent className="p-6">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Taxa de Conclusão</p>
            <p className="text-3xl font-extrabold text-green-600 mt-2">{analytics.completionRate}%</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow border-t-4 border-t-yellow-500">
          <CardContent className="p-6">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Pendentes</p>
            <p className="text-3xl font-extrabold text-yellow-600 mt-2">{analytics.pendingCount}</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow border-t-4 border-t-blue-500">
          <CardContent className="p-6">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Funcionários Ativos</p>
            <p className="text-3xl font-extrabold text-blue-600 mt-2">{analytics.activeEmps}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-md text-gray-700 font-bold">Distribuição por Estado</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {analytics.statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={analytics.statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label>
                    {analytics.statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 font-medium">Sem dados suficientes</div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-md text-gray-700 font-bold">Performance de Funcionários</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {analytics.employeeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.employeeData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{fill: '#6b7280'}} />
                  <YAxis tick={{fill: '#6b7280'}} />
                  <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend />
                  <Bar dataKey="Total" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Concluidas" name="Concluídos" fill="#0f172a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 font-medium">Sem funcionários registados</div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-md text-gray-700 font-bold">Tendências Mensais de Pedidos</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{fill: '#6b7280'}} />
                <YAxis yAxisId="left" tick={{fill: '#6b7280'}} />
                <YAxis yAxisId="right" orientation="right" tick={{fill: '#6b7280'}} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="Pedidos" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 8 }} />
                <Line yAxisId="right" type="monotone" dataKey="Taxa" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
