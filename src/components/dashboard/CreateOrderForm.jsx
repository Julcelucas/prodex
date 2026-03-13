
import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, X } from 'lucide-react';

const CreateOrderForm = ({ currentUser, employees = [], onCreateOrder, onCancel, onSuccess }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    address: '',
    type: 'Documentos',
    description: '',
    specialInstructions: '',
    priority: 'Normal',
    employee: currentUser?.id || ''
  });

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!formData.customerName || !formData.address || !formData.type) {
      toast({ title: 'Erro de Validação', description: 'Por favor, preencha os campos obrigatórios (*).', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const newOrderPayload = {
        customer_name: formData.customerName,
        phone: formData.phone || null,
        customer_email: currentUser?.email || null,
        address: formData.address,
        type: formData.type,
        description: formData.description || null,
        special_instructions: formData.specialInstructions || null,
        priority: formData.priority,
        assigned_to: formData.employee || null,
        status: 'pending',
        desired_delivery_time: new Date().toISOString(),
        company_id: currentUser?.company_id,
      };

      if (!onCreateOrder) {
        throw new Error('Função de criação não configurada.');
      }

      const result = await onCreateOrder(newOrderPayload);
      if (!result?.success) {
        throw new Error(result?.error || 'Falha ao guardar pedido.');
      }
      
      toast({ title: 'Sucesso', description: 'Pedido criado com sucesso!' });
      
      // Reset form
      setFormData(prev => ({
        ...prev,
        customerName: '',
        phone: '',
        address: '',
        description: '',
        specialInstructions: ''
      }));
      
      if(onSuccess) onSuccess();
    } catch (error) {
      toast({ title: 'Erro', description: error.message || 'Falha ao guardar pedido.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [currentUser, formData, onCreateOrder, onSuccess, toast]);

  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="bg-white border-b flex flex-row justify-between items-center pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <PlusCircle className="h-5 w-5 text-primary" />
          Adicionar Novo Pedido
        </CardTitle>
        {onCancel && (
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-5 w-5 text-gray-500" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Customer Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider border-b pb-2">Detalhes do Cliente</h3>
              <div className="space-y-2">
                <Label htmlFor="customerName" className="font-medium text-gray-700">Nome do Cliente *</Label>
                <Input 
                  id="customerName" name="customerName" required
                  value={formData.customerName} onChange={handleChange}
                  className="bg-white" placeholder="Ex: João Silva"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="font-medium text-gray-700">Telefone</Label>
                <Input 
                  id="phone" name="phone"
                  value={formData.phone} onChange={handleChange}
                  className="bg-white" placeholder="Ex: 923000111"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="font-medium text-gray-700">Morada do Pedido / Setor *</Label>
                <Input 
                  id="address" name="address" required
                  value={formData.address} onChange={handleChange}
                  className="bg-white" placeholder="Ex: Armazém B, Luanda"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Order Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider border-b pb-2">Detalhes do Pedido</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type" className="font-medium text-gray-700">Tipo de Produto *</Label>
                  <select 
                    id="type" name="type" required
                    value={formData.type} onChange={handleChange}
                    className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={loading}
                  >
                    <option value="Documentos">Documentos</option>
                    <option value="Eletrónicos">Eletrónicos</option>
                    <option value="Mobiliário">Mobiliário</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority" className="font-medium text-gray-700">Prioridade</Label>
                  <select 
                    id="priority" name="priority"
                    value={formData.priority} onChange={handleChange}
                    className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={loading}
                  >
                    <option value="Low">Baixa</option>
                    <option value="Normal">Normal</option>
                    <option value="High">Alta</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="employee" className="font-medium text-gray-700">Atribuir a Funcionário</Label>
                <select 
                  id="employee" name="employee"
                  value={formData.employee} onChange={handleChange}
                  className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={loading}
                >
                  <option value="">-- Não Atribuído --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="font-medium text-gray-700">Descrição / Notas Adicionais</Label>
                <textarea 
                  id="description" name="description"
                  value={formData.description} onChange={handleChange}
                  className="w-full p-3 rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px] resize-y"
                  placeholder="Instruções adicionais ou detalhes do pedido..."
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                Cancelar
              </Button>
            )}
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-white font-bold px-8" disabled={loading}>
              {loading ? 'A Guardar...' : 'Criar Pedido'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateOrderForm;
