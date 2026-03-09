
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Key, Mail, Lock, User, Phone, Truck } from 'lucide-react';
import { pt } from '@/lib/translations';

const FuncionarioRegister = () => {
  const navigate = useNavigate();
  const { registerEmployee } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ companyCode: '', name: '', email: '', phone: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const res = await registerEmployee(formData.email, formData.password, formData.name, formData.phone, formData.companyCode);
    
    if (res.success) {
      toast({ title: pt.auth.regSuccess, description: pt.auth.regSuccessDesc });
      navigate('/funcionario-dashboard');
    } else {
      toast({ title: pt.common.error, description: res.error, variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-green-600">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2"><Truck className="h-10 w-10 text-green-600" /></div>
          <CardTitle className="text-2xl">{pt.auth.createEmployeeAccount}</CardTitle>
          <CardDescription>{pt.auth.enterDetails}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>{pt.auth.companyCode}</Label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input required className="pl-10 uppercase" placeholder="EX: ABC123" value={formData.companyCode} onChange={e => setFormData({...formData, companyCode: e.target.value.toUpperCase()})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{pt.auth.fullName}</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input required className="pl-10" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{pt.common.email}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input type="email" required className="pl-10" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{pt.common.phone}</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input required className="pl-10" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{pt.auth.password}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input type="password" required className="pl-10" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
            </div>
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading ? pt.common.loading : pt.auth.createAccountBtn}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-gray-600">
            {pt.auth.alreadyHaveAccount} <Link to="/login" className="text-green-600 font-semibold">{pt.auth.loginHere}</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
export default FuncionarioRegister;
