
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Building, CreditCard, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminSettings = ({ companyInfo }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Building className="h-5 w-5 text-gray-500" /> Informações da Empresa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome da Empresa</Label>
              <Input defaultValue={companyInfo?.name || ''} />
            </div>
            <div className="space-y-2">
              <Label>NIF / Contribuinte</Label>
              <Input placeholder="Insira o NIF" />
            </div>
            <div className="space-y-2">
              <Label>E-mail de Contacto</Label>
              <Input placeholder="geral@empresa.ao" />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input placeholder="+244" />
            </div>
          </div>
          <Button className="mt-4 bg-primary">Guardar Alterações</Button>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /> Subscrição e Faturação</CardTitle>
          <CardDescription>Faça a gestão do seu plano PRODEX</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div>
              <p className="text-sm text-gray-500 font-bold uppercase">Plano Atual</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-2xl font-bold text-gray-900 capitalize">{companyInfo?.subscription_plan || 'Pro'}</span>
                <Badge className={companyInfo?.subscription_status === 'active' ? 'bg-green-500' : 'bg-red-500'}>
                  {companyInfo?.subscription_status === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate('/pricing')}>Alterar Plano</Button>
          </div>

          <div>
            <h4 className="font-bold text-sm text-gray-700 mb-3 uppercase tracking-wide">Histórico de Pagamentos</h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-2">Data</th>
                    <th className="px-4 py-2">Plano</th>
                    <th className="px-4 py-2">Valor</th>
                    <th className="px-4 py-2 text-right">Fatura</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="px-4 py-3 text-gray-600">01/03/2026</td>
                    <td className="px-4 py-3 font-medium">Pro Mensal</td>
                    <td className="px-4 py-3">35.000 AOA</td>
                    <td className="px-4 py-3 text-right"><Button variant="link" size="sm" className="text-primary">Download PDF</Button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-red-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600"><Shield className="h-5 w-5" /> Zona de Perigo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">Ao cancelar a subscrição, perderá acesso a todas as funcionalidades premium no final do ciclo de faturação atual.</p>
          <Button variant="destructive">Cancelar Subscrição</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
