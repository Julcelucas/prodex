
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LogIn, Mail, Lock, ArrowLeft } from 'lucide-react';
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

  try {
    const res = await login(formData.email, formData.password);
    if (res.success) {
      toast({ title: "Login bem-sucedido!", description: "Bem-vindo(a)!" });
      if (res.user.user_type === 'gestor') navigate('/gestor-dashboard');
      else navigate('/funcionario-dashboard');
    } else {
      throw new Error(res.error);
    }
  } catch (err) {
    toast({ title: "Erro no login", description: err.message, variant: 'destructive' });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2"><LogIn className="h-10 w-10 text-gray-900" /></div>
          <CardTitle className="text-2xl">{pt.auth.loginTitle}</CardTitle>
          <CardDescription>{pt.auth.enterCredentials}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>{pt.common.email}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input type="email" required className="pl-10" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{pt.auth.password}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input type="password" required className="pl-10" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
            </div>
            <Button type="submit" className="w-full bg-gray-900 hover:bg-gray-800" disabled={loading}>
              {loading ? pt.common.loading : pt.auth.loginBtn}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 justify-center items-center text-sm text-gray-600">
          <div className="flex gap-4">
            <Link to="/gestor-register" className="text-blue-600 font-semibold">{pt.auth.registerManager}</Link>
            <span>|</span>
            <Link to="/funcionario-register" className="text-green-600 font-semibold">{pt.auth.registerEmployee}</Link>
          </div>
          <Link to="/" className="text-gray-500 hover:text-gray-900 flex items-center mt-4">
            <ArrowLeft className="h-4 w-4 mr-1"/> {pt.common.backToHome}
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};
export default Login;
