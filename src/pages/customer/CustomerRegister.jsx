import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Mail, Lock, User, Phone } from 'lucide-react';
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

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = pt.createOrder.reqEmail;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = pt.createOrder.invalidEmail;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = pt.createOrder.reqName;
    }

    // Phone validation
    const phoneRegex = /^[0-9]{9,}$/;
    if (!formData.phone) {
      newErrors.phone = pt.createOrder.reqPhone;
    } else if (!phoneRegex.test(formData.phone.replace(/[-\s]/g, ''))) {
      newErrors.phone = pt.createOrder.invalidPhone;
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
        title: pt.common.validationError,
        description: pt.common.fixErrors,
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
        title: pt.auth.regSuccess,
        description: pt.auth.regSuccessDesc,
      });
      navigate('/customer/login');
    } else {
      toast({
        title: pt.auth.regFailed,
        description: result.error || 'An error occurred during registration',
        variant: 'destructive',
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <Helmet>
        <title>{pt.auth.customerRegTitle}</title>
        <meta name="description" content={pt.auth.customerRegDescMeta} />
      </Helmet>

      <Card className="w-full max-w-md shadow-xl border-blue-100">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-gray-900">
            {pt.auth.createAccount}
          </CardTitle>
          <CardDescription className="text-center text-gray-600">
            {pt.auth.enterDetails}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-900 font-medium">
                {pt.auth.fullName}
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="João Silva"
                  className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                  required
                />
              </div>
              {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-900 font-medium">
                {pt.common.email}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="joao@exemplo.com"
                  className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                  required
                />
              </div>
              {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-900 font-medium">
                {pt.common.phone}
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="912345678"
                  className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                  required
                />
              </div>
              {errors.phone && <p className="text-red-600 text-sm">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-900 font-medium">
                {pt.auth.password}
              </Label>
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
              {errors.password && <p className="text-red-600 text-sm">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-900 font-medium">
                {pt.auth.confirmPassword}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                  required
                />
              </div>
              {errors.confirmPassword && <p className="text-red-600 text-sm">{errors.confirmPassword}</p>}
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              disabled={loading}
            >
              {loading ? pt.auth.creatingAccount : pt.auth.createAccountBtn}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            {pt.auth.alreadyHaveAccount}{' '}
            <Link to="/customer/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              {pt.auth.loginHere}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CustomerRegister;