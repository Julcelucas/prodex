
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Loader2 } from 'lucide-react';

const PaymentSystem = ({
  planId,
  amount,
  onSuccess,
  onCancel,
  defaultEmail = '',
  defaultPassword = '',
  requireCredentials = true,
}) => {
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    email: defaultEmail,
    password: defaultPassword,
  });
  const { toast } = useToast();

  const handleSimulatePayment = async (e) => {
    e.preventDefault();
    if (requireCredentials && (!credentials.email || !credentials.password)) {
      toast({
        title: 'Dados em falta',
        description: 'Preencha o e-mail e a palavra-passe para concluir e fazer login.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const result = onSuccess ? await onSuccess(credentials) : { success: true };

      if (result?.success === false) {
        return;
      }

      toast({
        title: 'Pagamento Concluído com Sucesso!',
        description: 'A sua subscrição foi ativada.',
      });
    } catch (error) {
      console.error('[PaymentSystem] Payment flow failed', {
        message: error?.message || error,
        requireCredentials,
        email: credentials.email,
      });
      toast({
        title: 'Falha ao concluir pagamento',
        description: error.message || 'Não foi possível guardar os dados no Supabase.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-gray-200 shadow-xl">
      <CardHeader className="bg-gray-50 border-b pb-6">
        <CardTitle className="text-xl flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" /> Pagamento Seguro
        </CardTitle>
        <CardDescription>Conclua a sua subscrição do plano <strong>{planId}</strong>.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form id="payment-form" onSubmit={handleSimulatePayment} className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100 text-blue-800 text-sm">
            <strong>Total a Pagar:</strong> {amount.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
          </div>

          {requireCredentials ? (
            <div className="rounded-lg border border-gray-200 p-4 bg-white">
              <h4 className="font-semibold text-gray-900 mb-3">Credenciais para Login</h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>E-mail de Login</Label>
                  <Input
                    type="email"
                    required
                    placeholder="o.seu@email.com"
                    value={credentials.email}
                    onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Palavra-passe de Login</Label>
                  <Input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          ) : null}
          
          <div className="space-y-2">
            <Label>Nome no Cartão</Label>
            <Input required placeholder="Ex: João Silva" />
          </div>
          <div className="space-y-2">
            <Label>Número do Cartão</Label>
            <Input required placeholder="0000 0000 0000 0000" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Validade (MM/AA)</Label>
              <Input required placeholder="12/25" />
            </div>
            <div className="space-y-2">
              <Label>CVC</Label>
              <Input required placeholder="123" type="password" maxLength={3} />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end gap-3 border-t pt-4 bg-gray-50">
        <Button variant="outline" onClick={onCancel} disabled={loading}>Cancelar</Button>
        <Button form="payment-form" type="submit" className="bg-primary hover:bg-primary/90" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Pagar Agora
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PaymentSystem;
