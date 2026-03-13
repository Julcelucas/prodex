
export const pt = {
  common: {
    loading: 'A carregar...',
    backToHome: 'Voltar ao Início',
    logout: 'Terminar Sessão',
    welcome: 'Bem-vindo(a)',
    description: 'Descrição',
    customerName: 'Nome do Cliente',
    customer: 'Cliente',
    phone: 'Telefone',
    email: 'E-mail',
    address: 'Morada',
    deliveryDate: 'Data do Pedido',
    deliveryTime: 'Hora do Pedido',
    desiredDelivery: 'Data Esperada',
    status: 'Status de Processamento',
    orderType: 'Tipo de Pedido',
    validationError: 'Erro de Validação',
    fixErrors: 'Por favor, corrija os erros no formulário',
    success: 'Sucesso',
    error: 'Erro',
    package: 'Pacote',
    document: 'Documento',
    food: 'Alimentação',
    other: 'Outro',
    company: 'Empresa',
    employee: 'Funcionário',
    admin: 'Administrador',
    assign: 'Atribuir',
    assignedTo: 'Atribuído a',
    unassigned: 'Não atribuído',
    save: 'Guardar',
    cancel: 'Cancelar',
    actions: 'Ações'
  },
  status: {
    pending: 'Recebido',
    accepted: 'Aceite',
    in_delivery: 'Em entrega',
    in_progress: 'Em Processamento',
    delivered: 'Concluído',
    cancelled: 'Cancelado'
  },
  priority: {
    delayed: 'Atrasado',
    urgent: 'Urgente',
    normal: 'Normal'
  },
  alerts: {
    nearDeadline: 'Pedido próximo do prazo',
    overdue: 'Pedido em atraso',
    pending: 'Novo pedido atribuído'
  },
  landing: {
    title: 'Sistema de Processamento de Pedidos',
    subtitle: 'Otimize a gestão interna, controle os fluxos de trabalho e garanta processamento eficiente.',
    cta: 'Começar Agora',
    features: {
      orders: 'Gestão de Pedidos',
      employees: 'Controle de Funcionários',
      alerts: 'Monitorização',
      reports: 'Métricas de Performance'
    }
  },
  auth: {
    adminLoginTitle: 'Acesso Administrador',
    employeeLoginTitle: 'Acesso Funcionário',
    enterDetails: 'Insira as suas credenciais para aceder',
    loginBtn: 'Entrar',
    adminRegisterLink: 'Não tem conta? Veja os nossos planos',
    employeeRegisterLink: 'Não tem conta? Registe-se aqui',
    invalidCreds: 'Credenciais inválidas.',
    loginSuccess: 'Login com sucesso!',
    loginSuccessDesc: 'Bem-vindo ao portal.',
    loginFailed: 'Falha no login',
    loggingIn: 'A entrar...',
    dontHaveAccount: 'Não tem conta?',
    registerHere: 'Registe-se aqui',
    alreadyHaveAccount: 'Já tem conta?',
    loginHere: 'Entrar aqui',
    createAccount: 'Criar Conta',
    fullName: 'Nome Completo',
    password: 'Palavra-passe',
    confirmPassword: 'Confirmar Palavra-passe',
    createAccountBtn: 'Criar Conta',
    creatingAccount: 'A criar...',
    regSuccess: 'Registo Concluído',
    regSuccessDesc: 'A sua conta foi criada.',
    regFailed: 'Falha no registo'
  },
  processing: {
    processingTime: 'Tempo de Processamento',
    completionRate: 'Taxa de Conclusão',
    ordersAssignedToMe: 'Pedidos Atribuídos a Mim',
    myOrders: 'Os Meus Pedidos',
    addNewOrder: 'Adicionar Novo Pedido',
    markAsCompleted: 'Marcar como Concluído',
    processingMetrics: 'Métricas de Processamento',
    teamPerformance: 'Performance da Equipa',
    bottleneckAnalysis: 'Análise de Gargalos'
  },
  employeeOrders: {
    title: 'Os Meus Pedidos | Sistema',
    descMeta: 'Processe os seus pedidos.',
    appTitle: 'Portal do Funcionário',
    myOrders: 'Os Meus Pedidos',
    createNewOrder: 'Novo Pedido',
    loading: 'A carregar pedidos...',
    noOrders: 'Sem pedidos no momento.',
    createFirst: 'Aguarde atribuição de novos pedidos.',
    orderPlaced: 'Registado em'
  },
  createOrder: {
    createBtn: 'Criar Pedido',
    reqEmail: 'E-mail é obrigatório',
    invalidEmail: 'E-mail inválido',
    reqName: 'Nome é obrigatório',
    reqPhone: 'Telefone é obrigatório',
    invalidPhone: 'Telefone inválido'
  },
  dashboard: {
    adminTitle: 'Painel de Gestão',
    employeeTitle: 'Área de Processamento',
    tabs: {
      overview: 'Visão Geral',
      orders: 'Os Meus Pedidos',
      allOrders: 'Todos os Pedidos',
      employees: 'Funcionários',
      reports: 'Relatórios',
      settings: 'Configurações'
    },
    metrics: {
      totalOrders: 'Total de Pedidos este Mês',
      onTimeRate: 'Taxa de Conclusão',
      avgTime: 'Tempo Médio de Processamento (h)'
    },
    newOrder: 'Novo Pedido',
    newEmployee: 'Novo Funcionário',
    updateStatus: 'Atualizar Status'
  },
  adminDashboard: {
    title: 'Painel do Administrador | PRODEX',
    descMeta: 'Gestão central de pedidos e monitorização operacional.',
    header: 'Painel do Administrador',
    pendingLabel: 'Pendentes',
    delayedLabel: 'Atrasados',
    inDeliveryLabel: 'Em Entrega',
    deliveredLabel: 'Concluídos',
    queueTitle: 'Fila de Pedidos',
    queueDesc: 'Pedidos priorizados por urgência e prazo de entrega.',
    loading: 'A carregar pedidos...',
    noOrders: 'Sem pedidos pendentes',
    noOrdersDesc: 'Quando houver novos pedidos, irão aparecer aqui.',
    orderPrefix: 'Pedido'
  },
  pricing: {
    title: 'Planos e Preços',
    subtitle: 'Escolha o plano ideal',
    selectPlan: 'Selecionar Plano',
    currency: 'AOA',
    plans: {
      basic: 'Básico',
      pro: 'Profissional',
      enterprise: 'Empresarial'
    }
  }
};

export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 2
  }).format(value);
};
