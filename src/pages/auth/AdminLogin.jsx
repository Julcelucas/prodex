
import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { pt } from '@/lib/translations';
import { usePageSEO } from '@/hooks/useSEO';
import { seoConfig } from '@/lib/seoConfig';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    if (location.state?.prefillEmail || location.state?.prefillPassword) {
      setFormData({
        email: location.state?.prefillEmail || '',
        password: location.state?.prefillPassword || '',
      });
    }
  }, [location.state]);

  // Implement SEO with noindex
  usePageSEO({
    title: seoConfig.pages.adminLogin.title,
    description: seoConfig.pages.adminLogin.description,
    keywords: seoConfig.pages.adminLogin.keywords,
    noindex: true
  });

  const handleSubmit = async e => {
    e.preventDefault();
    setErrorMsg('');
    if (!formData.email || !formData.password) {
      setErrorMsg('Por favor, preencha todos os campos.');
      return;
    }
    setLoading(true);
    const res = await login(formData.email, formData.password, 'gestor');
    if (res.success) {
      if (res.generatedCompanyId) {
        toast({
          title: 'Aviso',
          description: 'A gerar ID de Empresa...'
        });
      }
      toast({
        title: pt.common.success,
        description: 'Bem-vindo ao painel de administrador!'
      });
      setFormData({
        email: '',
        password: ''
      }); // reset form

      // Small delay to allow toast to be visible if company ID was generated
      setTimeout(() => {
        navigate('/empresa/dashboard', {
          replace: true
        });
      }, res.generatedCompanyId ? 1000 : 0);
    } else {
      setErrorMsg(res.error || 'Credenciais inválidas.');
      toast({
        title: pt.common.error,
        description: res.error || 'Erro ao efetuar login.',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 px-4 py-12 w-full">
      <Card className="w-full max-w-md shadow-md border border-gray-200 my-8">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-6">
            <img src="https://horizons-cdn.hostinger.com/09c56e09-52d4-418e-a931-c90b615a7eec/prodex_prancheta-1-GI8vn.png" alt="PRODEX Logo" className="logo-md object-contain" />
          </div>
          <h1 className="text-2xl font-bold mb-1">Painel de Administrador</h1>
          <CardDescription>Acesso reservado a administradores do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          
          {errorMsg && <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="font-medium text-gray-700">E-mail de Administrador</Label>
              <Input type="email" required placeholder="o.seu@email.com" className="h-10 focus-visible:ring-primary text-gray-900 bg-white" value={formData.email} onChange={e => setFormData({
              ...formData,
              email: e.target.value
            })} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label className="font-medium text-gray-700">Palavra-passe</Label>
              <Input type="password" required placeholder="••••••••" className="h-10 focus-visible:ring-primary text-gray-900 bg-white" value={formData.password} onChange={e => setFormData({
              ...formData,
              password: e.target.value
            })} disabled={loading} />
            </div>
            <Button type="submit" className="w-full h-10 font-medium bg-primary hover:bg-primary/90 mt-2 text-white" disabled={loading}>
              {loading ? 'A verificar...' : 'Entrar no Sistema'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center pt-4 border-t flex flex-col gap-2">
          <Link to="/login" className="text-sm text-gray-600 hover:text-primary transition-colors">
            É funcionário? Faça login aqui
          </Link>
          <Link to="/" className="text-sm text-primary hover:underline">
            Voltar à página inicial
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminLogin;
