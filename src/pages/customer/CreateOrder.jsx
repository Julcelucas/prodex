import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useSupabase } from '@/hooks/useSupabase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Package, ArrowLeft } from 'lucide-react';

const CreateOrder = () => {

  const navigate = useNavigate();
  const { createOrder } = useSupabase();
  const { currentUser } = useAuth();   // ✅ pegar usuário logado
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    customer_address: '',
    order_type: '',
    description: '',
    desired_delivery_date: '',
    desired_delivery_time: ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {

    const newErrors = {};

    if (!formData.customer_name.trim()) newErrors.customer_name = "Nome obrigatório";
    if (!formData.customer_phone.trim()) newErrors.customer_phone = "Telefone obrigatório";
    if (!formData.customer_address.trim()) newErrors.customer_address = "Endereço obrigatório";
    if (!formData.order_type) newErrors.order_type = "Tipo obrigatório";
    if (!formData.description.trim()) newErrors.description = "Descrição obrigatória";
    if (!formData.desired_delivery_date) newErrors.desired_delivery_date = "Data obrigatória";
    if (!formData.desired_delivery_time) newErrors.desired_delivery_time = "Hora obrigatória";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;

  };

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

  };

  const handleSelectChange = (value) => {

    setFormData(prev => ({
      ...prev,
      order_type: value
    }));

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!validateForm()) {

      toast({
        title: "Erro",
        description: "Preencha os campos obrigatórios",
        variant: "destructive"
      });

      return;

    }

    if (!currentUser?.company_id) {

      toast({
        title: "Erro",
        description: "Empresa não encontrada para este usuário",
        variant: "destructive"
      });

      return;

    }

    setLoading(true);

    const deliveryDateTime = new Date(
      `${formData.desired_delivery_date}T${formData.desired_delivery_time}`
    ).toISOString();

    const orderData = {
      ...formData,
      desired_delivery_time: deliveryDateTime,
      status: "pending"
    };

    // ✅ agora envia company_id
    const result = await createOrder(orderData, currentUser.company_id);

    if (result.success) {

      toast({
        title: "Pedido criado",
        description: "Pedido criado com sucesso"
      });

      navigate("/gestor-dashboard");

    } else {

      toast({
        title: "Erro",
        description: result.error || "Falha ao criar pedido",
        variant: "destructive"
      });

    }

    setLoading(false);

  };

  return (

    <div className="min-h-screen bg-gray-50">

      <Helmet>
        <title>Novo Pedido</title>
      </Helmet>

      <div className="container mx-auto px-4 py-10 max-w-2xl">

        <Button
          variant="ghost"
          onClick={() => navigate('/gestor-dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <Card>

          <CardHeader>

            <CardTitle className="flex items-center gap-2">
              <Package className="h-6 w-6"/>
              Criar Novo Pedido
            </CardTitle>

            <CardDescription>
              Preencha os dados do cliente e da entrega
            </CardDescription>

          </CardHeader>

          <CardContent>

            <form onSubmit={handleSubmit} className="space-y-6">

              <div>

                <Label>Nome do cliente</Label>

                <Input
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                />

              </div>

              <div>

                <Label>Telefone</Label>

                <Input
                  name="customer_phone"
                  value={formData.customer_phone}
                  onChange={handleChange}
                />

              </div>

              <div>

                <Label>Email (opcional)</Label>

                <Input
                  name="customer_email"
                  value={formData.customer_email}
                  onChange={handleChange}
                />

              </div>

              <div>

                <Label>Endereço</Label>

                <Textarea
                  name="customer_address"
                  value={formData.customer_address}
                  onChange={handleChange}
                />

              </div>

              <div>

                <Label>Tipo de pedido</Label>

                <Select onValueChange={handleSelectChange}>

                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>

                  <SelectContent>

                    <SelectItem value="package">Pacote</SelectItem>
                    <SelectItem value="document">Documento</SelectItem>
                    <SelectItem value="food">Comida</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>

                  </SelectContent>

                </Select>

              </div>

              <div>

                <Label>Descrição</Label>

                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />

              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>

                  <Label>Data</Label>

                  <Input
                    type="date"
                    name="desired_delivery_date"
                    value={formData.desired_delivery_date}
                    onChange={handleChange}
                  />

                </div>

                <div>

                  <Label>Hora</Label>

                  <Input
                    type="time"
                    name="desired_delivery_time"
                    value={formData.desired_delivery_time}
                    onChange={handleChange}
                  />

                </div>

              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Criando..." : "Criar Pedido"}
              </Button>

            </form>

          </CardContent>

        </Card>

      </div>

    </div>

  );

};

export default CreateOrder;