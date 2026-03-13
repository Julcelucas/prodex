import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/hooks/useAuth';
import { useSupabase } from '@/hooks/useSupabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Package, ArrowLeft, LogOut } from 'lucide-react';
import { pt } from '@/lib/translations';

const CreateOrder = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { createOrder } = useSupabase();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    customer_name: currentUser?.name || '',
    customer_phone: currentUser?.phone || '',
    customer_email: currentUser?.email || '',
    customer_address: '',
    order_type: '',
    description: '',
    desired_delivery_date: '',
    desired_delivery_time: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customer_name.trim()) newErrors.customer_name = pt.createOrder.reqName;
    if (!formData.customer_phone.trim()) newErrors.customer_phone = pt.createOrder.reqPhone;
    if (!formData.customer_email.trim()) newErrors.customer_email = pt.createOrder.reqEmail;
    if (!formData.customer_address.trim()) newErrors.customer_address = pt.createOrder.reqAddress;
    if (!formData.order_type) newErrors.order_type = pt.createOrder.reqType;
    if (!formData.description.trim()) newErrors.description = pt.createOrder.reqDesc;
    if (!formData.desired_delivery_date) newErrors.desired_delivery_date = pt.createOrder.reqDate;
    if (!formData.desired_delivery_time) newErrors.desired_delivery_time = pt.createOrder.reqTime;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.customer_email && !emailRegex.test(formData.customer_email)) {
      newErrors.customer_email = pt.createOrder.invalidEmail;
    }

    const phoneRegex = /^[0-9]{9,}$/;
    if (formData.customer_phone && !phoneRegex.test(formData.customer_phone.replace(/[-\s]/g, ''))) {
      newErrors.customer_phone = pt.createOrder.invalidPhone;
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

  const handleSelectChange = (value) => {
    setFormData(prev => ({ ...prev, order_type: value }));
    if (errors.order_type) {
      setErrors(prev => ({ ...prev, order_type: '' }));
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

    const deliveryDateTime = new Date(`${formData.desired_delivery_date}T${formData.desired_delivery_time}`).toISOString();

    const orderData = {
      ...formData,
      desired_delivery_time: deliveryDateTime
    };

    const result = await createOrder(orderData);

    if (result.success) {
      toast({
        title: pt.createOrder.successTitle,
        description: pt.createOrder.successDesc,
      });
      navigate('/customer/orders');
    } else {
      toast({
        title: pt.createOrder.failedTitle,
        description: result.error || pt.createOrder.failedDesc,
        variant: 'destructive',
      });
    }

    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Helmet>
        <title>{pt.createOrder.title}</title>
        <meta name="description" content={pt.createOrder.descMeta} />
      </Helmet>

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">{pt.customerOrders.appTitle}</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{pt.common.welcome}, {currentUser?.name}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-gray-900 border-gray-300 hover:bg-gray-100"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {pt.common.logout}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/customer/orders')}
            className="mb-6 text-gray-900 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {pt.createOrder.backToOrders}
          </Button>

          <Card className="shadow-xl border-blue-100">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900">{pt.createOrder.createNew}</CardTitle>
              <CardDescription className="text-gray-600">
                {pt.createOrder.fillDetails}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer_name" className="text-gray-900 font-medium">
                      {pt.auth.fullName} *
                    </Label>
                    <Input
                      id="customer_name"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleChange}
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                      required
                    />
                    {errors.customer_name && <p className="text-red-600 text-sm">{errors.customer_name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer_phone" className="text-gray-900 font-medium">
                      {pt.common.phone} *
                    </Label>
                    <Input
                      id="customer_phone"
                      name="customer_phone"
                      value={formData.customer_phone}
                      onChange={handleChange}
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                      required
                    />
                    {errors.customer_phone && <p className="text-red-600 text-sm">{errors.customer_phone}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer_email" className="text-gray-900 font-medium">
                    {pt.common.email} *
                  </Label>
                  <Input
                    id="customer_email"
                    name="customer_email"
                    type="email"
                    value={formData.customer_email}
                    onChange={handleChange}
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                    required
                  />
                  {errors.customer_email && <p className="text-red-600 text-sm">{errors.customer_email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer_address" className="text-gray-900 font-medium">
                    {pt.common.address} *
                  </Label>
                  <Textarea
                    id="customer_address"
                    name="customer_address"
                    value={formData.customer_address}
                    onChange={handleChange}
                    rows={3}
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                    required
                  />
                  {errors.customer_address && <p className="text-red-600 text-sm">{errors.customer_address}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order_type" className="text-gray-900 font-medium">
                    {pt.common.orderType} *
                  </Label>
                  <Select onValueChange={handleSelectChange} value={formData.order_type}>
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                      <SelectValue placeholder={pt.createOrder.selectType} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={pt.common.package}>{pt.common.package}</SelectItem>
                      <SelectItem value={pt.common.document}>{pt.common.document}</SelectItem>
                      <SelectItem value={pt.common.food}>{pt.common.food}</SelectItem>
                      <SelectItem value={pt.common.other}>{pt.common.other}</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.order_type && <p className="text-red-600 text-sm">{errors.order_type}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-900 font-medium">
                    {pt.common.description} *
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder={pt.createOrder.provideDetails}
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                    required
                  />
                  {errors.description && <p className="text-red-600 text-sm">{errors.description}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="desired_delivery_date" className="text-gray-900 font-medium">
                      {pt.common.deliveryDate} *
                    </Label>
                    <Input
                      id="desired_delivery_date"
                      name="desired_delivery_date"
                      type="date"
                      value={formData.desired_delivery_date}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="bg-white border-gray-300 text-gray-900"
                      required
                    />
                    {errors.desired_delivery_date && <p className="text-red-600 text-sm">{errors.desired_delivery_date}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="desired_delivery_time" className="text-gray-900 font-medium">
                      {pt.common.deliveryTime} *
                    </Label>
                    <Input
                      id="desired_delivery_time"
                      name="desired_delivery_time"
                      type="time"
                      value={formData.desired_delivery_time}
                      onChange={handleChange}
                      className="bg-white border-gray-300 text-gray-900"
                      required
                    />
                    {errors.desired_delivery_time && <p className="text-red-600 text-sm">{errors.desired_delivery_time}</p>}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  disabled={loading}
                >
                  {loading ? pt.createOrder.creating : pt.createOrder.createBtn}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateOrder;