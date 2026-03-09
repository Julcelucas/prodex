
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Building, Mail, Lock, User, Phone, Briefcase } from 'lucide-react';
import { pt } from '@/lib/translations';

const GestorRegister = () => {
  const navigate = useNavigate();
  const { registerManager } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ companyName: '', name: '', email: '', phone: '', password: '' });

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await registerManager(formData.email, formData.password, formData.name, formData.phone, formData.companyName);
    if (res.success) {
      toast({ title: "Gestor criado com sucesso!", description: "Seus dados foram registrados." });
      navigate('/pricing');
    } else {
      throw new Error(res.error);
    }
  } catch (err) {
    toast({ title: "Erro", description: err.message, variant: 'destructive' });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-blue-600">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2"><Briefcase className="h-10 w-10 text-blue-600" /></div>
          <CardTitle className="text-2xl">{pt.auth.createManagerAccount}</CardTitle>
          <CardDescription>{pt.auth.enterDetails}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>{pt.auth.companyName}</Label>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input required className="pl-10" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
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
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? pt.common.loading : pt.auth.createAccountBtn}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-gray-600">
            {pt.auth.alreadyHaveAccount} <Link to="/login" className="text-blue-600 font-semibold">{pt.auth.loginHere}</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
export default GestorRegister;
