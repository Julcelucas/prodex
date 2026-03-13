
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { pt } from '@/lib/translations';

const CustomerLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast({
        title: pt.common.validationError,
        description: pt.auth.invalidCreds,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const result = await login(formData.email, formData.password, 'customer');

    if (result.success) {
      toast({
        title: pt.auth.loginSuccess,
        description: pt.auth.loginSuccessDesc,
      });
      navigate('/customer/orders');
    } else {
      toast({
        title: pt.auth.loginFailed,
        description: pt.auth.invalidCreds,
        variant: 'destructive',
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Helmet>
        <title>{pt.auth.customerLoginTitle || 'Login de Cliente | PRODEX'}</title>
        <meta name="description" content={pt.auth.customerLoginDescMeta} />
      </Helmet>

      <Card className="w-full max-w-md shadow-md border-gray-200">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-6">
            <img 
              src="https://horizons-cdn.hostinger.com/09c56e09-52d4-418e-a931-c90b615a7eec/c5d6ad514ca5b4c520fa8222cf1b75cb.png" 
              alt="PRODEX Logo" 
              className="logo-md object-contain" 
            />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-gray-900">
            {pt.auth.customerLoginHeader || 'Acesso Cliente'}
          </CardTitle>
          <CardDescription className="text-center text-gray-600">
            {pt.auth.enterCredentials || 'Insira as suas credenciais'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-900 font-medium">
                {pt.common.email}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="cliente@teste.com"
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-primary h-10"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-900 font-medium">
                {pt.auth.password || 'Palavra-passe'}
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-primary h-10"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium h-10 mt-2"
              disabled={loading}
            >
              {loading ? (pt.auth.loggingIn || 'A entrar...') : (pt.auth.loginBtn || 'Entrar')}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3 pt-4 border-t">
          <p className="text-sm text-gray-600">
            {pt.auth.dontHaveAccount || 'Não tem conta?'} {' '}
            <Link to="/customer/register" className="text-primary hover:text-primary/80 font-semibold">
              {pt.auth.registerHere || 'Registe-se aqui'}
            </Link>
          </p>
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            {pt.common.backToHome || 'Voltar ao Início'}
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CustomerLogin;
