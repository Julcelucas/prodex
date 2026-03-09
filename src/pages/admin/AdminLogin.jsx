import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Shield, Mail, Lock, ArrowLeft } from 'lucide-react';
import { pt } from '@/lib/translations';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth(); // ✅ usar hook customizado

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await login(formData.email, formData.password);

      if (res.success) {
        toast({
          title: pt.auth.loginSuccess,
          description: pt.auth.loginSuccessDesc,
        });

        // Redireciona admin diretamente
        if (res.user.user_type === 'admin') navigate('/admin-dashboard');
        else if (res.user.user_type === 'gestor') navigate('/gestor-dashboard');
        else navigate('/funcionario-dashboard');

      } else {
        throw new Error(res.error || pt.auth.invalidCreds);
      }
    } catch (err) {
      toast({
        title: pt.auth.loginFailed,
        description: err.message || 'Erro ao conectar com o servidor',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4">
      <Helmet>
        <title>{pt.auth.adminLoginTitle}</title>
        <meta name="description" content={pt.auth.adminLoginDescMeta} />
      </Helmet>

      <Card className="w-full max-w-md shadow-xl border-gray-200">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="bg-gray-900 p-3 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-gray-900">
            {pt.auth.adminPortal}
          </CardTitle>
          <CardDescription className="text-center text-gray-600">
            {pt.auth.adminCredentials}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-900 font-medium">{pt.auth.adminEmail}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@teste.com"
                  className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-900 font-medium">{pt.auth.password}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold"
              disabled={loading}
            >
              {loading ? pt.auth.loggingIn : pt.auth.accessDashboard}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            {pt.common.backToHome}
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminLogin;