
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Building, Mail, Lock, User, Phone, CheckCircle } from 'lucide-react';
import { pt } from '@/lib/translations';

const GestorRegister = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ companyName: '', name: '', email: '', phone: '', password: '', confirmPassword: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(formData.password !== formData.confirmPassword) {
      toast({ title: pt.common.error, description: 'As senhas não coincidem.', variant: 'destructive' });
      return;
    }
    setLoading(true);

    try {
      navigate('/pricing', {
        state: {
          pendingManagerRegistration: {
            companyName: formData.companyName,
            email: formData.email,
            name: formData.name,
            password: formData.password,
            phone: formData.phone,
          },
          registeredEmail: formData.email,
        },
      });
    } catch (error) {
      toast({ title: pt.common.error, description: 'Erro inesperado no registo.', variant: 'destructive' });
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
          <CardTitle className="text-2xl font-bold text-gray-900">Registo de Empresa</CardTitle>
          <CardDescription className="text-gray-500">Comece a gerir as suas entregas hoje</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-semibold text-gray-700">Nome da Empresa</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input required className="pl-9 focus-visible:ring-primary" placeholder="Ex: Transportes Silva" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
                </div>
                <p className="text-xs text-gray-500">Este campo é o nome da empresa que será associada à conta de administrador.</p>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold text-gray-700">{pt.auth.fullName}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input required className="pl-9 focus-visible:ring-primary" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
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
                <Label className="font-semibold text-gray-700">{pt.common.phone}</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input required className="pl-9 focus-visible:ring-primary" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
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
              {loading ? pt.common.loading : 'Criar Conta PRODEX'}
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
export default GestorRegister;
