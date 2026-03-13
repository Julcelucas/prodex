import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSupabase } from '@/hooks/useSupabase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle } from 'lucide-react';
import { pt } from '@/lib/translations';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, refreshCompanyInfo } = useAuth();
  const { updateSubscription } = useSupabase();
  const { toast } = useToast();
  const [status, setStatus] = useState('processing');
  
  const queryParams = new URLSearchParams(location.search);
  const plan = queryParams.get('plan') || 'basic';

  useEffect(() => {
    if (!currentUser || currentUser.user_type !== 'gestor') {
      navigate('/login');
      return;
    }

    // Mocking Stripe Checkout Process
    const processPayment = async () => {
      setTimeout(async () => {
        const res = await updateSubscription(currentUser.company_id, plan, 30);
        if (res.success) {
          setStatus('success');
          refreshCompanyInfo();
          toast({ title: pt.checkout.success });
          setTimeout(() => navigate('/gestor-dashboard'), 2000);
        } else {
          setStatus('error');
          toast({ title: pt.common.error, variant: 'destructive' });
          navigate('/pricing');
        }
      }, 2000); // Simulate network delay
    };

    processPayment();
  }, [currentUser, plan, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-8 text-center">
        <CardContent>
          {status === 'processing' && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
              <h2 className="text-xl font-semibold">{pt.checkout.processing}</h2>
              <p className="text-gray-500">MOCK STRIPE CHECKOUT</p>
            </div>
          )}
          {status === 'success' && (
            <div className="flex flex-col items-center gap-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <h2 className="text-xl font-semibold text-green-700">{pt.checkout.success}</h2>
              <p className="text-gray-500">{pt.checkout.redirecting}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
export default CheckoutPage;