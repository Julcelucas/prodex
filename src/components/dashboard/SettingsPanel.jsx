
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Building, Shield, Bell } from 'lucide-react';

const SettingsPanel = ({ data, updateCompany }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: data.company.name,
    email: data.company.email,
    phone: data.company.phone,
    address: data.company.address
  });

  const handleSave = () => {
    updateCompany(formData);
    toast({ title: 'Sucesso', description: 'Definições da empresa atualizadas.' });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Building className="h-5 w-5 text-gray-500" /> Informações da Empresa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome da Empresa</Label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>E-mail de Contacto</Label>
              <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Morada</Label>
              <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>
          </div>
          <Button onClick={handleSave} className="bg-primary">Guardar Alterações</Button>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Plano e Subscrição</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg border flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase">Plano Atual</p>
              <p className="text-2xl font-bold text-gray-900">{data.company.subscription}</p>
            </div>
            <Button variant="outline" onClick={() => toast({ title: '🚧 Em desenvolvimento' })}>Gerir Subscrição</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-gray-500" /> Notificações</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">Ajuste as preferências de notificação do sistema e alertas sonoros.</p>
          <Button variant="outline" onClick={() => toast({ title: '🚧 Em desenvolvimento' })}>Configurar Notificações</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPanel;
