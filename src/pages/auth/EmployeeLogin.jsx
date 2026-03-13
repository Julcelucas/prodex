
import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { pt } from '@/lib/translations';
import { usePageSEO } from '@/hooks/useSEO';
import { seoConfig } from '@/lib/seoConfig';
import { Alert, AlertDescription } from '@/components/ui/alert';

const EmployeeLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Implement SEO with noindex
  usePageSEO({
    title: seoConfig.pages.employeeLogin.title,
    description: seoConfig.pages.employeeLogin.description,
    keywords: seoConfig.pages.employeeLogin.keywords,
    noindex: true
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setErrorMsg('');
    if (!formData.email || !formData.password) {
      setErrorMsg('Por favor, preencha todos os campos.');
      return;
    }
    setLoading(true);
    const result = await login(formData.email, formData.password, 'funcionario');
    if (result.success) {
      if (result.generatedCompanyId) {
        toast({
          title: 'Aviso',
          description: 'A gerar ID de Empresa...'
        });
      }
      toast({
        title: 'Login efetuado',
        description: 'Bem-vindo ao seu painel de funcionário.'
      });
      setFormData({
        email: '',
        password: ''
      }); // reset form

      setTimeout(() => {
        const from = location.state?.from?.pathname;
        const safeTarget = from === '/funcionario/dashboard' || from === '/funcionario-dashboard'
          ? from
          : '/funcionario/dashboard';
        navigate(safeTarget, {
          replace: true
        });
      }, result.generatedCompanyId ? 1000 : 0);
    } else {
      setErrorMsg(result.error || 'Credenciais inválidas.');
      toast({
        title: 'Erro de Autenticação',
        description: result.error || 'Verifique os seus dados e tente novamente.',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 px-4 py-12 w-full">
      <Card className="w-full max-w-md shadow-md border-gray-200 my-8">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-6">
            <img src="https://horizons-cdn.hostinger.com/09c56e09-52d4-418e-a931-c90b615a7eec/prodex_prancheta-1-ZkZON.png" alt="PRODEX Logo" className="logo-md object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-1">
            Painel de Funcionário
          </h1>
          <CardDescription className="text-center text-gray-600">
            Acesso à gestão de pedidos
          </CardDescription>
        </CardHeader>

        <CardContent>
          {errorMsg && <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-900 font-medium">
                E-mail de Funcionário
              </Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="o.seu@email.com" className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-primary h-10" required disabled={loading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-900 font-medium">
                Palavra-passe
              </Label>
              <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-primary h-10" required disabled={loading} />
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-medium h-10 mt-2" disabled={loading}>
              {loading ? 'A verificar...' : 'Entrar no Sistema'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3 pt-4 border-t">
          <p className="text-sm text-gray-600">
            Não tem conta? {' '}
            <Link to="/funcionario-register" className="text-primary hover:text-primary/80 font-semibold">
              Registe-se aqui
            </Link>
          </p>
          <Link to="/admin/login" className="text-sm text-gray-500 hover:text-gray-700 font-medium">
            Acesso Administrador
          </Link>
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1 mt-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Início
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EmployeeLogin;
