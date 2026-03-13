
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, CheckCircle } from 'lucide-react';
import { pt } from '@/lib/translations';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const res = await login(formData.email, formData.password);
    
    if (res.success) {
      toast({ title: pt.auth.regSuccess, description: pt.common.welcome });
      if (res.user.user_type === 'gestor') navigate('/gestor-dashboard');
      else navigate('/funcionario-dashboard');
    } else {
      toast({ title: pt.common.error, description: res.error, variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 p-4 py-12">
      <Card className="w-full max-w-md shadow-2xl border-t-8 border-t-primary rounded-xl overflow-hidden">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-1 font-extrabold text-3xl tracking-tighter text-primary">
              <CheckCircle className="h-8 w-8" /> PRODEX
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Iniciar Sessão</CardTitle>
          <CardDescription className="text-gray-500">Aceda à sua conta PRODEX</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold">{pt.common.email}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input type="email" required className="pl-10 focus-visible:ring-primary h-11" placeholder="o.seu@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-gray-700 font-semibold">{pt.auth.password}</Label>
                <span className="text-xs text-primary hover:underline cursor-pointer">Esqueceu-se da senha?</span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input type="password" required className="pl-10 focus-visible:ring-primary h-11" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
            </div>
            <Button type="submit" className="w-full h-11 text-base font-bold shadow-md" disabled={loading}>
              {loading ? pt.common.loading : 'Entrar na Plataforma'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 justify-center items-center text-sm bg-gray-50/50 py-6 border-t">
          <div className="text-gray-600">Não tem conta?</div>
          <div className="flex gap-4">
            <Link to="/gestor-register" className="text-primary font-bold hover:underline">Criar Empresa</Link>
            <span className="text-gray-300">|</span>
            <Link to="/funcionario-register" className="text-primary font-bold hover:underline">Sou Motorista</Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
export default Login;
