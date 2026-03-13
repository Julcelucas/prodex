
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Key, Mail, Lock, User, Phone, CheckCircle, Car } from 'lucide-react';
import { pt } from '@/lib/translations';

const FuncionarioRegister = () => {
  const navigate = useNavigate();
  const { registerEmployee } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ companyCode: '', name: '', email: '', phone: '', password: '', confirmPassword: '', vehicleInfo: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalizedCompanyCode = (formData.companyCode || '').trim().toUpperCase();

    if (!normalizedCompanyCode) {
      toast({ title: pt.common.error, description: 'Informe o código da empresa.', variant: 'destructive' });
      return;
    }

    if (!/^PRODEX-[A-Z0-9]{5}$/.test(normalizedCompanyCode)) {
      toast({ title: pt.common.error, description: 'Código da empresa inválido. Use o formato PRODEX-XXXXX.', variant: 'destructive' });
      return;
    }

    if(formData.password !== formData.confirmPassword) {
      toast({ title: pt.common.error, description: 'As senhas não coincidem.', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const res = await registerEmployee(
        formData.email,
        formData.password,
        formData.name,
        formData.phone,
        normalizedCompanyCode,
      );

      if (res.success) {
        toast({ title: pt.auth.regSuccess, description: pt.auth.regSuccessDesc });
        navigate('/funcionario/dashboard');
      } else {
        toast({ title: pt.common.error, description: res.error, variant: 'destructive' });
      }
    } catch (error) {
      console.error('[FuncionarioRegister] Unexpected registration error', error);
      toast({ title: pt.common.error, description: 'Erro inesperado no registo do funcionário.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 p-4 py-12">
      <Card className="w-full max-w-lg shadow-2xl border-t-8 border-t-primary rounded-xl overflow-hidden">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-1 font-extrabold text-3xl tracking-tighter text-primary">
              <CheckCircle className="h-8 w-8" /> PRODEX
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Registo de Motorista</CardTitle>
          <CardDescription className="text-gray-500">Junte-se à frota da sua empresa</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="font-semibold text-gray-700">Código da Empresa</Label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-4 w-4 text-primary" />
                <Input required className="pl-9 font-mono uppercase bg-primary/5 focus-visible:ring-primary border-primary/30" placeholder="Ex: PRODEX-A1B2C" value={formData.companyCode} onChange={e => setFormData({...formData, companyCode: e.target.value.toUpperCase()})} />
              </div>
              <p className="text-xs text-gray-500">Peça este código ao administrador da sua empresa.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-semibold text-gray-700">{pt.auth.fullName}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input required className="pl-9 focus-visible:ring-primary" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold text-gray-700">{pt.common.phone}</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input required className="pl-9 focus-visible:ring-primary" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-semibold text-gray-700">{pt.common.email}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input type="email" required className="pl-9 focus-visible:ring-primary" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold text-gray-700">Matrícula / Veículo (Opcional)</Label>
                <div className="relative">
                  <Car className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input className="pl-9 focus-visible:ring-primary" placeholder="Ex: AB-12-CD" value={formData.vehicleInfo} onChange={e => setFormData({...formData, vehicleInfo: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-semibold text-gray-700">{pt.auth.password}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input type="password" required className="pl-9 focus-visible:ring-primary" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold text-gray-700">Confirmar Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input type="password" required className="pl-9 focus-visible:ring-primary" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full h-11 text-base font-bold shadow-md mt-4" disabled={loading}>
              {loading ? pt.common.loading : 'Registar Motorista'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center bg-gray-50/50 py-4 border-t">
          <p className="text-sm text-gray-600">
            {pt.auth.alreadyHaveAccount} <Link to="/login" className="text-primary font-bold hover:underline">{pt.auth.loginHere}</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
export default FuncionarioRegister;
