
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { pt } from '@/lib/translations';

const CustomerRegister = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = pt.createOrder?.reqEmail || 'Email obrigatório';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = pt.createOrder?.invalidEmail || 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    if (!formData.name.trim()) {
      newErrors.name = pt.createOrder?.reqName || 'Nome obrigatório';
    }

    const phoneRegex = /^[0-9]{9,}$/;
    if (!formData.phone) {
      newErrors.phone = pt.createOrder?.reqPhone || 'Telefone obrigatório';
    } else if (!phoneRegex.test(formData.phone.replace(/[-\s]/g, ''))) {
      newErrors.phone = pt.createOrder?.invalidPhone || 'Telefone inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: pt.common.validationError || 'Erro',
        description: pt.common.fixErrors || 'Corrija os erros',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const result = await signUp(
      formData.email,
      formData.password,
      formData.name,
      formData.phone,
      'customer'
    );

    if (result.success) {
      toast({
        title: pt.auth.regSuccess || 'Sucesso',
        description: pt.auth.regSuccessDesc || 'Conta criada',
      });
      navigate('/customer/login');
    } else {
      toast({
        title: pt.auth.regFailed || 'Erro',
        description: result.error || 'Erro no registo',
        variant: 'destructive',
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 py-12">
      <Helmet>
        <title>{pt.auth.customerRegTitle || 'Registo Cliente | PRODEX'}</title>
        <meta name="description" content={pt.auth.customerRegDescMeta} />
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
            {pt.auth.createAccount || 'Criar Conta'}
          </CardTitle>
          <CardDescription className="text-center text-gray-600">
            {pt.auth.enterDetails || 'Insira os seus dados'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-900 font-medium">
                {pt.auth.fullName || 'Nome Completo'}
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="João Silva"
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-primary h-10"
                required
              />
              {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
            </div>

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
                placeholder="joao@exemplo.com"
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-primary h-10"
                required
              />
              {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-900 font-medium">
                {pt.common.phone}
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="912345678"
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-primary h-10"
                required
              />
              {errors.phone && <p className="text-red-600 text-sm">{errors.phone}</p>}
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
              {errors.password && <p className="text-red-600 text-sm">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-900 font-medium">
                {pt.auth.confirmPassword || 'Confirmar Palavra-passe'}
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-primary h-10"
                required
              />
              {errors.confirmPassword && <p className="text-red-600 text-sm">{errors.confirmPassword}</p>}
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium h-10 mt-2"
              disabled={loading}
            >
              {loading ? (pt.auth.creatingAccount || 'A criar...') : (pt.auth.createAccountBtn || 'Criar Conta')}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center pt-4 border-t">
          <p className="text-sm text-gray-600">
            {pt.auth.alreadyHaveAccount || 'Já tem conta?'} {' '}
            <Link to="/customer/login" className="text-primary hover:text-primary/80 font-semibold">
              {pt.auth.loginHere || 'Entrar aqui'}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CustomerRegister;
