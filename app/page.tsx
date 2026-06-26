'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Search, 
  Users, 
  FileText, 
  TrendingUp, 
  Sparkles, 
  Download, 
  Calendar, 
  Building2, 
  User, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  RefreshCw, 
  DollarSign, 
  ArrowUpRight, 
  Mail, 
  Phone, 
  MapPin, 
  Tag, 
  Send, 
  Check, 
  Copy,
  ExternalLink,
  ChevronRight,
  Info,
  AlertTriangle,
  Settings,
  Upload,
  Pencil,
  Receipt,
  Printer
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface CompanyInfo {
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  telefone: string;
  email: string;
  website: string;
  logradouro: string;
  numero: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  slogan: string;
  logoBase64?: string;
}

const DEFAULT_COMPANY_INFO: CompanyInfo = {
  nomeFantasia: 'Avant It System',
  razaoSocial: 'Avant It Suprimentos e Tecnologia Ltda.',
  cnpj: '12.345.678/0001-90',
  telefone: '(11) 4002-8922',
  email: 'comercial@avantit.com.br',
  website: 'www.avantit.com.br',
  logradouro: 'Avenida Paulista',
  numero: '1000',
  bairro: 'Bela Vista',
  municipio: 'São Paulo',
  uf: 'SP',
  cep: '01310-100',
  slogan: 'Portfólio & Suprimentos Consolidados',
  logoBase64: ''
};

const DEFAULT_CATEGORIES: string[] = ['Tecnologia', 'Obras', 'Escritório', 'Consultoria', 'Serviços', 'Outros'];

interface Item {
  id: string;
  name: string;
  quantity: number;
  price: number;
  supplierId: string;
  tipo?: 'Aquisição' | 'Comodato';
}

interface Client {
  id: string;
  nome: string;
  fantasia: string;
  documento: string;
  telefone: string;
  email: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cep: string;
  municipio: string;
  uf: string;
  situacao: string;
  origem: string;
}

interface Supplier {
  id: string;
  nome: string;
  cnpj: string;
  telefone: string;
  email: string;
  setor: string;
}

interface Budget {
  id: string;
  title: string;
  clientId: string;
  status: 'PENDING' | 'APPROVED' | 'CANCELED';
  createdDate: string;
  validityDate: string;
  category: string;
  items: Item[];
  discount: number;
  subtotal: number;
  total: number;
  paymentTerms: string;
  notes: string;
}

interface Receipt {
  id: string;
  number: string;
  budgetId?: string;
  clientId?: string;
  clientName: string;
  clientDocument: string;
  value: number;
  valueInWords: string;
  date: string;
  paymentMethod: string;
  reference: string;
  status: 'PAGO' | 'PENDENTE' | 'CANCELADO';
  isSigned: boolean;
  signatureName: string;
}

function valorPorExtenso(valor: number): string {
  if (valor === 0) return "Zero Reais";

  const num = Math.abs(valor);
  const reais = Math.floor(num);
  const centavos = Math.round((num - reais) * 100);

  const unidades = ["", "Um", "Dois", "Três", "Quatro", "Cinco", "Seis", "Sete", "Oito", "Nove"];
  const dezenas = ["", "Dez", "Vinte", "Trinta", "Quarenta", "Cinquenta", "Sessenta", "Setenta", "Oitenta", "Noventa"];
  const dezenasDez = ["Dez", "Onze", "Doze", "Treze", "Quatorze", "Quinze", "Dezesseis", "Dezessete", "Dezoito", "Dezenove"];
  const centenas = ["", "Cento", "Duzentos", "Trezentos", "Quatrocentos", "Quinhentos", "Seiscentos", "Setecentos", "Oitocentos", "Novecentos"];

  function converterCentena(n: number): string {
    if (n === 100) return "Cem";
    let u = n % 10;
    let d = Math.floor((n % 100) / 10);
    let c = Math.floor(n / 100);
    let partes: string[] = [];

    if (c > 0) {
      partes.push(centenas[c]);
    }

    if (d === 1) {
      partes.push(dezenasDez[u]);
    } else {
      if (d > 0) partes.push(dezenas[d]);
      if (u > 0) partes.push(unidades[u]);
    }

    return partes.join(" e ");
  }

  let extReais = "";
  if (reais > 0) {
    if (reais < 1000) {
      extReais = converterCentena(reais) + (reais === 1 ? " Real" : " Reais");
    } else {
      const milhar = Math.floor(reais / 1000);
      const resto = reais % 1000;
      let extMilhar = "";
      if (milhar === 1) {
        extMilhar = "Mil";
      } else {
        extMilhar = converterCentena(milhar) + " Mil";
      }
      
      let extResto = "";
      if (resto > 0) {
        const conjuncao = (resto < 100 || resto % 100 === 0) ? " e " : " ";
        extResto = conjuncao + converterCentena(resto);
      }
      extReais = extMilhar + extResto + (reais === 1 ? " Real" : " Reais");
    }
  }

  let extCentavos = "";
  if (centavos > 0) {
    extCentavos = converterCentena(centavos) + (centavos === 1 ? " Centavo" : " Centavos");
  }

  let finalStr = "";
  if (extReais && extCentavos) {
    finalStr = extReais + " e " + extCentavos;
  } else if (extReais) {
    finalStr = extReais;
  } else if (extCentavos) {
    finalStr = extCentavos + " de Real";
  }

  return finalStr;
}

const INITIAL_RECEIPTS: Receipt[] = [
  {
    id: 'rec-1',
    number: 'REC-2026-0001',
    budgetId: 'orc-1',
    clientId: 'cli-1',
    clientName: 'TechVanguard Consulting Ltda',
    clientDocument: '45.922.385/0001-90',
    value: 17200,
    valueInWords: 'Dezessete Mil e Duzentos Reais',
    date: '2026-06-05',
    paymentMethod: 'Pix',
    reference: 'Referente ao pagamento integral do Orçamento #orc-1 (Infraestrutura de Servidores Cloud).',
    status: 'PAGO',
    isSigned: true,
    signatureName: 'Avant It Financeiro'
  },
  {
    id: 'rec-2',
    number: 'REC-2026-0002',
    budgetId: 'orc-3',
    clientId: 'cli-2',
    clientName: 'Mariana Rodrigues Souza',
    clientDocument: '382.109.845-66',
    value: 1500,
    valueInWords: 'Um Mil e Quinhentos Reais',
    date: '2026-06-08',
    paymentMethod: 'Transferência',
    reference: 'Referente à parcela única do Orçamento #orc-3 (Materiais de Apoio e Cadeiras Ergonômicas).',
    status: 'PENDENTE',
    isSigned: false,
    signatureName: 'Avant It Financeiro'
  }
];

// Default Pre-seeded Mock Data
const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 'sup-1', nome: 'Kalunga Papelaria e Informática', cnpj: '14.537.498/0001-20', telefone: '(11) 3224-4000', email: 'vendas.corporativas@kalunga.com.br', setor: 'Escritório & Papelaria' },
  { id: 'sup-2', nome: 'Kabum Comércio Eletrônico S/A', cnpj: '81.243.735/0001-48', telefone: '(19) 2114-4040', email: 'faturamento@kabum.com.br', setor: 'Computação & TI' },
  { id: 'sup-3', nome: 'Intelbras S/A Telecomunicações', cnpj: '06.062.338/0001-29', telefone: '(48) 2106-0006', email: 'parceiros@intelbras.com.br', setor: 'Segurança & Redes' },
  { id: 'sup-4', nome: 'Leroy Merlin Construção & Reforma', cnpj: '01.438.784/0001-05', telefone: '(11) 4007-1380', email: 'vendas@leroymerlin.com.br', setor: 'Obras & Construção' },
  { id: 'sup-5', nome: 'Gerdau Distribuição de Aço S/A', cnpj: '16.516.326/0001-88', telefone: '(11) 3003-3400', email: 'comercial.metais@gerdau.com', setor: 'Ferragens & Estruturas' },
];

const INITIAL_CLIENTS: Client[] = [
  { id: 'cli-1', nome: 'TechVanguard Consulting Ltda', fantasia: 'TechVanguard', documento: '45.922.385/0001-90', telefone: '(11) 98765-4321', email: 'financeiro@techvanguard.co', logradouro: 'Avenida Paulista', numero: '2000', bairro: 'Bela Vista', cep: '01311-300', municipio: 'São Paulo', uf: 'SP', situacao: 'ATIVA', origem: 'Receita Federal' },
  { id: 'cli-2', nome: 'Mariana Rodrigues Souza', fantasia: 'Mari Souza Reis', documento: '382.109.845-66', telefone: '(21) 97123-4567', email: 'mariana.souza@outlook.com', logradouro: 'Rua das Flores', numero: '140', bairro: 'Copacabana', cep: '22010-000', municipio: 'Rio de Janeiro', uf: 'RJ', situacao: 'REGULAR', origem: 'Receita Federal' },
  { id: 'cli-3', nome: 'Construtora Alfa Brasil', fantasia: 'Alfa Obras', documento: '12.345.678/0001-00', telefone: '(31) 3456-7890', email: 'compras@alfabrasil.com', logradouro: 'Avenida Contorno', numero: '450', bairro: 'Savassi', cep: '30110-010', municipio: 'Belo Horizonte', uf: 'MG', situacao: 'ATIVA', origem: 'Digitado Manual' },
];

const INITIAL_BUDGETS: Budget[] = [
  {
    id: 'orc-1',
    title: 'Infraestrutura de Servidores Cloud',
    clientId: 'cli-1',
    status: 'APPROVED',
    createdDate: '2026-06-01',
    validityDate: '2026-06-20',
    category: 'Tecnologia',
    paymentTerms: 'Boleto bancário em até 3x sem juros após instalação',
    notes: 'Orçamento prioritário para homologação da nova filial.',
    discount: 1200,
    subtotal: 18400,
    total: 17200,
    items: [
      { id: 'it-1', name: 'Servidor Dedicado Core i9 128GB RAM', quantity: 2, price: 6500, supplierId: 'sup-2' },
      { id: 'it-2', name: 'Switches Gigabit Intelbras 24 Portas PoE', quantity: 3, price: 1800, supplierId: 'sup-3' }
    ]
  },
  {
    id: 'orc-2',
    title: 'Reforma Elétrica & Iluminação Galpão',
    clientId: 'cli-3',
    status: 'PENDING',
    createdDate: '2026-06-03',
    validityDate: '2026-06-30',
    category: 'Obras',
    paymentTerms: '50% sinal e 50% após entrega da medição final',
    notes: 'Materiais para revisão geral da iluminação do bloco industrial principal.',
    discount: 400,
    subtotal: 9400,
    total: 9000,
    items: [
      { id: 'it-3', name: 'Refletores LED Alta Potência Holofote 200W', quantity: 15, price: 240, supplierId: 'sup-4' },
      { id: 'it-4', name: 'Cabos de Cobre Estrutural Gerdau 50m', quantity: 10, price: 580, supplierId: 'sup-5' }
    ]
  },
  {
    id: 'orc-3',
    title: 'Materiais de Apoio e Cadeiras Ergonômicas',
    clientId: 'cli-2',
    status: 'APPROVED',
    createdDate: '2026-05-28',
    validityDate: '2026-06-12',
    category: 'Escritório',
    paymentTerms: 'Faturamento de 15 dias direto para PJ',
    notes: 'Ajustes posturais para funcionários de homeoffice corporativo.',
    discount: 50,
    subtotal: 1550,
    total: 1500,
    items: [
      { id: 'it-5', name: 'Papel Chamex A4 Caixa com 10 resmas', quantity: 5, price: 240, supplierId: 'sup-1' },
      { id: 'it-6', name: 'Cadeiras Ergonômicas Reguláveis NR17', quantity: 1, price: 350, supplierId: 'sup-1' }
    ]
  }
];

// Pure Utility Helpers Extracted Out of Component Scope
function generateUniqueId(prefix: string): string {
  if (typeof window !== 'undefined') {
    const randomPart = Math.random().toString(36).substring(2, 9);
    return `${prefix}-${randomPart}`;
  }
  return `${prefix}-static`;
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function getFutureDateString(daysOffset: number): string {
  const future = new Date();
  future.setDate(future.getDate() + daysOffset);
  return future.toISOString().split('T')[0];
}

export default function HomePage() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'budgets' | 'new-budget' | 'suppliers' | 'clients' | 'settings' | 'receipts' | 'categories'>('dashboard');

  // Receipts Core states
  const [receipts, setReceipts] = useState<Receipt[]>(INITIAL_RECEIPTS);
  const [printableReceipt, setPrintableReceipt] = useState<Receipt | null>(null);

  // New/Edit Receipt Form States
  const [newReceiptNumber, setNewReceiptNumber] = useState('');
  const [newReceiptBudgetId, setNewReceiptBudgetId] = useState('');
  const [newReceiptClientId, setNewReceiptClientId] = useState('');
  const [newReceiptClientName, setNewReceiptClientName] = useState('');
  const [newReceiptClientDocument, setNewReceiptClientDocument] = useState('');
  const [newReceiptValue, setNewReceiptValue] = useState<number>(0);
  const [newReceiptValueInWords, setNewReceiptValueInWords] = useState('');
  const [newReceiptDate, setNewReceiptDate] = useState(getTodayString());
  const [newReceiptPaymentMethod, setNewReceiptPaymentMethod] = useState('Pix');
  const [newReceiptReference, setNewReceiptReference] = useState('');
  const [newReceiptIsSigned, setNewReceiptIsSigned] = useState(true);
  const [newReceiptSignatureName, setNewReceiptSignatureName] = useState('Avant It Financeiro');
  const [newReceiptStatus, setNewReceiptStatus] = useState<'PAGO' | 'PENDENTE' | 'CANCELADO'>('PAGO');

  const [editingReceiptId, setEditingReceiptId] = useState<string | null>(null);
  const [receiptError, setReceiptError] = useState('');
  const [receiptSuccess, setReceiptSuccess] = useState(false);
  const [receiptSearchTerm, setReceiptSearchTerm] = useState('');

  // Company Information and Save feedback states
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(DEFAULT_COMPANY_INFO);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [logoDragging, setLogoDragging] = useState(false);

  // Budget categories settings states
  const [budgetCategories, setBudgetCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [newCategoryValue, setNewCategoryValue] = useState('');
  const [editingCategoryIdx, setEditingCategoryIdx] = useState<number | null>(null);
  const [editingCategoryValue, setEditingCategoryValue] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [categorySuccess, setCategorySuccess] = useState(false);

  // Core App States (loaded inside client-side useEffect to prevent SSR hydration mismatches)
  const [budgets, setBudgets] = useState<Budget[]>(INITIAL_BUDGETS);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);

  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [copiedClientId, setCopiedClientId] = useState<string | null>(null);

  const handleCopyClientDoc = (clientId: string, text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedClientId(clientId);
      setTimeout(() => {
        setCopiedClientId(null);
      }, 2000);
    }
  };

  const handleCreateReceiptForClient = (client: Client) => {
    setNewReceiptClientId(client.id);
    setNewReceiptClientName(client.nome);
    setNewReceiptClientDocument(client.documento);
    setNewReceiptValue(0);
    setNewReceiptValueInWords('');
    setNewReceiptBudgetId('');
    setNewReceiptReference(`Serviços prestados a ${client.nome}`);
    setEditingReceiptId('new');
    setActiveTab('receipts');
  };

  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);

  // Local PDF / Printable State
  const [printableBudget, setPrintableBudget] = useState<Budget | null>(null);

  // Client Search Form State
  const [searchDocValue, setSearchDocValue] = useState('');
  const [isSearchingClient, setIsSearchingClient] = useState(false);
  const [lookupMessage, setLookupMessage] = useState<{ type: 'success' | 'error' | ''; text: string }>({ type: '', text: '' });

  // Supplier & Client Add Modal / Form states
  const [newClient, setNewClient] = useState<Partial<Client>>({
    nome: '', fantasia: '', documento: '', telefone: '', email: '',
    logradouro: '', numero: '', bairro: '', cep: '', municipio: '', uf: '',
    situacao: 'REGULAR', origem: 'Digitado Manual'
  });
  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({
    nome: '', cnpj: '', telefone: '', email: '', setor: 'Geral'
  });

  // New Budget Form State
  const [budgetTitle, setBudgetTitle] = useState('');
  const [budgetCategory, setBudgetCategory] = useState('Tecnologia');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [budgetValidityDate, setBudgetValidityDate] = useState('');
  const [budgetNotes, setBudgetNotes] = useState('');
  const [budgetPaymentTerms, setBudgetPaymentTerms] = useState('');
  const [budgetDiscount, setBudgetDiscount] = useState<number>(0);
  const [budgetItems, setBudgetItems] = useState<Omit<Item, 'id'>[]>([
    { name: '', quantity: 1, price: 0, supplierId: '', tipo: 'Aquisição' }
  ]);

  // AI procurement recommendation states
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAnalysisResults, setAiAnalysisResults] = useState<any | null>(null);
  const [aiPromptTargetBudget, setAiPromptTargetBudget] = useState<Budget | null>(null);
  const [activeAiTab, setActiveAiTab] = useState<'insights' | 'suppliers' | 'whatsapp' | 'email'>('insights');

  // Search & Filter State inside list
  const [budgetSearchTerm, setBudgetSearchTerm] = useState('');
  const [budgetStatusFilter, setBudgetStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'CANCELED'>('ALL');

  // Custom Delete Confirmation state for iframe reliability
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    type: 'budget' | 'client' | 'supplier' | 'category' | 'receipt';
    id: string;
    title: string;
  } | null>(null);

  // Pure Persistence Initializer supporting initial hydration
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedBudgets = localStorage.getItem('smart_budgets');
        if (storedBudgets) {
          setBudgets(JSON.parse(storedBudgets));
        } else {
          localStorage.setItem('smart_budgets', JSON.stringify(INITIAL_BUDGETS));
        }

        const storedClients = localStorage.getItem('smart_clients');
        if (storedClients) {
          setClients(JSON.parse(storedClients));
        } else {
          localStorage.setItem('smart_clients', JSON.stringify(INITIAL_CLIENTS));
        }

        const storedSuppliers = localStorage.getItem('smart_suppliers');
        if (storedSuppliers) {
          setSuppliers(JSON.parse(storedSuppliers));
        } else {
          localStorage.setItem('smart_suppliers', JSON.stringify(INITIAL_SUPPLIERS));
        }

        const storedCompany = localStorage.getItem('smart_company_info');
        if (storedCompany) {
          setCompanyInfo(JSON.parse(storedCompany));
        } else {
          localStorage.setItem('smart_company_info', JSON.stringify(DEFAULT_COMPANY_INFO));
        }

        const storedCategories = localStorage.getItem('smart_budget_categories');
        if (storedCategories) {
          setBudgetCategories(JSON.parse(storedCategories));
        } else {
          localStorage.setItem('smart_budget_categories', JSON.stringify(DEFAULT_CATEGORIES));
        }

        const storedReceipts = localStorage.getItem('smart_receipts');
        if (storedReceipts) {
          setReceipts(JSON.parse(storedReceipts));
        } else {
          localStorage.setItem('smart_receipts', JSON.stringify(INITIAL_RECEIPTS));
        }
      } catch (e) {
        console.error('Failed to parse or populate fallback local storage', e);
      }
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Save changes to persistence
  const saveReceiptsToStorage = (updatedList: Receipt[]) => {
    setReceipts(updatedList);
    localStorage.setItem('smart_receipts', JSON.stringify(updatedList));
  };

  const saveCategoriesToStorage = (updatedCategories: string[]) => {
    setBudgetCategories(updatedCategories);
    localStorage.setItem('smart_budget_categories', JSON.stringify(updatedCategories));
  };

  const saveCompanyInfoToStorage = (updatedInfo: CompanyInfo) => {
    setCompanyInfo(updatedInfo);
    localStorage.setItem('smart_company_info', JSON.stringify(updatedInfo));
  };

  const saveBudgetsToStorage = (updatedList: Budget[]) => {
    setBudgets(updatedList);
    localStorage.setItem('smart_budgets', JSON.stringify(updatedList));
  };

  const saveClientsToStorage = (updatedList: Client[]) => {
    setClients(updatedList);
    localStorage.setItem('smart_clients', JSON.stringify(updatedList));
  };

  const saveSuppliersToStorage = (updatedList: Supplier[]) => {
    setSuppliers(updatedList);
    localStorage.setItem('smart_suppliers', JSON.stringify(updatedList));
  };

  // Client lookup search trigger
  const handleClientLookup = async () => {
    if (!searchDocValue.trim()) {
      setLookupMessage({ type: 'error', text: 'Insira um CPF ou CNPJ para buscar.' });
      return;
    }
    setLookupMessage({ type: '', text: '' });
    setIsSearchingClient(true);

    try {
      const response = await fetch('/api/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doc: searchDocValue })
      });

      const resData = await response.json();
      if (resData.success && resData.data) {
        const clientData = resData.data;
        
        // Auto populate client object in our partial form state
        setNewClient({
          nome: clientData.nome || '',
          fantasia: clientData.fantasia || clientData.nome || '',
          documento: clientData.documento || searchDocValue,
          telefone: clientData.telefone || '',
          email: clientData.email || '',
          logradouro: clientData.logradouro || '',
          numero: clientData.numero || '',
          bairro: clientData.bairro || '',
          cep: clientData.cep || '',
          municipio: clientData.municipio || '',
          uf: clientData.uf || '',
          situacao: clientData.situacao || 'ATIVA',
          origem: resData.source || 'Receita Federal'
        });

        // Set success notification
        setLookupMessage({ 
          type: 'success', 
          text: `Cliente localizado com sucesso via ${resData.source}!` 
        });
      } else {
        setLookupMessage({ 
          type: 'error', 
          text: resData.error || 'Não foi possível encontrar dados correspondentes para o CPF/CNPJ.' 
        });
      }
    } catch (err) {
      console.error(err);
      setLookupMessage({ 
        type: 'error', 
        text: 'Erro de comunicação de rede ao consular a base da Receita Federal.' 
      });
    } finally {
      setIsSearchingClient(false);
    }
  };

  // Create new Client manual or looked-up
  const handleAddClientAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.nome || !newClient.documento) {
      alert('Nome e Documento (CPF/CNPJ) são campos obrigatórios.');
      return;
    }

    if (editingClientId) {
      // Edit mode
      const updatedList = clients.map(c => {
        if (c.id === editingClientId) {
          return {
            ...c,
            nome: newClient.nome || '',
            fantasia: newClient.fantasia || newClient.nome || '',
            documento: newClient.documento || '',
            telefone: newClient.telefone || '',
            email: newClient.email || '',
            logradouro: newClient.logradouro || '',
            numero: newClient.numero || '',
            bairro: newClient.bairro || '',
            cep: newClient.cep || '',
            municipio: newClient.municipio || '',
            uf: newClient.uf || '',
            situacao: newClient.situacao || 'ATIVA',
            origem: newClient.origem || 'Digitado Manual'
          };
        }
        return c;
      });
      saveClientsToStorage(updatedList);
      setEditingClientId(null);
      alert('Cadastro do cliente atualizado com sucesso!');
    } else {
      // Creation mode
      const createdClient: Client = {
        id: generateUniqueId('cli'),
        nome: newClient.nome || '',
        fantasia: newClient.fantasia || newClient.nome || '',
        documento: newClient.documento || '',
        telefone: newClient.telefone || '',
        email: newClient.email || '',
        logradouro: newClient.logradouro || '',
        numero: newClient.numero || '',
        bairro: newClient.bairro || '',
        cep: newClient.cep || '',
        municipio: newClient.municipio || '',
        uf: newClient.uf || '',
        situacao: newClient.situacao || 'REGULAR',
        origem: newClient.origem || 'Digitado Manual'
      };

      const nextList = [createdClient, ...clients];
      saveClientsToStorage(nextList);
      setSelectedClientId(createdClient.id);
      alert('Cliente cadastrado e integrado com sucesso!');
    }

    // Clear client form
    setNewClient({
      nome: '', fantasia: '', documento: '', telefone: '', email: '',
      logradouro: '', numero: '', bairro: '', cep: '', municipio: '', uf: '',
      situacao: 'REGULAR', origem: 'Digitado Manual'
    });
    setSearchDocValue('');
    setLookupMessage({ type: '', text: '' });
  };

  // Add Custom Supplier manual
  const handleAddSupplierAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplier.nome || !newSupplier.cnpj) {
      alert('Nome e CNPJ do fornecedor são dados obrigatórios.');
      return;
    }

    const createdSupplier: Supplier = {
      id: generateUniqueId('sup'),
      nome: newSupplier.nome || '',
      cnpj: newSupplier.cnpj || '',
      telefone: newSupplier.telefone || '',
      email: newSupplier.email || '',
      setor: newSupplier.setor || 'Outros'
    };

    const nextList = [createdSupplier, ...suppliers];
    saveSuppliersToStorage(nextList);

    // Clear form
    setNewSupplier({ nome: '', cnpj: '', telefone: '', email: '', setor: 'Geral' });
    alert('Fornecedor registrado na cadeia de parceiros!');
  };

  // Delete Handlers
  const handleDeleteBudget = (id: string, budgetTitle: string) => {
    setDeleteConfirmTarget({ type: 'budget', id, title: budgetTitle });
  };

  const handleDeleteClient = (id: string, name: string) => {
    setDeleteConfirmTarget({ type: 'client', id, title: name });
  };

  const handleDeleteSupplier = (id: string, name: string) => {
    setDeleteConfirmTarget({ type: 'supplier', id, title: name });
  };

  const executeConfirmedDelete = () => {
    if (!deleteConfirmTarget) return;
    const { type, id } = deleteConfirmTarget;
    if (type === 'budget') {
      const nextList = budgets.filter(b => b.id !== id);
      saveBudgetsToStorage(nextList);
    } else if (type === 'client') {
      const nextList = clients.filter(c => c.id !== id);
      saveClientsToStorage(nextList);
    } else if (type === 'supplier') {
      const nextList = suppliers.filter(s => s.id !== id);
      saveSuppliersToStorage(nextList);
    } else if (type === 'category') {
      const catToDelete = id;
      const companionCategories = budgetCategories.filter(c => c !== catToDelete);
      const fallbackCategory = companionCategories.includes('Outros') ? 'Outros' : (companionCategories[0] || 'Outros');

      // Reclassify budgets in deleted category
      const updatedBudgets = budgets.map(b => {
        if (b.category === catToDelete) {
          return { ...b, category: fallbackCategory };
        }
        return b;
      });

      saveCategoriesToStorage(companionCategories);
      saveBudgetsToStorage(updatedBudgets);

      // If active new budget category was the deleted one, change it
      if (budgetCategory === catToDelete) {
        setBudgetCategory(fallbackCategory);
      }

      setCategoryError('');
      setCategorySuccess(true);
      setTimeout(() => setCategorySuccess(false), 3500);
    } else if (type === 'receipt') {
      const nextList = receipts.filter(r => r.id !== id);
      saveReceiptsToStorage(nextList);
      setReceiptSuccess(true);
      setTimeout(() => setReceiptSuccess(false), 3000);
    }
    setDeleteConfirmTarget(null);
  };

  const handleAddCategory = () => {
    const trimmed = newCategoryValue.trim();
    if (!trimmed) {
      setCategoryError('O nome da categoria não pode ser vazio.');
      return;
    }
    if (budgetCategories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      setCategoryError('Esta categoria já existe.');
      return;
    }
    const updated = [...budgetCategories, trimmed];
    saveCategoriesToStorage(updated);
    setNewCategoryValue('');
    setCategoryError('');
    setCategorySuccess(true);
    setTimeout(() => setCategorySuccess(false), 3500);
  };

  const handleSaveEditCategory = (idx: number) => {
    const oldName = budgetCategories[idx];
    const trimmedName = editingCategoryValue.trim();
    if (!trimmedName) {
      setCategoryError('O nome da categoria não pode ser vazio.');
      return;
    }
    if (trimmedName.toLowerCase() === oldName.toLowerCase()) {
      setEditingCategoryIdx(null);
      return;
    }
    if (budgetCategories.some((c, i) => i !== idx && c.toLowerCase() === trimmedName.toLowerCase())) {
      setCategoryError('Outra categoria já possui este nome.');
      return;
    }

    const updated = [...budgetCategories];
    updated[idx] = trimmedName;

    // Update existing budgets using old category name too
    const updatedBudgets = budgets.map(b => {
      if (b.category === oldName) {
        return { ...b, category: trimmedName };
      }
      return b;
    });

    saveCategoriesToStorage(updated);
    saveBudgetsToStorage(updatedBudgets);

    setEditingCategoryIdx(null);
    setCategoryError('');
    setCategorySuccess(true);
    setTimeout(() => setCategorySuccess(false), 3500);
  };

  const handleDeleteCategoryRequest = (cat: string) => {
    if (budgetCategories.length <= 1) {
      setCategoryError('O sistema precisa de pelo menos uma categoria ativa.');
      return;
    }
    setDeleteConfirmTarget({
      type: 'category',
      id: cat,
      title: cat
    });
  };

  // Receipts Handlers
  const handleResetReceiptForm = () => {
    // Generate consecutive receipt number
    const nextNum = `REC-${new Date().getFullYear()}-${String(receipts.length + 1).padStart(4, '0')}`;
    setNewReceiptNumber(nextNum);
    setNewReceiptBudgetId('');
    setNewReceiptClientId('');
    setNewReceiptClientName('');
    setNewReceiptClientDocument('');
    setNewReceiptValue(0);
    setNewReceiptValueInWords('');
    setNewReceiptDate(getTodayString());
    setNewReceiptPaymentMethod('Pix');
    setNewReceiptReference('');
    setNewReceiptIsSigned(true);
    setNewReceiptSignatureName('Avant It Financeiro');
    setNewReceiptStatus('PAGO');
    setEditingReceiptId(null);
    setReceiptError('');
  };

  const handlePrintReceiptTrigger = (receipt: Receipt) => {
    setPrintableReceipt(receipt);
    setTimeout(() => {
      window.print();
    }, 450);
  };

  const handleSelectReceiptBudget = (bId: string) => {
    setNewReceiptBudgetId(bId);
    if (!bId) {
      // Clear values if cleared
      setNewReceiptValue(0);
      setNewReceiptValueInWords('');
      setNewReceiptReference('');
      return;
    }

    const selectedBudget = budgets.find(b => b.id === bId);
    if (selectedBudget) {
      setNewReceiptValue(selectedBudget.total);
      setNewReceiptValueInWords(valorPorExtenso(selectedBudget.total));
      setNewReceiptReference(`Referente integral ao pagamento do Orçamento #${selectedBudget.id} (${selectedBudget.title}).`);
      
      const client = clients.find(c => c.id === selectedBudget.clientId);
      if (client) {
        setNewReceiptClientId(client.id);
        setNewReceiptClientName(client.nome);
        setNewReceiptClientDocument(client.documento);
      }
    }
  };

  const handleSelectReceiptClient = (cId: string) => {
    setNewReceiptClientId(cId);
    if (!cId) {
      setNewReceiptClientName('');
      setNewReceiptClientDocument('');
      return;
    }

    const client = clients.find(c => c.id === cId);
    if (client) {
      setNewReceiptClientName(client.nome);
      setNewReceiptClientDocument(client.documento);
    }
  };

  const handleSaveReceipt = () => {
    setReceiptError('');
    if (!newReceiptClientName.trim()) {
      setReceiptError('O nome do cliente/pagador é obrigatório.');
      return;
    }
    if (newReceiptValue <= 0) {
      setReceiptError('O valor do recibo deve ser maior que zero.');
      return;
    }
    if (!newReceiptValueInWords.trim()) {
      setReceiptError('O valor por extenso é obrigatório.');
      return;
    }

    const payload: Receipt = {
      id: editingReceiptId || generateUniqueId('rec'),
      number: newReceiptNumber || `REC-${new Date().getFullYear()}-${String(receipts.length + 1).padStart(4, '0')}`,
      budgetId: newReceiptBudgetId || undefined,
      clientId: newReceiptClientId || undefined,
      clientName: newReceiptClientName.trim(),
      clientDocument: newReceiptClientDocument.trim(),
      value: newReceiptValue,
      valueInWords: newReceiptValueInWords.trim(),
      date: newReceiptDate || getTodayString(),
      paymentMethod: newReceiptPaymentMethod,
      reference: newReceiptReference.trim() || 'Serviços/Equipamentos prestados.',
      status: newReceiptStatus,
      isSigned: newReceiptIsSigned,
      signatureName: newReceiptSignatureName.trim() || 'Avant It Financeiro'
    };

    let nextList: Receipt[] = [];
    if (editingReceiptId) {
      nextList = receipts.map(r => r.id === editingReceiptId ? payload : r);
    } else {
      nextList = [...receipts, payload];
    }

    saveReceiptsToStorage(nextList);
    setReceiptSuccess(true);
    setTimeout(() => setReceiptSuccess(false), 3000);
    setActiveTab('receipts');
    handleResetReceiptForm();
  };

  const handleEditReceiptRequest = (r: Receipt) => {
    setEditingReceiptId(r.id);
    setNewReceiptNumber(r.number);
    setNewReceiptBudgetId(r.budgetId || '');
    setNewReceiptClientId(r.clientId || '');
    setNewReceiptClientName(r.clientName);
    setNewReceiptClientDocument(r.clientDocument);
    setNewReceiptValue(r.value);
    setNewReceiptValueInWords(r.valueInWords);
    setNewReceiptDate(r.date);
    setNewReceiptPaymentMethod(r.paymentMethod);
    setNewReceiptReference(r.reference);
    setNewReceiptIsSigned(r.isSigned);
    setNewReceiptSignatureName(r.signatureName);
    setNewReceiptStatus(r.status);
    setReceiptError('');
  };

  const handleDeleteReceiptRequest = (r: Receipt) => {
    setDeleteConfirmTarget({
      type: 'receipt',
      id: r.id,
      title: `${r.number} - ${r.clientName}`
    });
  };

  const handleResetBudgetForm = () => {
    setEditingBudgetId(null);
    setBudgetTitle('');
    setSelectedClientId('');
    setBudgetValidityDate('');
    setBudgetNotes('');
    setBudgetPaymentTerms('');
    setBudgetDiscount(0);
    setBudgetItems([{ name: '', quantity: 1, price: 0, supplierId: '', tipo: 'Aquisição' }]);
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudgetId(budget.id);
    setBudgetTitle(budget.title);
    setSelectedClientId(budget.clientId);
    setBudgetValidityDate(budget.validityDate);
    setBudgetNotes(budget.notes || '');
    setBudgetPaymentTerms(budget.paymentTerms || '');
    setBudgetDiscount(budget.discount || 0);
    setBudgetCategory(budget.category || 'Tecnologia');
    
    // items mapping without id conflicts
    setBudgetItems(budget.items.map(it => ({
      name: it.name,
      quantity: it.quantity,
      price: it.price,
      supplierId: it.supplierId || '',
      tipo: it.tipo || 'Aquisição'
    })));

    setActiveTab('new-budget');
  };

  // Create Budget item handlers
  const handleBudgetAddItemLine = () => {
    setBudgetItems([...budgetItems, { name: '', quantity: 1, price: 0, supplierId: '', tipo: 'Aquisição' }]);
  };

  const handleBudgetRemoveItemLine = (idx: number) => {
    if (budgetItems.length === 1) return;
    const nextItems = [...budgetItems];
    nextItems.splice(idx, 1);
    setBudgetItems(nextItems);
  };

  const handleBudgetItemFieldChange = (idx: number, field: keyof Omit<Item, 'id'>, value: any) => {
    const nextItems = [...budgetItems];
    nextItems[idx] = {
      ...nextItems[idx],
      [field]: value
    };
    setBudgetItems(nextItems);
  };

  // Live total helpers for active budget form
  const computedFormSubtotal = budgetItems.reduce((acc, it) => acc + (Number(it.quantity) * Number(it.price || 0)), 0);
  const computedFormTotal = Math.max(0, computedFormSubtotal - Number(budgetDiscount || 0));

  // Saving or Editing a Budget
  const handleSaveNewBudgetAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetTitle.trim()) {
      alert('Por favor, informe o título descritivo do orçamento.');
      return;
    }
    if (!selectedClientId) {
      alert('Por favor, selecione ou cadastre um cliente parceiro.');
      return;
    }
    if (budgetItems.some(it => !it.name.trim() || !it.price)) {
      alert('Preencha os dados de nome e valor em todos os itens adicionados.');
      return;
    }

    const compiledItems: Item[] = budgetItems.map((it, index) => ({
      id: generateUniqueId(`it-compiled-${index}`),
      name: it.name,
      quantity: Number(it.quantity || 1),
      price: Number(it.price || 0),
      supplierId: it.supplierId,
      tipo: it.tipo || 'Aquisição'
    }));

    const editingMode = !!editingBudgetId;
    const completeBudget: Budget = {
      id: editingMode ? editingBudgetId : generateUniqueId('orc'),
      title: budgetTitle,
      clientId: selectedClientId,
      status: editingMode ? (budgets.find(b => b.id === editingBudgetId)?.status || 'PENDING') : 'PENDING',
      createdDate: editingMode ? (budgets.find(b => b.id === editingBudgetId)?.createdDate || getTodayString()) : getTodayString(),
      validityDate: budgetValidityDate || getFutureDateString(15),
      category: budgetCategory,
      notes: budgetNotes,
      paymentTerms: budgetPaymentTerms || 'À vista com faturamento flexível',
      discount: Number(budgetDiscount || 0),
      subtotal: computedFormSubtotal,
      total: computedFormTotal,
      items: compiledItems
    };

    if (editingMode) {
      const nextList = budgets.map(b => b.id === editingBudgetId ? completeBudget : b);
      saveBudgetsToStorage(nextList);
    } else {
      saveBudgetsToStorage([completeBudget, ...budgets]);
    }

    // Reset Form Fields
    handleResetBudgetForm();

    // Jump to list
    setActiveTab('budgets');
    alert(editingMode ? 'Orçamento atualizado e integrado com sucesso ao painel financeiro!' : 'Orçamento cadastrado e integrado com sucesso ao painel financeiro!');
  };

  // Toggle budget status directly
  const handleChangeStatus = (id: string, nextStatus: 'PENDING' | 'APPROVED' | 'CANCELED') => {
    const nextList = budgets.map(b => {
      if (b.id === id) {
        return { ...b, status: nextStatus };
      }
      return b;
    });
    saveBudgetsToStorage(nextList);
  };

  // AI procurement recommendation launcher
  const handleLaunchAiProcurement = async (budget: Budget) => {
    setAiPromptTargetBudget(budget);
    setAiAnalysisResults(null);
    setIsAiLoading(true);
    
    // Auto find client name
    const clientRecord = clients.find(c => c.id === budget.clientId);
    const clientName = clientRecord ? clientRecord.nome : 'Cliente Desconhecido';

    try {
      const response = await fetch('/api/quote-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: budget.items,
          title: budget.title,
          clientName: clientName
        })
      });

      const resData = await response.json();
      if (resData.success && resData.analysis) {
        setAiAnalysisResults(resData.analysis);
      } else {
        alert(resData.error || 'Não foi possível gerar análise estruturada no momento.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão ao acessar a inteligência fiscal Avant It System.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Trigger Print View
  const handlePrintTrigger = (budget: Budget) => {
    setPrintableBudget(budget);
    // Timeout to make sure render occurs, then window.print()
    setTimeout(() => {
      window.print();
    }, 400);
  };

  // Analytical computation in real time
  const totalPipeline = budgets.reduce((acc, b) => acc + b.total, 0);
  const totalApproved = budgets.filter(b => b.status === 'APPROVED').reduce((acc, b) => acc + b.total, 0);
  const totalPending = budgets.filter(b => b.status === 'PENDING').reduce((acc, b) => acc + b.total, 0);
  
  // Conversion approval rate
  const approvedCount = budgets.filter(b => b.status === 'APPROVED').length;
  const activeCount = budgets.filter(b => b.status !== 'CANCELED').length;
  const approvalRate = activeCount > 0 ? Math.round((approvedCount / activeCount) * 100) : 0;

  // Monthly Pipeline custom SVG computational variables
  // Since we seed with 3 budgets from May and June, let's create a realistic breakdown
  const monthlyData = [
    { month: 'Mar', value: 34000 },
    { month: 'Abr', value: 41000 },
    { month: 'Mai', value: 25000 },
    { month: 'Jun (Atual)', value: totalPipeline }
  ];
  const maxMonthValue = Math.max(...monthlyData.map(d => d.value), 45000);

  // Supplier allocation breakdown
  const supplierContributionMap: { [name: string]: number } = {};
  budgets.forEach(b => {
    b.items.forEach(it => {
      const sup = suppliers.find(s => s.id === it.supplierId);
      const name = sup ? sup.nome : 'Outros / Direto';
      supplierContributionMap[name] = (supplierContributionMap[name] || 0) + (it.price * it.quantity);
    });
  });

  const supplierDataList = Object.keys(supplierContributionMap).map(key => ({
    name: key.length > 25 ? key.substring(0, 22) + '...' : key,
    value: supplierContributionMap[key]
  })).sort((a, b) => b.value - a.value);

  // Filtering for Budgets view
  const filteredBudgetsList = budgets.filter(b => {
    const clientObj = clients.find(c => c.id === b.clientId);
    const clientNameStr = clientObj ? clientObj.nome.toLowerCase() : '';
    const titleMatch = b.title.toLowerCase().includes(budgetSearchTerm.toLowerCase());
    const clientMatch = clientNameStr.includes(budgetSearchTerm.toLowerCase());
    const categoryMatch = b.category.toLowerCase().includes(budgetSearchTerm.toLowerCase());
    
    const matcher = titleMatch || clientMatch || categoryMatch;
    
    if (budgetStatusFilter === 'ALL') return matcher;
    return matcher && b.status === budgetStatusFilter;
  });

  return (
    <div id="smart_quote_root_wrapper" className="min-h-screen bg-[#f8fafc] font-sans text-slate-800 antialiased flex flex-col selection:bg-blue-600/10 selection:text-blue-700">
      
      {/* Top Professional Navigation Brand Rail */}
      <header id="nav_top_rail" className="sticky top-0 z-40 w-full border-b border-slate-200/65 bg-white/80 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.01)] print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-slate-900 to-blue-900 rounded-xl flex items-center justify-center shadow-md shadow-blue-900/10 transition-all duration-300 hover:scale-[1.03]">
              <Sparkles className="h-5 w-5 text-blue-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-[17px] font-black tracking-tight text-slate-900 leading-tight">Avant It System</h1>
              <p className="text-[9.5px] font-mono tracking-widest uppercase text-blue-600 font-extrabold flex items-center gap-1 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-ping"></span>
                <span>orçamentos & fornecedores</span>
              </p>
            </div>
          </div>



        </div>
      </header>

      {/* Main Container Layout */}
      <main id="main_dashboard_body" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7 flex flex-col lg:flex-row gap-6 print:p-0">
        
        {/* Navigation Sidebar Drawer */}
        <aside id="nav_menu_sidebar" className="w-full lg:w-64 shrink-0 flex flex-col space-y-1.5 bg-white p-4.5 rounded-2xl border border-slate-200/85 shadow-[0_8px_30px_rgb(0,0,0,0.02)] print:hidden">
          <p className="text-[9.5px] font-bold tracking-widest text-slate-400 uppercase px-3 py-1.5">Módulos Principais</p>
          
          <button 
            id="btn_tab_dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 text-left cursor-pointer",
              activeTab === 'dashboard' 
                ? "bg-slate-900 text-white shadow-md shadow-slate-900/10 border border-slate-850" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-0.5"
            )}
          >
            <TrendingUp className="h-4 w-4 shrink-0" />
            <span>Dashboard</span>
          </button>

          <button 
            id="btn_tab_budgets"
            onClick={() => setActiveTab('budgets')}
            className={cn(
              "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 text-left cursor-pointer",
              activeTab === 'budgets' 
                ? "bg-slate-900 text-white shadow-md shadow-slate-900/10 border border-slate-850" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-0.5"
            )}
          >
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 shrink-0" />
              <span>Orçamentos Salvos</span>
            </div>
            <span className={cn(
              "text-[9.5px] px-2 py-0.5 rounded-md font-mono font-bold border",
              activeTab === 'budgets'
                ? "bg-slate-800 text-blue-300 border-slate-700"
                : "bg-slate-50 text-slate-600 border-slate-200"
            )}>
              {budgets.length}
            </span>
          </button>

          <button 
            id="btn_tab_new_budget"
            onClick={() => {
              handleResetBudgetForm();
              setActiveTab('new-budget');
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 text-left cursor-pointer",
              activeTab === 'new-budget' 
                ? "bg-slate-900 text-white shadow-md shadow-slate-900/10 border border-slate-850" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-0.5"
            )}
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span>Novo Orçamento</span>
          </button>

          <button 
            id="btn_tab_receipts"
            onClick={() => setActiveTab('receipts')}
            className={cn(
              "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 text-left cursor-pointer",
              activeTab === 'receipts' 
                ? "bg-slate-900 text-white shadow-md shadow-slate-900/10 border border-slate-850" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-0.5"
            )}
          >
            <div className="flex items-center gap-3">
              <Receipt className="h-4 w-4 shrink-0" />
              <span>Gestão de Recibos</span>
            </div>
            <span className={cn(
              "text-[9.5px] px-2 py-0.5 rounded-md font-mono font-bold border",
              activeTab === 'receipts'
                ? "bg-slate-800 text-blue-300 border-slate-700"
                : "bg-slate-50 text-slate-600 border-slate-200"
            )}>
              {receipts.length}
            </span>
          </button>

          <div className="h-px bg-slate-100 my-2" />

          <p className="text-[9.5px] font-bold tracking-widest text-slate-400 uppercase px-3 py-1.5">Integrações e Clientes</p>

          <button 
            id="btn_tab_suppliers"
            onClick={() => setActiveTab('suppliers')}
            className={cn(
              "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 text-left cursor-pointer",
              activeTab === 'suppliers' 
                ? "bg-slate-900 text-white shadow-md shadow-slate-900/10 border border-slate-850" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-0.5"
            )}
          >
            <Building2 className="h-4 w-4 shrink-0" />
            <span>Fornecedores</span>
          </button>

          <button 
            id="btn_tab_clients"
            onClick={() => setActiveTab('clients')}
            className={cn(
              "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 text-left cursor-pointer",
              activeTab === 'clients' 
                ? "bg-slate-900 text-white shadow-md shadow-slate-900/10 border border-slate-850" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-0.5"
            )}
          >
            <Users className="h-4 w-4 shrink-0" />
            <span>Banco de Clientes (RF)</span>
          </button>

          <div className="h-px bg-slate-100 my-2" />

          <p className="text-[9.5px] font-bold tracking-widest text-slate-400 uppercase px-3 py-1.5">Ajustes da Empresa</p>

          <button 
            id="btn_tab_settings"
            onClick={() => setActiveTab('settings')}
            className={cn(
              "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 text-left cursor-pointer",
              activeTab === 'settings' 
                ? "bg-slate-900 text-white shadow-md shadow-slate-900/10 border border-slate-850" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-0.5"
            )}
          >
            <Settings className="h-4 w-4 shrink-0 animate-spin-slow" />
            <span>Dados da Empresa</span>
          </button>

          <button 
            id="btn_tab_categories"
            onClick={() => setActiveTab('categories')}
            className={cn(
              "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 text-left cursor-pointer",
              activeTab === 'categories' 
                ? "bg-slate-900 text-white shadow-md shadow-slate-900/10 border border-slate-850" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <div className="flex items-center gap-3">
              <Tag className="h-4 w-4 shrink-0 text-slate-500" />
              <span>Categorias de Orçamento</span>
            </div>
            <span className={cn(
              "text-[9.5px] px-2 py-0.5 rounded-md font-mono font-bold border",
              activeTab === 'categories'
                ? "bg-slate-800 text-blue-300 border-slate-700"
                : "bg-slate-50 text-slate-600 border-slate-200"
            )}>
              {budgetCategories.length}
            </span>
          </button>

          <div className="flex-1 min-h-[30px]" />
          
          <div className="p-4 bg-gradient-to-br from-slate-950 to-slate-900 rounded-2xl text-white text-xs mt-auto border border-slate-850 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Sparkles className="h-16 w-16" />
            </div>
            <p className="font-bold mb-1 flex items-center gap-1.5 text-blue-400">
              <Sparkles className="h-3.5 w-3.5 text-blue-400 animate-pulse" />
              <span className="tracking-wide">Motor Inteligente</span>
            </p>
            <p className="text-slate-400 leading-normal text-[10.5px] mb-3">
              Pesquise dados cadastrais oficiais e genere orçamentos otimizados com inteligência artificial recomendadora.
            </p>
            <div className="w-full bg-slate-800 h-1 rounded-full mb-1">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 w-4/5 h-1 rounded-full"></div>
            </div>
            <p className="text-[9px] text-slate-500 font-mono">Status Operacional • v3.5-Flash</p>
          </div>
        </aside>

        {/* Action Center - Main Section Component */}
        <section id="module_action_panel" className="flex-1 flex flex-col min-w-0 print:p-0">
          
          <AnimatePresence mode="wait">
            
            {/* TAB 1: EXECUTIVE ANALYTICS DASHBOARD */}
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard_tab"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                {/* Visual Banner Welcome */}
                <div id="dashboard_greeting_banner" className="relative overflow-hidden bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-7 border border-slate-850 shadow-[0_12px_36px_rgba(15,23,42,0.06)]">
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none scale-150">
                    <Sparkles className="h-24 w-24 text-blue-400" />
                  </div>
                  <div className="relative z-10 max-w-xl space-y-1">
                    <div className="inline-flex items-center gap-1.5 text-[9.5px] font-bold font-mono uppercase tracking-widest bg-blue-500/10 border border-blue-500/25 px-2.5 py-1 rounded-full text-blue-300">
                      <Sparkles className="h-3 w-3 text-blue-300" />
                      <span>Executive Smart Room v4.2</span>
                    </div>
                    <h2 className="text-2xl font-black tracking-tight pt-2 text-white">Estatísticas Financeiras Integradas</h2>
                    <p className="text-xs text-slate-300/85 leading-relaxed pt-1.5">
                      Painel estratégico gerencial alimentado em tempo real com distribuição de faturamento por fornecedores, pipelines estipulados e estimativas de controle financeiro.
                    </p>
                  </div>
                  {/* Subtle decorative mesh overlay line */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.04),transparent)] pointer-events-none" />
                </div>

                {/* KPI Metrics Widgets Row */}
                <div id="stat_metrics_row" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  {/* Total Pipeline value */}
                  <div id="metric_card_total_pipeline" className="group bg-white p-5 rounded-2xl border border-slate-200/75 shadow-[0_4px_24px_rgba(0,0,0,0.015)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.025)] hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[3px] bg-slate-200 group-hover:bg-blue-600 transition-colors" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Pipeline Estipulado</p>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                      R$ {totalPipeline.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </h3>
                    <p className="text-[11px] text-slate-450 mt-2.5 font-medium flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                      <span>{budgets.length} Propostas registradas</span>
                    </p>
                  </div>

                  {/* Total Approved Value */}
                  <div id="metric_card_approved" className="group bg-white p-5 rounded-2xl border border-slate-200/75 shadow-[0_4px_24px_rgba(0,0,0,0.015)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.025)] hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[3px] bg-slate-200 group-hover:bg-emerald-500 transition-colors" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Faturamento Aprovado</p>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                      R$ {totalApproved.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </h3>
                    <p className="text-[11px] text-emerald-600 mt-2.5 font-bold flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>▲ {approvalRate}% de aproveitamento comercial</span>
                    </p>
                  </div>

                  {/* Pending Pipeline value */}
                  <div id="metric_card_pending" className="group bg-white p-5 rounded-2xl border border-slate-200/75 shadow-[0_4px_24px_rgba(0,0,0,0.015)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.025)] hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[3px] bg-slate-200 group-hover:bg-amber-500 transition-colors" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Pipeline Pendente</p>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                      R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </h3>
                    <p className="text-[11px] text-amber-600 mt-2.5 font-semibold flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                      <span>Volume em negociação direta</span>
                    </p>
                  </div>

                  {/* Approvation percentage meter */}
                  <div id="metric_card_approval_rate" className="group bg-white p-5 rounded-2xl border border-slate-200/75 shadow-[0_4px_24px_rgba(0,0,0,0.015)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.025)] hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[3px] bg-slate-200 group-hover:bg-indigo-600 transition-colors" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Conversão Total</p>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                      {approvalRate}%
                    </h3>
                    <p className="text-[11px] text-indigo-600 mt-2.5 font-bold flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                      <span>Sincronia constante IA</span>
                    </p>
                  </div>

                </div>

                <div id="dashboard_graphs_bento" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* 1. Monthly Timeline Pipeline SVG Chart */}
                  <div id="panel_timeline_chart" className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm lg:col-span-7 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 tracking-tight">Timeline do Pipeline de Vendas (R$)</h4>
                      <p className="text-xs text-slate-500 mb-6">Volume total gerado de propostas nos últimos 4 meses</p>
                    </div>

                    {/* SVG Render chart area */}
                    <div className="h-48 w-full flex items-end">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200">
                        {/* Horizontal Background lines */}
                        <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1.5" strokeDasharray="3,3" />
                        <line x1="40" y1="70" x2="480" y2="70" stroke="#f1f5f9" strokeWidth="1.5" strokeDasharray="3,3" />
                        <line x1="40" y1="120" x2="480" y2="120" stroke="#f1f5f9" strokeWidth="1.5" strokeDasharray="3,3" />
                        <line x1="40" y1="170" x2="480" y2="170" stroke="#cbd5e1" strokeWidth="1.5" />

                        {/* Y-Axis Label values */}
                        <text x="5" y="24" className="text-[9px] font-mono fill-slate-400" textAnchor="start">40k</text>
                        <text x="5" y="74" className="text-[9px] font-mono fill-slate-400" textAnchor="start">25k</text>
                        <text x="5" y="124" className="text-[9px] font-mono fill-slate-400" textAnchor="start">10k</text>
                        <text x="5" y="174" className="text-[9px] font-mono fill-slate-400" textAnchor="start">0</text>

                        {/* Data Points Plotting */}
                        {/* Normalized Y coordinates: mapped from 0 -> maxMonthValue to 170 -> 20 */}
                        {monthlyData.map((d, i) => {
                          const x = 70 + i * 125;
                          const y = 170 - (d.value / maxMonthValue) * 140;
                          return (
                            <g key={i}>
                              {/* Clean Blue Circle Point */}
                              <circle cx={x} cy={y} r="6" className="fill-blue-600 stroke-white stroke-2 shadow-xs" />
                              <circle cx={x} cy={y} r="10" className="stroke-blue-200 stroke-1 fill-none" />
                              
                              {/* Value Label */}
                              <text x={x} y={y - 12} className="text-[10px] font-mono font-bold fill-slate-700" textAnchor="middle">
                                R$ {(d.value / 1000).toFixed(1)}k
                              </text>
                              {/* Month Label */}
                              <text x={x} y="192" className="text-[10px] font-mono fill-slate-500" textAnchor="middle">{d.month}</text>
                            </g>
                          );
                        })}

                        {/* Connection Line Path */}
                        {(() => {
                          let path = "";
                          monthlyData.forEach((d, i) => {
                            const x = 70 + i * 125;
                            const y = 170 - (d.value / maxMonthValue) * 140;
                            if (i === 0) path += `M ${x} ${y}`;
                            else path += ` L ${x} ${y}`;
                          });
                          return (
                            <path d={path} fill="none" stroke="url(#lineGrad)" strokeWidth="3.5" strokeLinecap="round" />
                          );
                        })()}

                        {/* Chart Area Fill Gradient */}
                        {(() => {
                          let path = "";
                          monthlyData.forEach((d, i) => {
                            const x = 70 + i * 125;
                            const y = 170 - (d.value / maxMonthValue) * 140;
                            if (i === 0) path += `M ${x} 170 L ${x} ${y}`;
                            else path += ` L ${x} ${y}`;
                            if (i === monthlyData.length - 1) path += ` L ${x} 170 Z`;
                          });
                          return (
                            <path d={path} fill="url(#areaGrad)" opacity="0.12" />
                          );
                        })()}

                        <defs>
                          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#2563eb" />
                            <stop offset="100%" stopColor="#0ea5e9" />
                          </linearGradient>
                          <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#ffffff" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>

                  {/* 2. Supplier share of faturamento SVG Bar Chart */}
                  <div id="panel_supplier_chart" className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm lg:col-span-5 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 tracking-tight">Participação de Fornecedores</h4>
                      <p className="text-xs text-slate-500 mb-4">Volume monetário estipulado canalizado por parceiro</p>
                    </div>

                    <div className="space-y-4 flex-1 flex flex-col justify-center">
                      {supplierDataList.length === 0 ? (
                        <div className="text-center py-6">
                          <Info className="h-6 w-6 text-slate-300 mx-auto mb-2" />
                          <p className="text-xs text-slate-500">Cadastre budgets com itens para visualizar a alocação</p>
                        </div>
                      ) : (
                        supplierDataList.slice(0, 4).map((item, index) => {
                          const maxVal = Math.max(...supplierDataList.map(v => v.value), 1);
                          const percentage = Math.round((item.value / maxVal) * 100);
                          return (
                            <div key={index} className="space-y-1">
                              <div className="flex items-center justify-between text-xs text-slate-700">
                                <span className="font-medium truncate max-w-[180px]">{item.name}</span>
                                <span className="font-mono font-bold">R$ {item.value.toLocaleString('pt-BR')}</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                                <span 
                                  className={cn(
                                    "h-full rounded-full",
                                    index === 0 ? "bg-blue-600" :
                                    index === 1 ? "bg-sky-500" :
                                    index === 2 ? "bg-indigo-500" : "bg-slate-500"
                                  )}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                </div>

                {/* Direct Action Hub */}
                <div id="quick_links_strip" className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700">
                      <Sparkles className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-sm">Pronto para criar uma proposta comercial?</h5>
                      <p className="text-[11px] text-slate-400">Poupe tempo usando lookup automatizado CPF/CNPJ da receita na próxima tela.</p>
                    </div>
                  </div>
                  <button 
                    id="btn_hero_new_budget"
                    onClick={() => {
                      handleResetBudgetForm();
                      setActiveTab('new-budget');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2.5 rounded-xl transition duration-150 flex items-center space-x-1 font-bold shrink-0 shadow-sm"
                  >
                    <span>Criar Novo Orçamento</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

              </motion.div>
            )}

            {/* TAB 2: REGISTERED BUDGETS EXPLORER */}
            {activeTab === 'budgets' && (
              <motion.div 
                key="budgets_tab"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                {/* Search and Filters Header bar */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left part combining Search & Status Filters */}
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full lg:w-auto">
                    {/* Search query inputs */}
                    <div className="relative w-full md:w-80">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input 
                        id="input_search_budgets"
                        type="text"
                        placeholder="Buscar por título, cliente ou categoria..."
                        value={budgetSearchTerm}
                        onChange={(e) => setBudgetSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 transition"
                      />
                    </div>

                    {/* Status selection pillbox */}
                    <div className="flex space-x-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                      {(['ALL', 'PENDING', 'APPROVED', 'CANCELED'] as const).map((status) => (
                        <button
                          key={status}
                          id={`btn_filter_status_${status.toLowerCase()}`}
                          onClick={() => setBudgetStatusFilter(status)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0",
                            budgetStatusFilter === status
                              ? "bg-blue-600 text-white shadow-sm"
                              : "bg-gray-100 text-slate-600 hover:bg-gray-200"
                          )}
                        >
                          {status === 'ALL' && 'Todos'}
                          {status === 'PENDING' && 'Pendentes'}
                          {status === 'APPROVED' && 'Aprovados'}
                          {status === 'CANCELED' && 'Cancelados'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Brand Action: New Budget Button */}
                  <button
                    id="btn_budget_tab_new"
                    onClick={() => {
                      handleResetBudgetForm();
                      setActiveTab('new-budget');
                    }}
                    className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition duration-150 flex items-center justify-center space-x-1.5 shadow-sm shadow-blue-900/10 shrink-0 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Novo Orçamento</span>
                  </button>

                </div>

                {/* Budgets Grid representation */}
                {filteredBudgetsList.length === 0 ? (
                  <div className="bg-white text-center py-12 rounded-2xl border border-gray-200 shadow-sm">
                    <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <h4 className="text-sm font-semibold text-slate-800">Nenhum orçamento localizado</h4>
                    <p className="text-xs text-slate-500 mt-1">Experimente remover filtros de busca ou crie uma nova proposta.</p>
                  </div>
                ) : (
                  <div id="budgets_grid_list" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredBudgetsList.map((item) => {
                      const clientObj = clients.find(c => c.id === item.clientId);
                      return (
                        <div 
                          key={item.id} 
                          id={`budget_card_${item.id}`}
                          className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between"
                        >
                          {/* Card Head */}
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100/50 uppercase tracking-wider">
                                {item.category}
                              </span>
                              
                              {/* Custom Styled Select for fast Status updates */}
                              <div className="relative">
                                <select 
                                  id={`select_status_update_${item.id}`}
                                  value={item.status}
                                  onChange={(e) => handleChangeStatus(item.id, e.target.value as any)}
                                  className={cn(
                                    "text-[10.5px] font-semibold rounded-lg px-2 py-1 pr-6 border bg-no-repeat bg-right cursor-pointer appearance-none transition focus:outline-none",
                                    item.status === 'APPROVED' ? "bg-green-50 text-green-700 border-green-200" :
                                    item.status === 'PENDING' ? "bg-amber-50 text-amber-700 border-amber-200" :
                                    "bg-rose-50 text-rose-700 border-rose-200"
                                  )}
                                  style={{
                                    backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                                    backgroundSize: '12px',
                                    backgroundPosition: 'calc(100% - 6px) center',
                                  }}
                                >
                                  <option value="PENDING">Pendente</option>
                                  <option value="APPROVED">Aprovado</option>
                                  <option value="CANCELED">Cancelado</option>
                                </select>
                              </div>
                            </div>

                            <h4 className="font-semibold text-slate-900 hover:text-blue-600 transition leading-tight">
                              {item.title}
                            </h4>
                            
                            <div className="flex items-center space-x-2 text-xs text-slate-600 font-medium">
                              <Users className="h-3.5 w-3.5 text-slate-400" />
                              <span className="truncate">{clientObj ? clientObj.nome : 'Cliente Desconhecido'}</span>
                            </div>
                          </div>

                          {/* Items and sum divider */}
                          <div className="border-t border-gray-100 my-4 pt-3 space-y-1.5">
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span>Subtotal bruto ({item.items.reduce((s, x) => s + x.quantity, 0)} itens)</span>
                              <span className="font-mono">R$ {item.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            {item.discount > 0 && (
                              <div className="flex items-center justify-between text-xs text-rose-600 font-medium">
                                <span>Desconto aplicado</span>
                                <span className="font-mono">- R$ {item.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between pt-1.5 border-t border-dashed border-gray-150">
                              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Total Líquido</span>
                              <span className="font-extrabold text-blue-600 font-mono text-sm">
                                R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>

                          {/* Fast Action Buttons row */}
                          <div className="flex items-center justify-between gap-1 mt-1">
                            
                            {/* Delete Button */}
                            <button
                              id={`btn_delete_budget_${item.id}`}
                              onClick={() => handleDeleteBudget(item.id, item.title)}
                              className="p-2 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition"
                              title="Remover orçamento"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>

                            <div className="flex space-x-1.5">
                              
                              {/* Edit Budget button */}
                              <button
                                id={`btn_edit_budget_${item.id}`}
                                onClick={() => handleEditBudget(item)}
                                className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm"
                                title="Editar orçamento"
                              >
                                <Pencil className="h-3.5 w-3.5 text-blue-500" />
                                <span>Editar</span>
                              </button>

                              {/* AI Procurement Assistant button */}
                              <button
                                id={`btn_ai_budget_${item.id}`}
                                onClick={() => handleLaunchAiProcurement(item)}
                                className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition duration-150"
                                title="Analisar orçamento com inteligência fiscal"
                              >
                                <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                                <span className="hidden sm:inline">Análise IA</span>
                              </button>

                              {/* Print / Export PDF trigger */}
                              <button
                                id={`btn_print_budget_${item.id}`}
                                onClick={() => handlePrintTrigger(item)}
                                className="bg-white hover:bg-gray-50 border border-gray-200 text-slate-800 px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm"
                              >
                                <Download className="h-3.5 w-3.5 text-slate-500" />
                                <span>Exportar PDF</span>
                              </button>

                            </div>

                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 3: REGISTER NEW BUDGET & PROPOSAL CONTRACT */}
            {activeTab === 'new-budget' && (
              <motion.div 
                key="new-budget_tab"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 max-w-4xl mx-auto space-y-6"
              >
                <div className="flex items-center space-x-2 border-b border-gray-100 pb-4">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                    {editingBudgetId ? (
                      <Pencil className="h-5 w-5" />
                    ) : (
                      <Plus className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {editingBudgetId ? 'Editar Orçamento Inteligente' : 'Novo Orçamento Inteligente'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {editingBudgetId 
                        ? 'Atualize os dados e itens do orçamento no sistema.' 
                        : 'Configure itens de faturamento e vincule fornecedores automaticamente.'}
                    </p>
                  </div>
                </div>

                <form id="new_budget_form" onSubmit={handleSaveNewBudgetAction} className="space-y-6">
                  
                  {/* Title and Category */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="col-span-1 md:col-span-8 space-y-1.5">
                      <label htmlFor="input_budget_title" className="text-xs font-semibold text-slate-700">Título do Orçamento *</label>
                      <input 
                        id="input_budget_title"
                        type="text"
                        required
                        placeholder="Ex: Reforma Elétrica, Contrato Anual de Suportes"
                        value={budgetTitle}
                        onChange={(e) => setBudgetTitle(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-3 py-2.5 text-xs text-slate-800 transition"
                      />
                    </div>

                    <div className="col-span-1 md:col-span-4 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label htmlFor="select_budget_category" className="text-xs font-semibold text-slate-700">Categoria Geral</label>
                        <button 
                          id="btn_shortcut_to_categories"
                          type="button" 
                          onClick={() => setActiveTab('categories')} 
                          className="text-[10px] text-blue-600 hover:underline font-bold"
                        >
                          + Gerenciar Categorias
                        </button>
                      </div>
                      <select 
                        id="select_budget_category"
                        value={budgetCategory}
                        onChange={(e) => setBudgetCategory(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-3 py-2.5 text-xs text-slate-800 transition"
                      >
                        {budgetCategories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Client Select with Option to Jump Client registry */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label htmlFor="select_client_association" className="text-xs font-semibold text-slate-700">Vincular Cliente Comercial *</label>
                        <button 
                          id="btn_shortcut_to_clients"
                          type="button" 
                          onClick={() => setActiveTab('clients')} 
                          className="text-[10px] text-blue-600 hover:underline font-bold"
                        >
                          + Novo Cadastro (Receita Federal)
                        </button>
                      </div>
                      <select 
                        id="select_client_association"
                        required
                        value={selectedClientId}
                        onChange={(e) => setSelectedClientId(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-3 py-2.5 text-xs text-slate-800 transition"
                      >
                        <option value="">Selecione o cliente de destino...</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.nome} ({c.documento})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="input_validity_date" className="text-xs font-semibold text-slate-700">Data de Validade da Proposta</label>
                      <input 
                        id="input_validity_date"
                        type="date"
                        value={budgetValidityDate}
                        onChange={(e) => setBudgetValidityDate(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-3 py-2.5 text-xs text-slate-800 transition"
                      />
                    </div>
                  </div>

                  {/* Items Configuration Table */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Lista de Materiais & Custos</h4>
                      <button 
                        id="btn_form_add_item_line"
                        type="button" 
                        onClick={handleBudgetAddItemLine}
                        className="bg-gray-100 hover:bg-gray-200 text-slate-900 border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Adicionar Item</span>
                      </button>
                    </div>

                    <div id="items_form_lines_stack" className="space-y-3">
                      {budgetItems.map((item, index) => (
                        <div 
                          key={index} 
                          id={`budget_item_line_${index}`}
                          className="p-3 bg-gray-50/50 rounded-xl border border-gray-200 flex flex-col xl:flex-row gap-3 items-end"
                        >
                          
                          <div className="flex-1 space-y-1 w-full">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Item / Descrição do Produto</label>
                            <input 
                              type="text"
                              required
                              placeholder="Ex: Cabos estruturados, Suporte em TI"
                              value={item.name}
                              onChange={(e) => handleBudgetItemFieldChange(index, 'name', e.target.value)}
                              className="w-full bg-white border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-800 transition"
                            />
                          </div>

                          <div className="w-full xl:w-28 space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Tipo</label>
                            <select
                              value={item.tipo || 'Aquisição'}
                              onChange={(e) => handleBudgetItemFieldChange(index, 'tipo', e.target.value)}
                              className="w-full bg-white border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-2.5 py-2 text-xs text-slate-800 transition font-medium cursor-pointer"
                            >
                              <option value="Aquisição">Aquisição</option>
                              <option value="Comodato">Comodato</option>
                            </select>
                          </div>

                          <div className="w-full md:w-20 space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Qtd</label>
                            <input 
                              type="number"
                              required
                              min="1"
                              value={item.quantity === 0 ? '' : item.quantity}
                              onChange={(e) => {
                                const val = e.target.value;
                                handleBudgetItemFieldChange(index, 'quantity', val === '' ? 0 : parseInt(val) || 0);
                              }}
                              className="w-full bg-white border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-800 font-mono transition"
                            />
                          </div>

                          <div className="w-full md:w-32 space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Unitário (R$)</label>
                            <input 
                              type="number"
                              required
                              min="0"
                              step="0.01"
                              value={item.price === 0 ? '' : item.price}
                              onChange={(e) => {
                                const val = e.target.value;
                                handleBudgetItemFieldChange(index, 'price', val === '' ? 0 : parseFloat(val) || 0);
                              }}
                              className="w-full bg-white border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-800 font-mono transition"
                            />
                          </div>

                          <div className="w-full md:w-32 space-y-1">
                            <label className="text-[10px] font-bold text-blue-600 uppercase">Subtotal (R$)</label>
                            <div className="w-full bg-[#f8fafc] border border-gray-200 rounded-lg px-3 py-2 h-[34px] text-xs font-bold text-slate-800 font-mono flex items-center justify-end">
                              R$ {((Number(item.quantity) || 0) * (Number(item.price) || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                          </div>

                          {budgetItems.length > 1 && (
                            <button
                              id={`btn_form_remove_item_${index}`}
                              type="button"
                              onClick={() => handleBudgetRemoveItemLine(index)}
                              className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition shrink-0 h-[34px] flex items-center justify-center border border-rose-100 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}

                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financial calculation footer */}
                  <div className="p-4 bg-slate-900 text-white rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    
                    <div className="space-y-1.5">
                      <label htmlFor="input_budget_discount" className="text-xs font-semibold text-slate-300">Desconto Comercial (R$)</label>
                      <input 
                        id="input_budget_discount"
                        type="number"
                        min="0"
                        value={budgetDiscount === 0 ? '' : budgetDiscount}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBudgetDiscount(val === '' ? 0 : Number(val) || 0);
                        }}
                        className="w-full bg-slate-800 border border-slate-700 focus:border-blue-550 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-white font-mono transition"
                      />
                    </div>

                    <div className="text-center md:text-right md:border-r border-slate-800 pr-4">
                      <span className="text-[10px] text-slate-400 block uppercase font-mono">Subtotal Bruto</span>
                      <span className="text-lg font-bold font-mono">R$ {computedFormSubtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>

                    <div className="text-center md:text-right">
                      <span className="text-[10px] text-blue-400 block uppercase font-mono font-bold">Total Líquido Estimado</span>
                      <span className="text-2xl font-bold font-mono text-blue-400">R$ {computedFormTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>

                  </div>

                  {/* Payment terms and notes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="input_payment_terms" className="text-xs font-semibold text-slate-700">Condições de Pagamento</label>
                      <input 
                        id="input_payment_terms"
                        type="text"
                        placeholder="Ex: Sinal de 30% + saldo faturado boleto em 2 parcelas"
                        value={budgetPaymentTerms}
                        onChange={(e) => setBudgetPaymentTerms(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-3 py-2.5 text-xs text-slate-800 transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="textarea_budget_notes" className="text-xs font-semibold text-slate-700">Observações Corporativas Internas</label>
                      <textarea 
                        id="textarea_budget_notes"
                        rows={2}
                        placeholder="Quaisquer notas referentes a prioridades, pendências ou cronogramas de entrega..."
                        value={budgetNotes}
                        onChange={(e) => setBudgetNotes(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-800 transition"
                      />
                    </div>
                  </div>

                  {/* Submission and Action strip */}
                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
                    <button 
                      id="btn_form_cancel_action"
                      type="button" 
                      onClick={() => {
                        handleResetBudgetForm();
                        setActiveTab('budgets');
                      }}
                      className="text-xs text-slate-600 hover:text-slate-900 font-semibold px-4 py-2.5 transition"
                    >
                      Voltar para Lista
                    </button>
                    <button 
                      id="btn_form_submit_budget"
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition duration-150 flex items-center space-x-2 shadow-sm shadow-blue-900/10"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{editingBudgetId ? 'Atualizar Orçamento Comercial' : 'Salvar e Autenticar Orçamento'}</span>
                    </button>
                  </div>

                </form>
              </motion.div>
            )}

            {/* TAB 4: SUPPLIERS CHAIN MANAGEMENT */}
            {activeTab === 'suppliers' && (
              <motion.div 
                key="suppliers_tab"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                {/* Visual Banner */}
                <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-slate-50">Fornecedores</h3>
                    <p className="text-xs text-slate-400 font-normal">Automatize o fluxo de cotações diretas enviando RFPs geradas com IA diretamente para parceiros oficiais.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left: Supplier Creation Form */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm lg:col-span-4 space-y-4">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest pb-2 border-b border-gray-100">Cadastrar Novo Fornecedor</h4>
                    
                    <form id="new_supplier_form" onSubmit={handleAddSupplierAction} className="space-y-3">
                      
                      <div className="space-y-1">
                        <label htmlFor="input_supplier_name" className="text-[10px] font-bold text-slate-400 uppercase">Nome / Razão Social *</label>
                        <input 
                          id="input_supplier_name"
                          type="text"
                          required
                          placeholder="Ex: Kalunga S.A"
                          value={newSupplier.nome}
                          onChange={(e) => setNewSupplier({ ...newSupplier, nome: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-800 transition"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="input_supplier_cnpj" className="text-[10px] font-bold text-slate-400 uppercase">CNPJ Comercial *</label>
                        <input 
                          id="input_supplier_cnpj"
                          type="text"
                          required
                          placeholder="Ex: 14.537.498/0001-20"
                          value={newSupplier.cnpj}
                          onChange={(e) => setNewSupplier({ ...newSupplier, cnpj: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-800 transition"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label htmlFor="input_supplier_phone" className="text-[10px] font-bold text-slate-400 uppercase">Telefone</label>
                          <input 
                            id="input_supplier_phone"
                            type="text"
                            placeholder="(11) 3224-4000"
                            value={newSupplier.telefone}
                            onChange={(e) => setNewSupplier({ ...newSupplier, telefone: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-800 transition"
                          />
                        </div>

                        <div className="space-y-1">
                          <label htmlFor="select_supplier_industry" className="text-[10px] font-bold text-slate-400 uppercase">Setor</label>
                          <select 
                            id="select_supplier_industry"
                            value={newSupplier.setor}
                            onChange={(e) => setNewSupplier({ ...newSupplier, setor: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-800 transition"
                          >
                            <option value="Escritório & Papelaria">Papelaria</option>
                            <option value="Computação & TI">Computação & TI</option>
                            <option value="Segurança & Redes">Segurança & Redes</option>
                            <option value="Obras & Construção">Construção</option>
                            <option value="Ferragens & Estruturas">Ferragens</option>
                            <option value="Geral">Serviço Geral</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="input_supplier_email" className="text-[10px] font-bold text-slate-400 uppercase">E-mail Comercial</label>
                        <input 
                          id="input_supplier_email"
                          type="email"
                          placeholder="vendas@fornecedor.com.br"
                          value={newSupplier.email}
                          onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-800 transition"
                        />
                      </div>

                      <button 
                        id="btn_submit_supplier"
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-lg transition"
                      >
                        Injetar Fornecedor Oficial
                      </button>

                    </form>
                  </div>

                  {/* Right: Active Suppliers Listing */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm lg:col-span-8 space-y-4">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest pb-2 border-b border-gray-100">Parceiros de Suprimentos Homologados</h4>
                    
                    <div className="overflow-x-auto">
                      <table id="tbl_suppliers_chain" className="w-full text-xs text-left text-slate-700">
                        <thead>
                          <tr className="border-b border-gray-200 text-slate-400 font-semibold tracking-wider text-[10px] uppercase">
                            <th className="py-2.5">Nome do Link</th>
                            <th className="py-2.5">CNPJ</th>
                            <th className="py-2.5">Contato</th>
                            <th className="py-2.5">Setor de Atividade</th>
                            <th className="py-2.5 text-right">Controles</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {suppliers.map(s => (
                            <tr key={s.id} id={`supplier_row_${s.id}`} className="hover:bg-slate-50/50">
                              <td className="py-3 font-semibold text-slate-950">{s.nome}</td>
                              <td className="py-3 font-mono text-[11px] text-slate-500">{s.cnpj}</td>
                              <td className="py-3 space-y-0.5">
                                <div className="flex items-center space-x-1 font-mono text-[10.5px] text-slate-600">
                                  <Mail className="h-3 w-3 text-slate-400" />
                                  <span>{s.email || '-'}</span>
                                </div>
                                <div className="flex items-center space-x-1 font-mono text-[10.5px] text-slate-600">
                                  <Phone className="h-3 w-3 text-slate-400" />
                                  <span>{s.telefone || '-'}</span>
                                </div>
                              </td>
                              <td className="py-3">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 border border-blue-100/50 text-blue-700 uppercase">
                                  {s.setor}
                                </span>
                              </td>
                              <td className="py-3 text-right">
                                <button
                                  id={`btn_delete_supplier_${s.id}`}
                                  onClick={() => handleDeleteSupplier(s.id, s.nome)}
                                  className="p-1 px-2 text-rose-600 hover:bg-rose-50 rounded transition"
                                  title="Remover parceiro"
                                >
                                  <Trash2 className="h-3.5 w-3.5 inline" strokeWidth="2.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB 5: CLIENTS DATABASE & INTEGRATIONS */}
            {activeTab === 'clients' && (
              <motion.div 
                key="clients_tab"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column: Receita Federal API Lookup / Create / Edit Form */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm lg:col-span-4 space-y-5">
                    
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest pb-2 border-b border-gray-100 flex items-center gap-1.5 text-blue-700">
                        {editingClientId ? (
                          <>
                            <Pencil className="h-3.5 w-3.5 text-amber-600" />
                            <span className="text-amber-700">Editar Cadastro de Cliente</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                            <span>Consulta Digital Receita Federal</span>
                          </>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {editingClientId 
                          ? "Ajuste os dados cadastrais, informações fiscais ou canais de contato do cliente selecionado abaixo."
                          : "Busca inteligente de CNPJ comercial ou CPF de contribuinte. Os resultados localizados preenchem instantaneamente o cadastro tributário do cliente."
                        }
                      </p>
                    </div>

                    {/* Lookup input bar - hidden or inactive during edit to prevent confusion */}
                    {editingClientId ? (
                      <div className="p-3 bg-amber-50 border border-amber-200/60 rounded-lg text-amber-800 text-[10.5px] leading-relaxed flex items-start gap-2 select-none">
                        <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Modo de Edição Ativo</p>
                          <p className="text-[10px] mt-0.5">Após salvar ou cancelar, o buscador de novos CNPJs/CPFs estará disponível novamente.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input 
                              id="input_lookup_doc"
                              type="text"
                              placeholder="Digite CNPJ ou CPF completo..."
                              value={searchDocValue}
                              onChange={(e) => setSearchDocValue(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg pl-9 pr-4 py-2.5 text-xs text-slate-800 font-mono transition"
                            />
                          </div>
                          <button 
                            id="btn_trigger_lookup"
                            type="button"
                            disabled={isSearchingClient}
                            onClick={handleClientLookup}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 text-center rounded-lg transition disabled:opacity-50 flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
                          >
                            {isSearchingClient ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              <Search className="h-3 w-3" />
                            )}
                            <span>{isSearchingClient ? 'Buscando...' : 'Pesquisar'}</span>
                          </button>
                        </div>

                        {/* Display validation message */}
                        {lookupMessage.text && (
                          <div className={cn(
                            "p-2.5 rounded-lg text-[11px] font-medium flex items-start gap-1.5 leading-snug",
                            lookupMessage.type === 'success' ? "bg-blue-50 text-blue-800 border border-blue-100/50" : "bg-rose-50 text-rose-800 border border-rose-100"
                          )}>
                            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                            <span>{lookupMessage.text}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Integrated pre-filled details form */}
                    <form id="client_ingestion_form" onSubmit={handleAddClientAction} className="space-y-3 pt-3 border-t border-gray-100">
                      
                      <div className="space-y-1">
                        <label htmlFor="input_client_name" className="text-[10px] font-bold text-slate-400 uppercase">Razão Social / Nome de Registro *</label>
                        <input 
                          id="input_client_name"
                          type="text"
                          required
                          placeholder="Informe ou carregue o nome"
                          value={newClient.nome || ''}
                          onChange={(e) => setNewClient({ ...newClient, nome: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-800 transition"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label htmlFor="input_client_trade_name" className="text-[10px] font-bold text-slate-400 uppercase">Nome Fantasia (Apelido)</label>
                          <input 
                            id="input_client_trade_name"
                            type="text"
                            placeholder="Nome de mercado"
                            value={newClient.fantasia || ''}
                            onChange={(e) => setNewClient({ ...newClient, fantasia: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-800 transition"
                          />
                        </div>

                        <div className="space-y-1">
                          <label htmlFor="input_client_doc" className="text-[10px] font-bold text-slate-400 uppercase">CPF / CNPJ Comercial *</label>
                          <input 
                            id="input_client_doc"
                            type="text"
                            required
                            placeholder="Formatado"
                            value={newClient.documento || ''}
                            onChange={(e) => setNewClient({ ...newClient, documento: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-800 font-mono transition"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label htmlFor="input_client_phone" className="text-[10px] font-bold text-slate-400 uppercase">Telefone</label>
                          <input 
                            id="input_client_phone"
                            type="text"
                            placeholder="(11) 98765-4321"
                            value={newClient.telefone || ''}
                            onChange={(e) => setNewClient({ ...newClient, telefone: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-800 transition"
                          />
                        </div>

                        <div className="space-y-1">
                          <label htmlFor="input_client_email" className="text-[10px] font-bold text-slate-400 uppercase">E-mail Comercial</label>
                          <input 
                            id="input_client_email"
                            type="email"
                            placeholder="financeiro@empresa.com"
                            value={newClient.email || ''}
                            onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-800 transition"
                          />
                        </div>
                      </div>

                      {/* Client Address Group */}
                      <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pt-2">Localização e Logística</p>
                      
                      <div className="grid grid-cols-12 gap-2 flex-row">
                        <div className="col-span-12 md:col-span-8 space-y-1">
                          <label htmlFor="input_client_address" className="text-[9px] font-bold text-slate-400 uppercase">Logradouro / Avenida</label>
                          <input 
                            id="input_client_address"
                            type="text"
                            placeholder="Ex: Avenida Paulista"
                            value={newClient.logradouro || ''}
                            onChange={(e) => setNewClient({ ...newClient, logradouro: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-800 transition"
                          />
                        </div>
                        <div className="col-span-12 md:col-span-4 space-y-1">
                          <label htmlFor="input_client_number" className="text-[9px] font-bold text-slate-400 uppercase">Número</label>
                          <input 
                            id="input_client_number"
                            type="text"
                            placeholder="Nº"
                            value={newClient.numero || ''}
                            onChange={(e) => setNewClient({ ...newClient, numero: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-800 transition"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <label htmlFor="input_client_neighborhood" className="text-[9px] font-bold text-slate-400 uppercase">Bairro</label>
                          <input 
                            id="input_client_neighborhood"
                            type="text"
                            placeholder="Bela Vista"
                            value={newClient.bairro || ''}
                            onChange={(e) => setNewClient({ ...newClient, bairro: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label htmlFor="input_client_city" className="text-[9px] font-bold text-slate-400 uppercase">Cidade</label>
                          <input 
                            id="input_client_city"
                            type="text"
                            placeholder="São Paulo"
                            value={newClient.municipio || ''}
                            onChange={(e) => setNewClient({ ...newClient, municipio: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label htmlFor="input_client_state" className="text-[9px] font-bold text-slate-400 uppercase">UF</label>
                          <input 
                            id="input_client_state"
                            type="text"
                            placeholder="SP"
                            value={newClient.uf || ''}
                            onChange={(e) => setNewClient({ ...newClient, uf: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <span className="text-[10px] bg-gray-100 text-slate-500 border border-gray-200 rounded-md px-2 py-1 font-mono">
                          Canal: {newClient.origem || 'Digitado Manual'}
                        </span>
                        <span className="text-[10px] bg-blue-50 text-blue-800 border border-blue-100/50 rounded-md px-2 py-1 font-mono font-bold">
                          Situação: {newClient.situacao || 'REGULAR'}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2 pt-2">
                        <button 
                          id="btn_submit_client"
                          type="submit"
                          className={cn(
                            "w-full text-white font-bold text-xs py-2.5 rounded-lg transition active:scale-97 cursor-pointer shadow-sm flex items-center justify-center gap-2",
                            editingClientId 
                              ? "bg-amber-650 hover:bg-amber-700" 
                              : "bg-slate-900 hover:bg-slate-850"
                          )}
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>{editingClientId ? 'Salvar Alterações de Cadastro' : 'Homologar e Inserir no Banco de Dados'}</span>
                        </button>

                        {editingClientId && (
                          <button 
                            id="btn_cancel_client_edit"
                            type="button"
                            onClick={() => {
                              setEditingClientId(null);
                              setNewClient({
                                nome: '', fantasia: '', documento: '', telefone: '', email: '',
                                logradouro: '', numero: '', bairro: '', cep: '', municipio: '', uf: '',
                                situacao: 'REGULAR', origem: 'Digitado Manual'
                              });
                              setSearchDocValue('');
                              setLookupMessage({ type: '', text: '' });
                            }}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-slate-700 font-semibold text-xs py-2 rounded-lg transition active:scale-97 cursor-pointer"
                          >
                            Cancelar Edição
                          </button>
                        )}
                      </div>

                    </form>

                  </div>

                  {/* Right Column: Registered Corporate Clients Grid */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm lg:col-span-8 space-y-4">
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Clientes Cadastrados</h4>
                        <p className="text-[10.5px] text-slate-400 mt-0.5">Base tributária de parceiros comerciais e contribuintes emitidos</p>
                      </div>
                      
                      {/* Search Bar filter */}
                      <div className="relative w-full md:w-72">
                        <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Buscar cliente, documento ou cidade..."
                          value={clientSearchQuery}
                          onChange={(e) => setClientSearchQuery(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-800 transition"
                        />
                        {clientSearchQuery && (
                          <button
                            onClick={() => setClientSearchQuery('')}
                            className="absolute right-2.5 top-2 text-[10px] text-slate-400 hover:text-slate-600 font-bold"
                          >
                            Limpar
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Responsive Grid representation with absolute button guarantees */}
                    {clients.filter(c => {
                      const query = clientSearchQuery.trim().toLowerCase();
                      if (!query) return true;
                      return (
                        c.nome.toLowerCase().includes(query) ||
                        (c.fantasia && c.fantasia.toLowerCase().includes(query)) ||
                        c.documento.toLowerCase().includes(query) ||
                        c.municipio.toLowerCase().includes(query) ||
                        (c.email && c.email.toLowerCase().includes(query))
                      );
                    }).length === 0 ? (
                      <div className="py-12 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-xl space-y-2">
                        <Users className="h-8 w-8 text-slate-300 mx-auto" />
                        <p className="text-xs text-slate-600 font-bold">Nenhum cliente localizado</p>
                        <p className="text-[10px] text-slate-400">Verifique os filtros ou busque/carregue um novo cliente no menu ao lado.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-2 gap-4">
                        {clients.filter(c => {
                          const query = clientSearchQuery.trim().toLowerCase();
                          if (!query) return true;
                          return (
                            c.nome.toLowerCase().includes(query) ||
                            (c.fantasia && c.fantasia.toLowerCase().includes(query)) ||
                            c.documento.toLowerCase().includes(query) ||
                            c.municipio.toLowerCase().includes(query) ||
                            (c.email && c.email.toLowerCase().includes(query))
                          );
                        }).map(c => {
                          const isCnpj = c.documento.replace(/\D/g, '').length > 11;
                          const hasOriginRf = c.origem && c.origem.toLowerCase().includes('receita');
                          
                          return (
                            <div 
                              key={c.id} 
                              id={`client_card_${c.id}`}
                              className={cn(
                                "bg-white rounded-xl border p-4.5 space-y-3.5 transition hover:shadow-md flex flex-col justify-between",
                                editingClientId === c.id 
                                  ? "border-amber-400 bg-amber-50/10 shadow-sm" 
                                  : "border-slate-200 hover:border-slate-350"
                              )}
                            >
                              {/* Top card header */}
                              <div className="space-y-1.5">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <div className={cn(
                                      "p-1.5 rounded-lg shrink-0",
                                      isCnpj ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
                                    )}>
                                      {isCnpj ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-slate-900 leading-tight line-clamp-1" title={c.nome}>
                                        {c.nome}
                                      </p>
                                      {c.fantasia && c.fantasia !== c.nome && (
                                        <p className="text-[10px] text-slate-500 line-clamp-1">{c.fantasia}</p>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Status indicators */}
                                  <div className="flex items-center gap-1 shrink-0">
                                    <span className={cn(
                                      "text-[9px] px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-1",
                                      c.situacao === 'ATIVA' || c.situacao === 'REGULAR' 
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                                        : "bg-amber-50 text-amber-700 border border-amber-100"
                                    )}>
                                      <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse shrink-0" />
                                      {c.situacao || 'ATIVA'}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600">
                                    Origem: {hasOriginRf ? 'Receita Federal' : 'Manual'}
                                  </span>
                                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-50 border border-slate-150 text-slate-500">
                                    ID: {c.id.toUpperCase()}
                                  </span>
                                </div>
                              </div>

                              {/* Formatted middle layout variables */}
                              <div className="grid grid-cols-1 gap-2.5 text-[11px] pt-1 border-t border-slate-100">
                                
                                {/* Document info row with Quick Copy */}
                                <div className="flex items-center justify-between gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase font-sans">CNPJ/CPF:</span>
                                    <span className="font-mono text-slate-700 text-xs font-semibold">{c.documento}</span>
                                  </div>
                                  <div>
                                    {copiedClientId === c.id ? (
                                      <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px] select-none animate-pulse">
                                        <Check className="h-3 w-3" />
                                        <span>Copiado!</span>
                                      </span>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => handleCopyClientDoc(c.id, c.documento)}
                                        className="text-slate-400 hover:text-blue-600 hover:bg-slate-150 p-1 rounded transition cursor-pointer"
                                        title="Copiar Código do Documento"
                                      >
                                        <Copy className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Address / Logistics block */}
                                <div className="space-y-0.5 text-slate-600">
                                  <div className="flex items-start gap-1">
                                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                                    <div>
                                      <p className="font-medium text-slate-800 leading-snug">
                                        {c.municipio} - {c.uf}
                                      </p>
                                      <p className="text-[10px] text-slate-400 leading-snug">
                                        {c.logradouro}, {c.numero} {c.bairro ? `| ${c.bairro}` : ''} {c.cep ? `| CEP ${c.cep}` : ''}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Communication block */}
                                <div className="grid grid-cols-1 gap-1 border-t border-dashed border-slate-100 pt-2 text-slate-500">
                                  {c.email && (
                                    <a 
                                      href={`mailto:${c.email}`}
                                      className="flex items-center gap-1.5 hover:text-blue-600 transition truncate"
                                      title={`Enviar e-mail para ${c.email}`}
                                    >
                                      <Mail className="h-3 w-3 text-slate-450 shrink-0" />
                                      <span className="font-mono text-[10.5px] truncate">{c.email}</span>
                                    </a>
                                  )}
                                  {c.telefone && (
                                    <a 
                                      href={`tel:${c.telefone.replace(/\D/g, '')}`}
                                      className="flex items-center gap-1.5 hover:text-blue-600 transition"
                                      title={`Ligar para ${c.telefone}`}
                                    >
                                      <Phone className="h-3 w-3 text-slate-450 shrink-0" />
                                      <span className="font-mono text-[10.5px]">{c.telefone}</span>
                                    </a>
                                  )}
                                </div>

                              </div>

                              {/* Card Action Controls - Styled to always fit, never overlap or get squeezed */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 pt-3 border-t border-slate-100 mt-2">
                                
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedClientId(c.id);
                                    setActiveTab('new-budget');
                                  }}
                                  className="px-2 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 border border-blue-100/50 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition shrink-0 active:scale-97 cursor-pointer"
                                  title="Iniciar nova proposta comercial"
                                >
                                  <FileText className="h-3.5 w-3.5" />
                                  <span>Proposta</span>
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={() => handleCreateReceiptForClient(c)}
                                  className="px-2 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 border border-indigo-100/50 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition shrink-0 active:scale-97 cursor-pointer"
                                  title="Emitir recibo novo"
                                >
                                  <Receipt className="h-3.5 w-3.5" />
                                  <span>Recibo</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingClientId(c.id);
                                    setNewClient({
                                      nome: c.nome,
                                      fantasia: c.fantasia,
                                      documento: c.documento,
                                      telefone: c.telefone,
                                      email: c.email,
                                      logradouro: c.logradouro,
                                      numero: c.numero,
                                      bairro: c.bairro,
                                      cep: c.cep,
                                      municipio: c.municipio,
                                      uf: c.uf,
                                      situacao: c.situacao,
                                      origem: c.origem
                                    });
                                    setSearchDocValue(c.documento);
                                    document.getElementById('input_client_name')?.scrollIntoView({ behavior: 'smooth' });
                                  }}
                                  className="px-2 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-850 border border-amber-100/40 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition shrink-0 active:scale-97 cursor-pointer"
                                  title="Editar este cadastro comercial"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                  <span>Editar</span>
                                </button>

                                <button
                                  id={`btn_delete_client_${c.id}`}
                                  type="button"
                                  onClick={() => handleDeleteClient(c.id, c.nome)}
                                  className="px-2 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-850 border border-rose-100 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition shrink-0 active:scale-97 cursor-pointer"
                                  title="Deletar este cadastro"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span>Excluir</span>
                                </button>

                              </div>

                            </div>
                          );
                        })}
                      </div>
                    )}

                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB 6: COMPANY SETTINGS */}
            {activeTab === 'settings' && (
              <motion.div 
                key="settings_tab"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                {/* Beautiful custom-styled card for company data */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-150 pb-4 gap-2">
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Settings className="h-5 w-5 text-blue-600" />
                        <span>Identidade e Dados da Empresa</span>
                      </h3>
                      <p className="text-xs text-slate-500 font-sans">
                        Insira e gerencie os detalhes institucionais da sua organização. Essas informações serão carimbadas automaticamente nas propostas, PDFs e comunicações geradas.
                      </p>
                    </div>
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      setSettingsSaved(true);
                      setTimeout(() => setSettingsSaved(false), 3000);
                    }}
                    className="space-y-6"
                  >
                    {/* Visual Success notification inside form */}
                    {settingsSaved && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-emerald-50 text-emerald-800 border border-emerald-150 rounded-xl p-4 flex items-start gap-3 shadow-xs"
                      >
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold font-sans">Configurações Atualizadas!</p>
                          <p className="text-[11px] text-emerald-700 leading-relaxed font-sans">Os dados corporativos foram salvos com segurança na memória local do navegador. Todas as novas propostas ou visualizações de PDF já estão atualizadas.</p>
                        </div>
                      </motion.div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left Block: Basic Identity */}
                      <div className="space-y-4 font-sans font-sans">
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-gray-100 pb-1.5 font-sans">Identificação Corporativa</h4>
                        
                        {/* Logo Upload Section */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700 block">Logotipo da Empresa</label>
                          <div 
                            id="logo_drag_drop_zone"
                            onDragOver={(e) => {
                              e.preventDefault();
                              setLogoDragging(true);
                            }}
                            onDragLeave={() => setLogoDragging(false)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setLogoDragging(false);
                              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                const file = e.dataTransfer.files[0];
                                if (file.type.startsWith('image/')) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    if (event.target?.result) {
                                      saveCompanyInfoToStorage({
                                        ...companyInfo,
                                        logoBase64: event.target.result as string
                                      });
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                } else {
                                  alert('Por favor, faça upload de um arquivo de imagem válido (PNG, JPG, etc).');
                                }
                              }
                            }}
                            className={cn(
                              "border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition duration-200 cursor-pointer text-center",
                              logoDragging 
                                ? "border-blue-500 bg-blue-50/50" 
                                : "border-slate-200 hover:border-slate-300 bg-slate-50/30"
                            )}
                            onClick={() => document.getElementById('company_logo_file_input')?.click()}
                          >
                            <input 
                              id="company_logo_file_input"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  const file = e.target.files[0];
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    if (event.target?.result) {
                                      saveCompanyInfoToStorage({
                                        ...companyInfo,
                                        logoBase64: event.target.result as string
                                      });
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                            
                            {companyInfo.logoBase64 ? (
                              <div className="space-y-3 w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                                <div className="relative group w-32 h-16 border rounded-lg overflow-hidden bg-white flex items-center justify-center p-1.5 shadow-2xs">
                                  <img 
                                    id="company_logo_settings_preview"
                                    src={companyInfo.logoBase64} 
                                    alt="Logo da Empresa" 
                                    className="object-contain max-h-full max-w-full"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    id="btn_change_company_logo"
                                    type="button"
                                    onClick={() => document.getElementById('company_logo_file_input')?.click()}
                                    className="bg-white hover:bg-slate-50 border border-gray-200 text-slate-700 px-3 py-1.5 rounded-lg text-[10.5px] font-semibold transition cursor-pointer flex items-center gap-1"
                                  >
                                    <Upload className="h-3 w-3" />
                                    <span>Alterar</span>
                                  </button>
                                  <button
                                    id="btn_remove_company_logo"
                                    type="button"
                                    onClick={() => saveCompanyInfoToStorage({ ...companyInfo, logoBase64: '' })}
                                    className="bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-700 px-3 py-1.5 rounded-lg text-[10.5px] font-semibold transition cursor-pointer flex items-center gap-1"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                    <span>Remover</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2 py-2">
                                <div className="p-3 bg-blue-50/50 text-blue-600 rounded-full w-11 h-11 flex items-center justify-center mx-auto shadow-2xs">
                                  <Upload className="h-5 w-5" />
                                </div>
                                <div className="space-y-0.5">
                                  <p className="text-xs font-semibold text-slate-800">
                                    Arraste e solte o logo ou <span className="text-blue-600 hover:underline">clique para buscar</span>
                                  </p>
                                  <p className="text-[10px] text-slate-400">Suporta imagens (PNG, JPG, SVG) de até 2MB</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1.5 font-sans font-sans">
                          <label className="text-xs font-bold text-slate-700 block">Nome Fantasia (Comercial)</label>
                          <input 
                            id="input_company_nome_fantasia"
                            type="text"
                            required
                            value={companyInfo.nomeFantasia}
                            onChange={(e) => saveCompanyInfoToStorage({ ...companyInfo, nomeFantasia: e.target.value })}
                            className="w-full bg-white border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-4.5 py-3 text-xs text-slate-800 transition font-sans"
                            placeholder="Ex: Minha Empresa Inc."
                          />
                        </div>

                        <div className="space-y-1.5 font-sans font-sans">
                          <label className="text-xs font-bold text-slate-700 block">Razão Social (Nome Jurídico)</label>
                          <input 
                            id="input_company_razao_social"
                            type="text"
                            required
                            value={companyInfo.razaoSocial}
                            onChange={(e) => saveCompanyInfoToStorage({ ...companyInfo, razaoSocial: e.target.value })}
                            className="w-full bg-white border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-4.5 py-3 text-xs text-slate-800 transition font-sans"
                            placeholder="Ex: Minha Empresa e Tecnologia Ltda."
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5 font-sans font-sans">
                            <label className="text-xs font-bold text-slate-700 block">CNPJ</label>
                            <input 
                              id="input_company_cnpj"
                              type="text"
                              required
                              value={companyInfo.cnpj}
                              onChange={(e) => saveCompanyInfoToStorage({ ...companyInfo, cnpj: e.target.value })}
                              className="w-full bg-white border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-4.5 py-3 text-xs font-mono text-slate-800 transition font-sans"
                              placeholder="00.000.000/0001-00"
                            />
                          </div>

                          <div className="space-y-1.5 font-sans font-sans">
                            <label className="text-xs font-bold text-slate-700 block">Slogan / Descritor Comercial</label>
                            <input 
                              id="input_company_slogan"
                              type="text"
                              value={companyInfo.slogan}
                              onChange={(e) => saveCompanyInfoToStorage({ ...companyInfo, slogan: e.target.value })}
                              className="w-full bg-white border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-4.5 py-3 text-xs text-slate-800 transition font-sans"
                              placeholder="Ex: Soluções Consolidadas"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5 font-sans font-sans">
                            <label className="text-xs font-bold text-slate-700 block">Telefone Comercial</label>
                            <input 
                              id="input_company_telefone"
                              type="text"
                              value={companyInfo.telefone}
                              onChange={(e) => saveCompanyInfoToStorage({ ...companyInfo, telefone: e.target.value })}
                              className="w-full bg-white border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-4.5 py-3 text-xs text-slate-800 transition font-sans"
                              placeholder="(00) 0000-0000"
                            />
                          </div>

                          <div className="space-y-1.5 font-sans font-sans">
                            <label className="text-xs font-bold text-slate-700 block">E-mail de Contato</label>
                            <input 
                              id="input_company_email"
                              type="email"
                              value={companyInfo.email}
                              onChange={(e) => saveCompanyInfoToStorage({ ...companyInfo, email: e.target.value })}
                              className="w-full bg-white border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-4.5 py-3 text-xs text-slate-800 transition font-sans"
                              placeholder="comercial@empresa.com"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5 font-sans font-sans font-sans">
                          <label className="text-xs font-bold text-slate-700 block">Website Corporativo</label>
                          <input 
                            id="input_company_website"
                            type="text"
                            value={companyInfo.website}
                            onChange={(e) => saveCompanyInfoToStorage({ ...companyInfo, website: e.target.value })}
                            className="w-full bg-white border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-4.5 py-3 text-xs text-slate-800 transition font-sans"
                            placeholder="www.empresa.com.br"
                          />
                        </div>
                      </div>

                      {/* Right Block: Address & Logistics */}
                      <div className="space-y-4 font-sans font-sans font-sans">
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-gray-100 pb-1.5 font-sans">Logística & Endereço Matriz</h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                          <div className="sm:col-span-3 space-y-1.5 font-sans font-sans">
                            <label className="text-xs font-bold text-slate-700 block">Logradouro (Rua, Avenida, etc.)</label>
                            <input 
                              id="input_company_logradouro"
                              type="text"
                              value={companyInfo.logradouro}
                              onChange={(e) => saveCompanyInfoToStorage({ ...companyInfo, logradouro: e.target.value })}
                              className="w-full bg-white border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-4.5 py-3 text-xs text-slate-800 transition font-sans"
                              placeholder="Rua das Acácias"
                            />
                          </div>

                          <div className="space-y-1.5 font-sans font-sans">
                            <label className="text-xs font-bold text-slate-700 block">Número</label>
                            <input 
                              id="input_company_numero"
                              type="text"
                              value={companyInfo.numero}
                              onChange={(e) => saveCompanyInfoToStorage({ ...companyInfo, numero: e.target.value })}
                              className="w-full bg-white border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-4.5 py-3 text-xs text-slate-800 transition font-sans"
                              placeholder="123"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5 font-sans font-sans font-sans font-sans">
                            <label className="text-xs font-bold text-slate-700 block">Bairro</label>
                            <input 
                              id="input_company_bairro"
                              type="text"
                              value={companyInfo.bairro}
                              onChange={(e) => saveCompanyInfoToStorage({ ...companyInfo, bairro: e.target.value })}
                              className="w-full bg-white border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-4.5 py-3 text-xs text-slate-800 transition font-sans"
                              placeholder="Centro"
                            />
                          </div>

                          <div className="space-y-1.5 font-sans font-sans">
                            <label className="text-xs font-bold text-slate-700 block">CEP</label>
                            <input 
                              id="input_company_cep"
                              type="text"
                              value={companyInfo.cep}
                              onChange={(e) => saveCompanyInfoToStorage({ ...companyInfo, cep: e.target.value })}
                              className="w-full bg-white border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-4.5 py-3 text-xs font-mono text-slate-800 transition font-sans"
                              placeholder="00000-000"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="sm:col-span-2 space-y-1.5 font-sans font-sans font-sans">
                            <label className="text-xs font-bold text-slate-700 block">Município</label>
                            <input 
                              id="input_company_municipio"
                              type="text"
                              value={companyInfo.municipio}
                              onChange={(e) => saveCompanyInfoToStorage({ ...companyInfo, municipio: e.target.value })}
                              className="w-full bg-white border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-4.5 py-3 text-xs text-slate-800 transition font-sans"
                              placeholder="São Paulo"
                            />
                          </div>

                          <div className="space-y-1.5 font-sans font-sans font-sans">
                            <label className="text-xs font-bold text-slate-700 block">UF (Estado)</label>
                            <input 
                              id="input_company_uf"
                              type="text"
                              value={companyInfo.uf}
                              maxLength={2}
                              onChange={(e) => saveCompanyInfoToStorage({ ...companyInfo, uf: e.target.value.toUpperCase() })}
                              className="w-full bg-white border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-4.5 py-3 text-xs font-mono text-slate-800 transition text-center font-sans"
                              placeholder="SP"
                            />
                          </div>
                        </div>

                        {/* Interactive Box indicating usage */}
                        <div className="bg-slate-50 border border-gray-150 p-4 rounded-lg flex items-start gap-3 select-none">
                          <Info className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                          <div className="space-y-1 font-sans">
                            <p className="text-xs font-bold text-slate-800 font-sans">Uso no Sistema</p>
                            <p className="text-[10px] text-slate-500 leading-relaxed font-sans font-sans">
                              Este endereço e dados cadastrais serão utilizados para compor o cabeçalho das propostas impressas e digitais. Certifique-se de preencher informações verídicas para garantir a integridade de seus acordos comerciais.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-5 flex items-center justify-between font-sans">
                      <span className="text-[10.5px] text-slate-400 font-mono font-sans font-sans">Dados salvos de maneira totalmente segura off-line.</span>
                      <button 
                        id="btn_save_company_settings"
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer scale-100 active:scale-95 duration-100 font-sans"
                      >
                        <Check className="h-4 w-4" />
                        <span>Salvar Todas as Alterações</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Banner de Direcionamento para Categorias de Orçamento */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xs select-none">
                  <div className="flex items-start gap-3.5 max-w-2xl">
                    <Tag className="h-6 w-6 text-blue-600 shrink-0 mt-0.5" />
                    <div className="space-y-1 font-sans">
                      <p className="text-sm font-bold text-slate-800">Categorias de Orçamento</p>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Defina, Classifique e organize suas propostas comerciais criando categorias sob-medida que agora possuem uma <strong className="text-blue-700">Tela/Aba dedicada de Gestão de Categorias</strong> no menu lateral para facilitar o seu dia a dia.
                      </p>
                    </div>
                  </div>
                  <button
                    id="btn_view_categories_tab_redirect"
                    type="button"
                    onClick={() => setActiveTab('categories')}
                    className="bg-blue-650 hover:bg-blue-700 text-white rounded-lg text-xs font-bold px-4.5 py-3 transition shrink-0 flex items-center gap-2 cursor-pointer shadow-sm hover:shadow active:scale-97"
                  >
                    <span>Ir Para Categorias</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'categories' && (
              <motion.div
                key="categories_tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6 flex-1 min-w-0"
              >
                {/* Header card */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 text-slate-900">
                    <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                      <Tag className="h-6 w-6 text-blue-600" />
                      <span>Categorias de Orçamento</span>
                    </h2>
                    <p className="text-xs text-slate-500 font-sans">
                      Adicione, edite ou remova as categorias estruturais usadas para classificar e organizar suas propostas comerciais.
                    </p>
                  </div>
                </div>

                {/* Custom-styled card for budget categories */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                  {/* Feedback Message */}
                  {categorySuccess && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-emerald-50 text-emerald-800 border border-emerald-150 rounded-xl p-4 flex items-start gap-3 shadow-xs"
                    >
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold font-sans font-sans">Sucesso!</p>
                        <p className="text-[11px] text-emerald-700 leading-relaxed font-sans font-sans font-sans">As categorias de orçamento foram salvas com sucesso!</p>
                      </div>
                    </motion.div>
                  )}

                  {categoryError && (
                    <div className="bg-rose-50 text-rose-800 border border-rose-100 rounded-xl p-4 flex items-start gap-3 shadow-xs">
                      <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold font-sans font-sans font-sans font-sans">Erro de Validação</p>
                        <p className="text-[11px] text-rose-700 leading-relaxed font-sans">{categoryError}</p>
                      </div>
                    </div>
                  )}

                  {/* Categories Grid and Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Add Category Form (Col 1-5) */}
                    <div className="col-span-1 md:col-span-5 bg-slate-50/50 p-4 border border-slate-200/55 rounded-xl space-y-4">
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-gray-100 pb-1.5 font-sans">Nova Categoria</h4>
                      
                      <div className="space-y-1.5 font-sans">
                        <label htmlFor="input_new_category" className="text-xs font-bold text-slate-700 block">Nome da Categoria</label>
                        <input 
                          id="input_new_category"
                          type="text"
                          value={newCategoryValue}
                          onChange={(e) => {
                            setNewCategoryValue(e.target.value);
                            setCategoryError('');
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCategory();
                            }
                          }}
                          className="w-full bg-white border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-4.5 py-3 text-xs text-slate-800 transition font-sans"
                          placeholder="Ex: Marketing, Logística"
                        />
                      </div>

                      <button 
                        id="btn_add_category"
                        type="button"
                        onClick={handleAddCategory}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Adicionar Categoria</span>
                      </button>
                    </div>

                    {/* Manage List of categories (Col 6-12) */}
                    <div className="col-span-1 md:col-span-7 space-y-4">
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-gray-100 pb-1.5 font-sans">Categorias Disponíveis</h4>
                      
                      <div className="border border-slate-200/60 rounded-xl overflow-hidden bg-white divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
                        {budgetCategories.map((cat, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3.5 hover:bg-slate-50/50 transition">
                            {editingCategoryIdx === idx ? (
                              <div className="flex items-center gap-2 w-full mr-2" onClick={(e) => e.stopPropagation()}>
                                <input 
                                  id={`input_edit_category_${idx}`}
                                  type="text"
                                  value={editingCategoryValue}
                                  onChange={(e) => setEditingCategoryValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveEditCategory(idx);
                                    if (e.key === 'Escape') setEditingCategoryIdx(null);
                                  }}
                                  className="flex-1 bg-white border border-blue-400 focus:outline-none rounded px-2.5 py-1 text-xs text-slate-800 transition font-sans"
                                  autoFocus
                                />
                                <button 
                                  id={`btn_save_edit_category_${idx}`}
                                  onClick={() => handleSaveEditCategory(idx)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white p-1 rounded transition text-xs font-semibold px-2"
                                >
                                  Salvar
                                </button>
                                <button 
                                  id={`btn_cancel_edit_category_${idx}`}
                                  onClick={() => setEditingCategoryIdx(null)}
                                  className="bg-gray-100 hover:bg-gray-200 text-slate-500 p-1 rounded transition text-xs px-2"
                                >
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center space-x-2.5">
                                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                                  <span className="text-xs font-medium text-slate-700">{cat}</span>
                                  {/* Badge count of budgets using this */}
                                  <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-mono">
                                    {budgets.filter(b => b.category === cat).length} {budgets.filter(b => b.category === cat).length === 1 ? 'orçamento' : 'orçamentos'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button 
                                    id={`btn_trigger_edit_category_${idx}`}
                                    type="button"
                                    onClick={() => {
                                      setEditingCategoryIdx(idx);
                                      setEditingCategoryValue(cat);
                                      setCategoryError('');
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition font-sans"
                                    title="Editar categoria"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </button>
                                  <button 
                                    id={`btn_trigger_delete_category_${cat}`}
                                    type="button"
                                    onClick={() => handleDeleteCategoryRequest(cat)}
                                    disabled={budgetCategories.length <= 1}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 font-sans"
                                    title={budgetCategories.length <= 1 ? "Precisa manter pelo menos 1 categoria" : "Deletar categoria"}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'receipts' && (
              <motion.div
                key="receipts_view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6 flex-1 min-w-0"
              >
                {/* Header card */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                      <Receipt className="h-6 w-6 text-blue-600" />
                      <span>Emissão & Gestão de Recibos</span>
                    </h2>
                    <p className="text-xs text-slate-500 font-sans">
                      Emita recibos financeiros oficiais integrados a seus orçamentos e clientes, imprimindo ou gerando PDFs corporativos.
                    </p>
                  </div>
                  <button
                    id="btn_new_receipt_trigger"
                    type="button"
                    onClick={() => {
                      handleResetReceiptForm();
                      // Auto prefill form with next receipt number
                      const nextNum = `REC-${new Date().getFullYear()}-${String(receipts.length + 1).padStart(4, '0')}`;
                      setNewReceiptNumber(nextNum);
                      setEditingReceiptId('new'); // Flag value to explicitly display form
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold px-4 py-2.5 flex items-center gap-2 transition shadow-xs cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Emitir Novo Recibo</span>
                  </button>
                </div>

                {/* Form layout (visible when editingReceiptId is active or 'new') */}
                {editingReceiptId !== null && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-white border-2 border-blue-500/30 rounded-xl p-6 shadow-md space-y-6"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          {editingReceiptId === 'new' ? 'Nova Emissão de Recibo' : `Editar Recibo #${newReceiptNumber}`}
                        </h3>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Conexão financeira direta</p>
                      </div>
                      <button
                        id="btn_close_receipt_form"
                        onClick={() => setEditingReceiptId(null)}
                        className="text-slate-400 hover:text-slate-600 text-xs font-bold px-2.5 py-1 rounded-md hover:bg-gray-100 transition"
                      >
                        Fechar
                      </button>
                    </div>

                    {receiptError && (
                      <div className="bg-rose-50 text-rose-800 border border-rose-100 rounded-xl p-4 flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold font-sans">Campos Necessários</p>
                          <p className="text-[11px] text-rose-700 leading-relaxed font-sans">{receiptError}</p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                      {/* VINCULADOR DE ORÇAMENTOS */}
                      <div className="md:col-span-4 space-y-1.5 font-sans">
                        <label htmlFor="receipt_select_budget" className="text-xs font-bold text-slate-700 block">Vincular a Orçamento Existente (Opcional)</label>
                        <select 
                          id="receipt_select_budget"
                          value={newReceiptBudgetId}
                          onChange={(e) => handleSelectReceiptBudget(e.target.value)}
                          className="w-full bg-slate-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-800 transition"
                        >
                          <option value="">-- Escolher Orçamento --</option>
                          {budgets.map(b => (
                            <option key={b.id} value={b.id}>
                              #{b.id} - R$ {b.total.toLocaleString('pt', {minimumFractionDigits: 2})} ({b.title})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* VINCULADOR DE CLIENTES */}
                      <div className="md:col-span-4 space-y-1.5 font-sans">
                        <label htmlFor="receipt_select_client" className="text-xs font-bold text-slate-700 block">Vincular a Cliente do Banco (Opcional)</label>
                        <select 
                          id="receipt_select_client"
                          value={newReceiptClientId}
                          onChange={(e) => handleSelectReceiptClient(e.target.value)}
                          className="w-full bg-slate-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-800 transition"
                        >
                          <option value="">-- Escolher Cliente --</option>
                          {clients.map(c => (
                            <option key={c.id} value={c.id}>{c.nome} ({c.documento})</option>
                          ))}
                        </select>
                      </div>

                      {/* NÚMERO DO RECIBO */}
                      <div className="md:col-span-4 space-y-1.5 font-sans">
                        <label htmlFor="receipt_number_input" className="text-xs font-bold text-slate-700 block">Número do Recibo</label>
                        <input 
                          id="receipt_number_input"
                          type="text"
                          value={newReceiptNumber}
                          onChange={(e) => setNewReceiptNumber(e.target.value)}
                          className="w-full bg-slate-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-800 font-mono transition"
                          placeholder="Ex: REC-2026-0001"
                        />
                      </div>

                      {/* CLIENTE / PAGADOR */}
                      <div className="md:col-span-6 space-y-1.5 font-sans">
                        <label htmlFor="receipt_payer_name" className="text-xs font-bold text-slate-700 block">Nome do Cliente / Pagador</label>
                        <input 
                          id="receipt_payer_name"
                          type="text"
                          value={newReceiptClientName}
                          onChange={(e) => setNewReceiptClientName(e.target.value)}
                          className="w-full bg-white border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-800 transition"
                          placeholder="Nome completo ou Razão Social do Pagador"
                        />
                      </div>

                      {/* CNPJ / CPF CLIENTE */}
                      <div className="md:col-span-3 space-y-1.5 font-sans">
                        <label htmlFor="receipt_payer_doc" className="text-xs font-bold text-slate-700 block">CPF ou CNPJ do Cliente</label>
                        <input 
                          id="receipt_payer_doc"
                          type="text"
                          value={newReceiptClientDocument}
                          onChange={(e) => setNewReceiptClientDocument(e.target.value)}
                          className="w-full bg-white border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-800 transition font-mono"
                          placeholder="Ex: 00.000.000/0001-00"
                        />
                      </div>

                      {/* VALOR COBRADO */}
                      <div className="md:col-span-3 space-y-1.5 font-sans">
                        <label htmlFor="receipt_value" className="text-xs font-bold text-slate-700 block">Valor Recebido (R$)</label>
                        <input 
                          id="receipt_value"
                          type="number"
                          value={newReceiptValue || ''}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setNewReceiptValue(val);
                            setNewReceiptValueInWords(valorPorExtenso(val));
                          }}
                          className="w-full bg-white border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-800 transition font-mono"
                          placeholder="0,00"
                        />
                      </div>

                      {/* VALOR POR EXTENSO */}
                      <div className="md:col-span-12 space-y-1.5 font-sans">
                        <label htmlFor="receipt_value_words" className="text-xs font-bold text-slate-700 block">Importância de (Valor por Extenso)</label>
                        <input 
                          id="receipt_value_words"
                          type="text"
                          value={newReceiptValueInWords}
                          onChange={(e) => setNewReceiptValueInWords(e.target.value)}
                          className="w-full bg-slate-50 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-800 transition font-medium"
                          placeholder="Será calculado automaticamente a partir do valor numérico"
                        />
                      </div>

                      {/* DATA DO RECIBO */}
                      <div className="md:col-span-4 space-y-1.5 font-sans">
                        <label htmlFor="receipt_date" className="text-xs font-bold text-slate-700 block">Data de Emissão</label>
                        <input 
                          id="receipt_date"
                          type="date"
                          value={newReceiptDate}
                          onChange={(e) => setNewReceiptDate(e.target.value)}
                          className="w-full bg-white border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-800 transition"
                        />
                      </div>

                      {/* MEIO DE PAGAMENTO */}
                      <div className="md:col-span-4 space-y-1.5 font-sans">
                        <label htmlFor="receipt_payment_method" className="text-xs font-bold text-slate-700 block">Forma de Pagamento</label>
                        <select 
                          id="receipt_payment_method"
                          value={newReceiptPaymentMethod}
                          onChange={(e) => setNewReceiptPaymentMethod(e.target.value)}
                          className="w-full bg-white border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-800 transition"
                        >
                          <option value="Pix">Pix</option>
                          <option value="Dinheiro">Dinheiro</option>
                          <option value="Cartão de Crédito">Cartão de Crédito</option>
                          <option value="Cartão de Débito">Cartão de Débito</option>
                          <option value="Transferência">Transferência Bancária</option>
                          <option value="Boleto">Boleto Bancário</option>
                        </select>
                      </div>

                      {/* STATUS DO RECIBO */}
                      <div className="md:col-span-4 space-y-1.5 font-sans">
                        <label htmlFor="receipt_status" className="text-xs font-bold text-slate-700 block">Situação do Recibo</label>
                        <select 
                          id="receipt_status"
                          value={newReceiptStatus}
                          onChange={(e) => setNewReceiptStatus(e.target.value as any)}
                          className="w-full bg-white border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-800 transition"
                        >
                          <option value="PAGO">Pago (Quitado)</option>
                          <option value="PENDENTE">Pendente (Aguardando compensação)</option>
                          <option value="CANCELADO">Cancelado</option>
                        </select>
                      </div>

                      {/* REFERENTE A / DESCRIÇÃO */}
                      <div className="md:col-span-12 space-y-1.5 font-sans">
                        <label htmlFor="receipt_reference" className="text-xs font-bold text-slate-700 block">Referente a (Descrição detalhada)</label>
                        <textarea 
                          id="receipt_reference"
                          value={newReceiptReference}
                          onChange={(e) => setNewReceiptReference(e.target.value)}
                          className="w-full bg-white border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-800 transition min-h-[70px] resize-y"
                          placeholder="Ex: Referente à prestação de serviços de modernização de sistemas corporativos..."
                        />
                      </div>

                      {/* ASSINATURA */}
                      <div className="md:col-span-6 flex items-center space-x-3 bg-slate-50 p-3 rounded-lg border border-slate-100 font-sans">
                        <input 
                          id="receipt_toggle_signed"
                          type="checkbox"
                          checked={newReceiptIsSigned}
                          onChange={(e) => setNewReceiptIsSigned(e.target.checked)}
                          className="h-4 w-4 bg-white border-gray-300 text-blue-600 focus:ring-blue-500 rounded"
                        />
                        <label htmlFor="receipt_toggle_signed" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                          Incluir Assinatura Digital do Emitente
                        </label>
                      </div>

                      <div className="md:col-span-6 space-y-1.5 font-sans">
                        <label htmlFor="receipt_signature_name" className="text-xs font-bold text-slate-700 block">Nome do Emitente Assinante</label>
                        <input 
                          id="receipt_signature_name"
                          type="text"
                          value={newReceiptSignatureName}
                          disabled={!newReceiptIsSigned}
                          onChange={(e) => setNewReceiptSignatureName(e.target.value)}
                          className="w-full bg-white border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-800 transition disabled:opacity-50 disabled:bg-gray-50"
                          placeholder="Responsável Financeiro"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5 font-sans">
                      <button
                        id="btn_cancel_receipt_action"
                        type="button"
                        onClick={handleResetReceiptForm}
                        className="bg-white hover:bg-gray-150 border border-gray-200 text-slate-700 rounded-lg text-xs font-bold px-4 py-2.5 transition shrink-0 cursor-pointer"
                      >
                        Limpar Formulário
                      </button>
                      <button
                        id="btn_save_receipt_action"
                        type="button"
                        onClick={handleSaveReceipt}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold px-5 py-2.5 transition shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Check className="h-4 w-4" />
                        <span>{editingReceiptId === 'new' ? 'Emitir & Salvar Recibo' : 'Atualizar Dados do Recibo'}</span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Receipts list area */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  {/* Filter and search segment */}
                  <div className="p-5 border-b border-gray-150 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <input
                        id="input_search_receipts"
                        type="text"
                        value={receiptSearchTerm}
                        onChange={(e) => setReceiptSearchTerm(e.target.value)}
                        placeholder="Buscar por cliente, documento ou número do recibo..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-xl text-xs text-slate-700 font-sans shadow-2xs transition"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2 font-sans shrink-0">
                      <span className="text-xs font-bold text-slate-500 font-sans">Total:</span>
                      <span className="text-xs font-mono bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                        {receipts.length} recibos salvos
                      </span>
                    </div>
                  </div>

                  {/* List Container */}
                  <div className="divide-y divide-gray-150">
                    {receipts.filter(r => {
                      if (!receiptSearchTerm.trim()) return true;
                      const term = receiptSearchTerm.toLowerCase();
                      return (
                        r.number.toLowerCase().includes(term) ||
                        r.clientName.toLowerCase().includes(term) ||
                        r.clientDocument.toLowerCase().includes(term) ||
                        (r.reference && r.reference.toLowerCase().includes(term))
                      );
                    }).length === 0 ? (
                      <div className="py-12 text-center text-slate-400 font-sans space-y-2">
                        <Receipt className="h-10 w-10 mx-auto text-slate-300 stroke-1" />
                        <p className="text-xs font-medium">Nenhum recibo de pagamento localizado.</p>
                        <p className="text-[10px] text-slate-400">Insira um novo pelo botão de emissão para alimentar o painel.</p>
                      </div>
                    ) : (
                      receipts
                        .filter(r => {
                          if (!receiptSearchTerm.trim()) return true;
                          const term = receiptSearchTerm.toLowerCase();
                          return (
                            r.number.toLowerCase().includes(term) ||
                            r.clientName.toLowerCase().includes(term) ||
                            r.clientDocument.toLowerCase().includes(term) ||
                            (r.reference && r.reference.toLowerCase().includes(term))
                          );
                        })
                        .map((receipt) => {
                          return (
                            <div key={receipt.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/50 transition duration-150">
                              <div className="space-y-1.5 flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{receipt.number}</span>
                                  <span className="text-xs text-slate-400">•</span>
                                  <span className="text-xs text-slate-500 font-mono font-sans">{receipt.date}</span>
                                  <span className="text-xs text-slate-400">•</span>
                                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">{receipt.paymentMethod}</span>
                                  
                                  {/* STATUS SIGN */}
                                  <span className={cn(
                                    "text-[10px] font-bold px-2 py-0.5 rounded-full",
                                    receipt.status === 'PAGO' && "bg-emerald-50 text-emerald-700 border border-emerald-150",
                                    receipt.status === 'PENDENTE' && "bg-amber-50 text-amber-700 border border-amber-150",
                                    receipt.status === 'CANCELADO' && "bg-rose-50 text-rose-700 border border-rose-150"
                                  )}>
                                    {receipt.status === 'PAGO' ? 'Pago' : receipt.status === 'PENDENTE' ? 'Pendente' : 'Cancelado'}
                                  </span>

                                  {receipt.isSigned && (
                                    <span className="text-[9px] bg-slate-900 text-blue-400 font-mono font-bold px-1.5 py-0.2 rounded border border-slate-700 animate-pulse">
                                      digital_signed
                                    </span>
                                  )}
                                </div>

                                <div className="space-y-0.5">
                                  <h4 className="text-sm font-bold text-slate-900 truncate">{receipt.clientName}</h4>
                                  <p className="text-[11px] text-slate-400 font-mono">CPF/CNPJ: {receipt.clientDocument || 'Não registrado'}</p>
                                </div>

                                <p className="text-xs text-slate-500 line-clamp-1 italic font-sans">
                                  &ldquo;{receipt.reference}&rdquo;
                                </p>
                              </div>

                              <div className="flex items-center gap-4.5 shrink-0 self-end md:self-center font-sans">
                                <div className="text-right font-mono">
                                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Valor Líquido</p>
                                  <p className="text-sm font-black text-slate-900">R$ {receipt.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                </div>

                                <div className="flex items-center gap-1 flex-row">
                                  <button
                                    id={`btn_view_receipt_${receipt.id}`}
                                    onClick={() => handlePrintReceiptTrigger(receipt)}
                                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50/55 rounded-lg transition shrink-0 cursor-pointer"
                                    title="Visualizar e Imprimir"
                                  >
                                    <Printer className="h-4 w-4" />
                                  </button>
                                  <button
                                    id={`btn_edit_receipt_${receipt.id}`}
                                    onClick={() => handleEditReceiptRequest(receipt)}
                                    className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50/55 rounded-lg transition shrink-0 cursor-pointer"
                                    title="Editar Dados"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </button>
                                  <button
                                    id={`btn_delete_receipt_${receipt.id}`}
                                    onClick={() => handleDeleteReceiptRequest(receipt)}
                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0 cursor-pointer"
                                    title="Excluir definitivo"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </section>

      </main>

      {/* MODAL / FLYOUT PANEL: AI PROCUREMENT RECOMMENDATIONS */}
      <AnimatePresence>
        {isAiLoading && (
          <motion.div 
            id="ai_loading_overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          >
            <div id="ai_loading_card" className="bg-white p-6 rounded-xl border border-gray-200 shadow-xl max-w-sm w-full text-center space-y-4">
              <div className="h-12 w-12 rounded-xl bg-slate-900 flex items-center justify-center text-blue-400 mx-auto animate-spin">
                <Sparkles className="h-6 w-6 text-blue-300 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="text-slate-900 font-bold text-sm">Consultando Inteligência Avant It...</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Utilizando o Gemini para segmentar a planilha de despesas, encontrar os melhores fornecedores logísticos brasileiros e desenhar templates de RFP sob medida.
                </p>
              </div>
              <div className="h-1 bg-slate-100 rounded-full w-full overflow-hidden">
                <div className="bg-blue-600 h-full w-1/2 animate-infinite-loading rounded-full" />
              </div>
            </div>
          </motion.div>
        )}

        {/* AI Results Flyout Display */}
        {aiAnalysisResults && aiPromptTargetBudget && (
          <motion.div 
            id="ai_results_overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-end p-4"
          >
            <motion.div 
              id="ai_results_drawer"
              initial={{ x: 100 }}
              animate={{ x: 0 }}
              exit={{ x: 100 }}
              className="bg-white rounded-2xl md:rounded-l-2xl md:rounded-r-none border border-gray-200 bg-linear-to-b from-white to-slate-50 w-full max-w-2xl h-full shadow-2xl flex flex-col justify-between overflow-hidden"
            >
              
              {/* Drawer Top Branding */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-900 text-white">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-blue-600 rounded-lg text-white">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-50">Análise de Economia Avant It IA</h3>
                    <p className="text-[10px] text-blue-300 font-semibold tracking-wider font-mono">MODEL: GEMINI-3.5-FLASH</p>
                  </div>
                </div>
                <button 
                  id="btn_close_ai_overlay"
                  onClick={() => {
                    setAiAnalysisResults(null); 
                    setAiPromptTargetBudget(null);
                  }}
                  className="p-1 bg-slate-800 hover:bg-slate-700/80 rounded-lg transition"
                >
                  <XCircle className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              {/* Drawer Scrollable Body Content */}
              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                
                {/* Save target and meter */}
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-blue-800 font-bold uppercase tracking-widest block font-mono">Potencial Ajuste de Custo</span>
                    <h4 className="text-xl font-bold text-slate-950 mt-1">Até {aiAnalysisResults.savingEstimatePercent}% de Economia</h4>
                    <p className="text-slate-600 text-xs leading-relaxed mt-0.5">Com cotação em lote e seleção direta do mix ideal de fornecedores recomendados abaixo.</p>
                  </div>
                  <div className="h-14 w-14 rounded-full border-4 border-blue-600 flex items-center justify-center font-bold text-blue-700 bg-white">
                    {aiAnalysisResults.savingEstimatePercent}%
                  </div>
                </div>

                {/* Tab layout selector */}
                <div className="flex border-b border-gray-200">
                  <button 
                    id="btn_ai_subtab_insights"
                    onClick={() => setActiveAiTab('insights')} 
                    className={cn(
                      "flex-1 pb-2.5 text-xs font-semibold text-center transition border-b-2",
                      activeAiTab === 'insights' ? "border-blue-600 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-800"
                    )}
                  >
                    Insights e Alertas
                  </button>
                  <button 
                    id="btn_ai_subtab_suppliers"
                    onClick={() => setActiveAiTab('suppliers')} 
                    className={cn(
                      "flex-1 pb-2.5 text-xs font-semibold text-center transition border-b-2",
                      activeAiTab === 'suppliers' ? "border-blue-600 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-800"
                    )}
                  >
                    Corporações Licenciadas
                  </button>
                  <button 
                    id="btn_ai_subtab_whatsapp"
                    onClick={() => setActiveAiTab('whatsapp')} 
                    className={cn(
                      "flex-1 pb-2.5 text-xs font-semibold text-center transition border-b-2",
                      activeAiTab === 'whatsapp' ? "border-blue-600 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-800"
                    )}
                  >
                    WhatsApp RFP
                  </button>
                  <button 
                    id="btn_ai_subtab_email"
                    onClick={() => setActiveAiTab('email')} 
                    className={cn(
                      "flex-1 pb-2.5 text-xs font-semibold text-center transition border-b-2",
                      activeAiTab === 'email' ? "border-blue-600 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-800"
                    )}
                  >
                    E-mail Comercial
                  </button>
                </div>

                {/* Sub Tab Contents */}
                {activeAiTab === 'insights' && (
                  <div id="ai_insights_view animate-fade" className="space-y-3">
                    {aiAnalysisResults.insights.map((ins: string, i: number) => (
                      <div key={i} className="bg-white p-3.5 rounded-xl border border-gray-200 flex items-start space-x-3">
                        <span className="h-5 w-5 bg-blue-50 text-blue-800 ring-1 ring-blue-100 rounded-full flex items-center justify-center font-bold text-xs shrink-0">{i+1}</span>
                        <p className="text-slate-700 text-xs leading-relaxed">{ins}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeAiTab === 'suppliers' && (
                  <div id="ai_suppliers_view animate-fade" className="space-y-2">
                    <p className="text-xs text-slate-500 leading-relaxed mb-1.5">Fornecedores reais no Brasil sugeridos para licitação ou compra direta com vantagens de frota:</p>
                    {aiAnalysisResults.suggestedSuppliers.map((sup: string, i: number) => (
                      <div key={i} className="bg-white p-3.5 rounded-xl border border-gray-200 flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <Building2 className="h-4.5 w-4.5 text-blue-600 shrink-0" />
                          <span className="text-xs font-semibold text-slate-900">{sup}</span>
                        </div>
                        <span className="text-[10px] bg-blue-50 text-blue-750 px-2 py-0.5 rounded uppercase font-bold text-[9px] border border-blue-100/30">RECOMENDADO</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeAiTab === 'whatsapp' && (
                  <div id="ai_whatsapp_view animate-fade" className="space-y-3">
                    <p className="text-xs text-slate-500">Copie e envie instantaneamente via WhatsApp para agilizar cotações:</p>
                    <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 font-mono text-[11px] whitespace-pre-wrap leading-relaxed text-slate-800 relative">
                      {aiAnalysisResults.rfpTemplateWhatsApp}
                    </div>
                    <button
                      id="btn_copy_whatsapp_template"
                      onClick={() => {
                        navigator.clipboard.writeText(aiAnalysisResults.rfpTemplateWhatsApp);
                        alert('Cópia do template do WhatsApp efetuada para o clipboard!');
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center space-x-1 transition shadow-sm"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Copiar Mensagem de WhatsApp</span>
                    </button>
                  </div>
                )}

                {activeAiTab === 'email' && (
                  <div id="ai_email_view animate-fade" className="space-y-3">
                    <p className="text-xs text-slate-500">Envie este termo formal de RFP para o e-mail comercial dos fornecedores:</p>
                    <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 font-mono text-[11px] whitespace-pre-wrap leading-relaxed text-slate-800">
                      {aiAnalysisResults.rfpTemplateEmail}
                    </div>
                    <button
                      id="btn_copy_email_template"
                      onClick={() => {
                        navigator.clipboard.writeText(aiAnalysisResults.rfpTemplateEmail);
                        alert('Template de e-mail copiado profissionalmente!');
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center space-x-1 transition shadow-sm"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      <span>Copiar E-mail Profissional</span>
                    </button>
                  </div>
                )}

              </div>

              {/* Drawer actions bottom */}
              <div className="p-4 bg-slate-50 border-t border-gray-100 flex items-center justify-end">
                <button
                  id="btn_close_ai_overlay_footer"
                  onClick={() => {
                    setAiAnalysisResults(null); 
                    setAiPromptTargetBudget(null);
                  }}
                  className="bg-white hover:bg-gray-100 border border-gray-200 text-slate-800 px-4 py-2 rounded-lg text-xs font-semibold transition"
                >
                  Concluir Análise IA
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}

        {/* ON-SCREEN PREMIUM INTERACTIVE PDF PREVIEW MODAL */}
        {printableBudget && (
          <motion.div
            id="pdf_preview_modal_overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 print:hidden"
          >
            <motion.div
              id="pdf_preview_modal_content"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-100 max-w-4xl w-full rounded-xl border border-gray-200 shadow-2xl flex flex-col overflow-hidden max-h-[92vh]"
            >
              {/* Modal Top Header with Actions */}
              <div className="p-4 bg-white border-b border-gray-255 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs z-10">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Gerador de Orçamentos Dinâmicos</h3>
                    <p className="text-[11px] text-slate-500">Documento de Negócios • ID #{printableBudget.id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="btn_modal_print_action"
                    onClick={() => window.print()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    <span>Baixar PDF / Imprimir</span>
                  </button>
                  <button
                    id="btn_modal_close_action"
                    onClick={() => setPrintableBudget(null)}
                    className="bg-white hover:bg-gray-100 border border-gray-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>
              </div>

              {/* Informative Assist Banner */}
              <div className="bg-blue-50 border-b border-blue-100 p-3.5 px-6 flex items-start space-x-2 text-[11px] text-blue-800 leading-relaxed shadow-inner">
                <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-600" />
                <div>
                  <span className="font-bold uppercase tracking-wider text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded mr-1">Dica de Exportação</span>
                  Para salvar a proposta em formato <strong>PDF oficial</strong>, clique no botão <span className="underline font-semibold text-blue-900">Baixar PDF / Imprimir</span> localizado acima. Na janela de impressão aberta pelo navegador, escolha o destino <strong>{"\"Salvar como PDF\""}</strong> para gerar o arquivo local, ou selecione sua impressora física corporativa para emissão imediata. No menu {"\"Mais Configurações\""}, verifique se a caixa {"\"Gráficos de segundo plano\""} está marcada para manter as cores de destaque e as bordas.
                </div>
              </div>

              {/* Modal Body: Realistic Paper Sheet View */}
              <div className="flex-1 overflow-y-auto p-6 md:p-10 flex justify-center bg-slate-200/40">
                <div className="bg-white w-full max-w-2xl shadow-lg rounded-lg border border-gray-200 p-8 space-y-6 text-slate-800 relative self-start">
                  
                  {/* Decorative corporate accent */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 rounded-bl-full pointer-events-none" />

                  {/* Document Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-gray-150 pb-5 gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest font-mono">DOCUMENTAÇÃO AUTORIZADA</span>
                      <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">PROPOSTA COMERCIAL / ORÇAMENTO</h1>
                      <p className="text-xs text-slate-500 font-mono">ID Único: #{printableBudget.id}</p>
                    </div>
                    <div className="sm:text-right space-y-1 flex flex-col sm:items-end">
                      {companyInfo.logoBase64 ? (
                        <div className="h-10 w-28 relative flex items-center sm:justify-end justify-start mb-1">
                          <img 
                            id="proposal_header_company_logo"
                            src={companyInfo.logoBase64} 
                            alt={companyInfo.nomeFantasia} 
                            className="object-contain max-h-full max-w-full"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center sm:justify-end space-x-1.5 font-bold text-slate-900 font-sans">
                          <div className="w-2.5 h-2.5 bg-blue-600 rounded-sm" />
                          <span className="text-sm font-bold">{companyInfo.nomeFantasia}</span>
                        </div>
                      )}
                      {companyInfo.logoBase64 && (
                        <span className="text-xs font-bold text-slate-900 font-sans block">{companyInfo.nomeFantasia}</span>
                      )}
                      <p className="text-[11px] text-slate-500 font-medium font-sans">{companyInfo.slogan}</p>
                      {companyInfo.cnpj && <p className="text-[10px] text-slate-400 font-mono">CNPJ: {companyInfo.cnpj}</p>}
                      <p className="text-[10px] text-slate-400 font-mono">Emissão: {printableBudget.createdDate}</p>
                    </div>
                  </div>

                  {/* Client Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50/75 p-4 rounded-xl border border-gray-200/60 space-y-2">
                      <div className="flex items-center space-x-1 border-b border-gray-200 pb-1.5">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dados do Cliente</span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 text-xs">{clients.find(c => c.id === printableBudget.clientId)?.nome || 'Cliente em Homologação'}</h4>
                        <p className="text-[11px] text-slate-600 font-mono">CPF/CNPJ: {clients.find(c => c.id === printableBudget.clientId)?.documento}</p>
                        <p className="text-[11px] text-slate-600">E-mail: {clients.find(c => c.id === printableBudget.clientId)?.email || '-'}</p>
                        <p className="text-[11px] text-slate-600">Telefone: {clients.find(c => c.id === printableBudget.clientId)?.telefone || '-'}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50/75 p-4 rounded-xl border border-gray-200/60 space-y-2">
                      <div className="flex items-center space-x-1 border-b border-gray-200 pb-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Logística e Localização</span>
                      </div>
                      <div className="space-y-0.5 text-[11px] text-slate-600">
                        <p className="font-semibold text-slate-800">Endereço de Fornecimento:</p>
                        <p>{clients.find(c => c.id === printableBudget.clientId)?.logradouro}, {clients.find(c => c.id === printableBudget.clientId)?.numero}</p>
                        <p>{clients.find(c => c.id === printableBudget.clientId)?.bairro}</p>
                        <p>{clients.find(c => c.id === printableBudget.clientId)?.uf} - {clients.find(c => c.id === printableBudget.clientId)?.municipio} | CEP {clients.find(c => c.id === printableBudget.clientId)?.cep}</p>
                      </div>
                    </div>
                  </div>

                  {/* General Specifications Banner */}
                  <div className="bg-slate-900 text-white p-3 px-4 rounded-lg flex flex-col sm:flex-row justify-between text-xs gap-1 shadow-sm">
                    <div>
                      <span className="text-[9px] text-blue-300 font-bold uppercase tracking-wider">Título Operacional</span>
                      <p className="font-bold">{printableBudget.title}</p>
                    </div>
                    <div className="sm:text-right">
                      <span className="text-[9px] text-blue-300 font-bold uppercase tracking-wider">Categoria Estrutural</span>
                      <p className="font-bold">{printableBudget.category}</p>
                    </div>
                  </div>

                  {/* Budget Items Table */}
                  <div className="space-y-1.5">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pb-1 border-b border-gray-100">Cálculo Analítico de Suprimentos</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-300 text-slate-400 font-semibold tracking-wider text-[10px] uppercase">
                            <th className="py-2 pb-1.5">Item Solicitado</th>
                            <th className="py-2 pb-1.5 text-center">Quantidade</th>
                            <th className="py-2 pb-1.5 text-right">Preço Unitário</th>
                            <th className="py-2 pb-1.5 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {printableBudget.items.map((it, i) => (
                            <tr key={i} className="hover:bg-slate-50/50">
                              <td className="py-2.5 font-semibold text-slate-800 max-w-xs truncate">
                                <span className="align-middle">{it.name}</span>
                                {it.tipo && (
                                  <span className={cn(
                                    "ml-2 inline-block text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider",
                                    it.tipo === 'Comodato' 
                                      ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                      : 'bg-blue-50 text-blue-800 border border-blue-200'
                                  )}>
                                    {it.tipo}
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 text-center text-slate-600 font-mono">{it.quantity}</td>
                              <td className="py-2.5 text-right text-slate-600 font-mono">R$ {it.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                              <td className="py-2.5 text-right font-bold text-slate-900 font-mono">R$ {(it.price * it.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Totals Computation Column */}
                  <div className="w-80 ml-auto border-t border-gray-200 pt-4 space-y-1.5 text-right">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Subtotal Geral Bruto:</span>
                      <span className="font-mono">R$ {printableBudget.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    {printableBudget.discount > 0 && (
                      <div className="flex justify-between text-xs text-rose-600 font-semibold">
                        <span>Desconto Promocional:</span>
                        <span className="font-mono">- R$ {printableBudget.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-bold text-slate-950 border-t border-slate-300 pt-2.5">
                      <span>Valor Líquido Total:</span>
                      <span className="font-mono text-blue-600 text-[16px]">R$ {printableBudget.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  {/* Conditions & Notes block */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-150 text-[11px] leading-relaxed">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Modalidade de Faturamento</span>
                      <p className="text-slate-700 font-semibold">{printableBudget.paymentTerms}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Garantias & Observações</span>
                      <p className="text-slate-600 font-medium">{printableBudget.notes || 'Documento sem observações de adendo.'}</p>
                    </div>
                  </div>

                  {/* Small Digital Footer */}
                  <div className="text-center pt-6 border-t border-gray-150 text-[9px] text-slate-300 font-mono uppercase tracking-widest">
                    REPRESENTAÇÃO DIGITAL EXPORTADA VIA PLATAFORMA CORPORATIVA AVANT IT
                  </div>

                </div>
              </div>

              {/* Modal Bottom Footer Actions */}
              <div className="p-4 bg-white border-t border-gray-200 flex items-center justify-between text-xs text-slate-400 font-sans shadow-inner">
                <div className="flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span>Ambiente Seguro SSL</span>
                </div>
                <span>Versão para Impressão Autêntica / PDF • ESC para fechar</span>
              </div>

            </motion.div>
          </motion.div>
        )}

        {/* ON-SCREEN PREMIUM RECEIPT PREVIEW MODAL */}
        {printableReceipt && (
          <motion.div
            id="receipt_preview_modal_overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 print:hidden"
          >
            <motion.div
              id="receipt_preview_modal_content"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-50 max-w-2xl w-full rounded-xl border border-gray-200 shadow-2xl flex flex-col overflow-hidden max-h-[92vh]"
            >
              <div className="p-4 bg-white border-b border-gray-150 flex items-center justify-between shadow-xs z-10 font-sans">
                <div className="flex items-center space-x-2">
                  <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Visualização de Recibo</h3>
                    <p className="text-[11px] text-slate-500">Número do Registro: {printableReceipt.number}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="btn_receipt_modal_print"
                    onClick={() => window.print()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Imprimir Recibo</span>
                  </button>
                  <button
                    id="btn_receipt_modal_close"
                    onClick={() => setPrintableReceipt(null)}
                    className="bg-white hover:bg-gray-100 border border-gray-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>
              </div>

              {/* Dynamic scrollable printableReceipt layout body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
                {/* Physical-style receipt block */}
                <div className="bg-white p-8 rounded-xl border border-gray-300 shadow-sm relative space-y-6 min-h-[350px]">
                  {/* Decorative subtle header lines */}
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-blue-600 rounded-t-xl" />

                  {/* Header */}
                  <div className="flex justify-between items-start border-b border-gray-200 pb-5">
                    <div>
                      <h4 className="text-xl font-black text-slate-900 italic tracking-tight">{companyInfo.nomeFantasia}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">CNPJ: {companyInfo.cnpj}</p>
                      <p className="text-[10px] text-slate-500">{companyInfo.logradouro}, {companyInfo.numero} - {companyInfo.bairro}</p>
                      <p className="text-[10px] text-slate-500">{companyInfo.municipio}/{companyInfo.uf} - {companyInfo.email}</p>
                    </div>
                    <div className="text-right">
                      <div className="bg-blue-50 border border-blue-200 rounded px-3 py-1.5 inline-block text-right">
                        <span className="text-[10px] text-blue-700 font-bold block uppercase tracking-wide">Valor do Recibo</span>
                        <span className="text-base font-black text-blue-900 font-mono">R$ {printableReceipt.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono mt-1.5">No Registro: {printableReceipt.number}</p>
                    </div>
                  </div>

                  {/* Document Title */}
                  <div className="text-center font-sans">
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest border-y border-gray-100 py-2">Recibo de Pagamento</h2>
                  </div>

                  {/* Receipt description statement */}
                  <div className="text-xs leading-relaxed text-slate-700 space-y-3 font-sans">
                    <p>
                      Recebemos de <strong className="text-slate-900 font-bold">{printableReceipt.clientName}</strong>
                      {printableReceipt.clientDocument && (
                        <span>, inscrito(a) sob o CPF/CNPJ <strong className="text-slate-900 font-mono font-bold">{printableReceipt.clientDocument}</strong></span>
                      )}
                      , a importância líquida de:
                    </p>
                    
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 italic text-slate-900 font-bold text-center">
                      * ( {printableReceipt.valueInWords} ) *
                    </div>

                    <p>
                      Referente a: <strong className="text-slate-800">{printableReceipt.reference}</strong>
                    </p>
                    
                    <p>
                      Para maior clareza, firmamos o presente recibo dando plena, geral e irrevogável quitação do valor recebido por meio de <strong className="text-blue-800 font-bold">{printableReceipt.paymentMethod}</strong>.
                    </p>
                  </div>

                  {/* Date and Signature Area */}
                  <div className="pt-8 flex flex-col sm:flex-row justify-between items-end gap-6 font-sans">
                    <div className="text-[11px] text-slate-500">
                      <p>{companyInfo.municipio || 'São Paulo'}, {printableReceipt.date.split('-').reverse().join('/')}</p>
                    </div>
                    
                    {printableReceipt.isSigned && (
                      <div className="text-center w-52 border-t border-slate-300 pt-2 self-center sm:self-end">
                        <p className="text-xs font-bold text-slate-900">{printableReceipt.signatureName || 'Representante Autorizado'}</p>
                        <p className="text-[9px] text-slate-400 uppercase tracking-wider font-mono">Emitente Assinado</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal footer information */}
              <div className="p-4 bg-white border-t border-gray-200 flex items-center justify-between text-xs text-slate-400 font-sans shadow-inner">
                <div className="flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span>Emissão Financeira Segura</span>
                </div>
                <span>Pressione ESC ou clique em Fechar</span>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* CUSTOM IN-APP DELETE CONFIRMATION MODAL (Highly reliable in iframe wrappers) */}
        {deleteConfirmTarget && (
          <motion.div
            id="delete_confirm_modal_overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 print:hidden"
          >
            <motion.div
              id="delete_confirm_modal_content"
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white max-w-md w-full rounded-xl border border-gray-200 shadow-2xl overflow-hidden"
            >
              <div className="p-5 flex items-start space-x-3.5">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-lg shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="space-y-1 text-left">
                  <h3 className="text-sm font-bold text-slate-900 text-left">Confirmar Exclusão</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Você tem certeza de que deseja excluir permanentemente {
                      deleteConfirmTarget.type === 'budget' ? 'o orçamento' :
                      deleteConfirmTarget.type === 'client' ? 'o cliente' :
                      deleteConfirmTarget.type === 'category' ? 'a categoria de orçamento' :
                      'o fornecedor'
                    } <strong className="font-semibold text-slate-800">{"\""}{deleteConfirmTarget.title}{"\""}</strong>?
                  </p>
                  {deleteConfirmTarget.type === 'client' && (
                    <p className="text-[10px] text-amber-600 font-medium">
                      * Nota: Os orçamentos existentes associados a este cliente permanecerão salvos no sistema.
                    </p>
                  )}
                  {deleteConfirmTarget.type === 'category' && (
                    <p className="text-[10px] text-amber-600 font-medium">
                      * Nota: Os orçamentos pertencentes a esta categoria serão reclassificados de forma segura para outra categoria disponível (ex: &quot;Outros&quot;).
                    </p>
                  )}
                  <p className="text-[10px] text-slate-400">Esta ação é irreversível.</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-gray-100 flex items-center justify-end space-x-2">
                <button
                  id="btn_cancel_deletion"
                  onClick={() => setDeleteConfirmTarget(null)}
                  className="bg-white hover:bg-gray-100 border border-gray-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  id="btn_confirm_deletion"
                  onClick={executeConfirmedDelete}
                  className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition shadow-xs cursor-pointer scale-100 active:scale-95 duration-100 font-sans"
                >
                  Confirmar Exclusão
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULL PRINT SCREEN INTERFACE LAYOUT FOR GENUINE PDF EXPORTS */}
      {/* This DOM uses Tailwind print: modifiers to completely hide standard dashboards and build an incredibly formatted document when window.print() or file exports is prompted */}
      {printableBudget && (
        <div id="pdf_invoice_printing_board" className="hidden print:block absolute inset-0 bg-white p-8 text-black z-50">
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              @page {
                size: auto;
                margin: 15mm;
              }
              body {
                margin: 0px;
              }
            }
          ` }} />
          
          {/* Header printable */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight uppercase">PROPOSTA COMERCIAL / ORÇAMENTO</h1>
              <p className="text-xs text-slate-500 font-mono mt-0.5">Identificação Digital: #{printableBudget.id}</p>
            </div>
            <div className="text-right flex flex-col items-end">
              {companyInfo.logoBase64 ? (
                <div className="h-10 w-28 relative flex items-center justify-end mb-1">
                  <img 
                    id="pdf_print_company_logo"
                    src={companyInfo.logoBase64} 
                    alt={companyInfo.nomeFantasia} 
                    className="object-contain max-h-full max-w-full"
                  />
                </div>
              ) : null}
              <h2 className="text-lg font-bold">{companyInfo.nomeFantasia}</h2>
              <p className="text-xs text-slate-600">{companyInfo.slogan}</p>
              {companyInfo.cnpj && <p className="text-[10px] text-slate-500 font-mono">CNPJ: {companyInfo.cnpj}</p>}
              <p className="text-[10px] text-slate-500 font-mono mt-0.5 font-sans">Data: {printableBudget.createdDate}</p>
            </div>
          </div>

          {/* Client Details Section in PDF */}
          <div className="grid grid-cols-2 gap-4 my-6">
            <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
              <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">Dados do Cliente</span>
              <h3 className="font-bold text-xs">{clients.find(c => c.id === printableBudget.clientId)?.nome || 'Cliente em Homologação'}</h3>
              <p className="text-[10px] text-slate-600">Documento: {clients.find(c => c.id === printableBudget.clientId)?.documento}</p>
              <p className="text-[10px] text-slate-600">E-mail: {clients.find(c => c.id === printableBudget.clientId)?.email || '-'}</p>
              <p className="text-[10px] text-slate-600">Telefone: {clients.find(c => c.id === printableBudget.clientId)?.telefone || '-'}</p>
            </div>

            <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
              <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider font-mono">Logística de Entrega</span>
              <p className="text-[10px] text-slate-700">UF / Município: {clients.find(c => c.id === printableBudget.clientId)?.uf} - {clients.find(c => c.id === printableBudget.clientId)?.municipio}</p>
              <p className="text-[10px] text-slate-600">CEP: {clients.find(c => c.id === printableBudget.clientId)?.cep}</p>
              <p className="text-[10px] text-slate-600">Logradouro: {clients.find(c => c.id === printableBudget.clientId)?.logradouro}, {clients.find(c => c.id === printableBudget.clientId)?.numero}</p>
              <p className="text-[10px] text-slate-600">Bairro: {clients.find(c => c.id === printableBudget.clientId)?.bairro}</p>
            </div>
          </div>

          {/* Proposal Summary Title */}
          <div className="bg-slate-900 text-white p-3 rounded font-semibold text-xs my-4 uppercase">
            Especificações Gerais: {printableBudget.title} / Categoria {printableBudget.category}
          </div>

          {/* Invoice Items Table printable */}
          <table className="w-full text-xs text-left border-collapse my-6">
            <thead>
              <tr className="border-b-2 border-slate-400 font-bold uppercase text-slate-700">
                <th className="py-2">Item Vinculado</th>
                <th className="py-2 text-center">Quantidade</th>
                <th className="py-2 text-right">Unitário (R$)</th>
                <th className="py-2 text-right">Subtotal (R$)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {printableBudget.items.map((it, i) => (
                <tr key={i}>
                  <td className="py-2.5 font-medium">
                    <span className="align-middle">{it.name}</span>
                    {it.tipo && (
                      <span className={cn(
                        "ml-2 inline-block text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider",
                        it.tipo === 'Comodato' 
                          ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                          : 'bg-blue-50 text-blue-800 border border-blue-200'
                      )}>
                        {it.tipo}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 text-center font-mono">{it.quantity}</td>
                  <td className="py-2.5 text-right font-mono">R$ {it.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 text-right font-mono">R$ {(it.price * it.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals computation printable representation */}
          <div className="w-full md:w-80 ml-auto border-t-2 border-slate-900 pt-4 space-y-1 text-right">
            <div className="flex justify-between text-xs font-semibold text-slate-600">
              <span>Subtotal Bruto:</span>
              <span className="font-mono">R$ {printableBudget.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            {printableBudget.discount > 0 && (
              <div className="flex justify-between text-xs font-semibold text-rose-600">
                <span>Desconto Aplicado:</span>
                <span className="font-mono">- R$ {printableBudget.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-slate-950 border-t border-slate-300 pt-2">
              <span>Valor Líquido Total:</span>
              <span className="font-mono">R$ {printableBudget.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-12 pt-6 border-t border-slate-200">
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">Condições de Faturamento</span>
              <p className="text-[10px] text-slate-700 leading-relaxed font-semibold">{printableBudget.paymentTerms}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">Observações Importantes</span>
              <p className="text-[10px] text-slate-600 leading-relaxed">{printableBudget.notes || 'Sem observações adicionais.'}</p>
            </div>
          </div>

          <p className="text-[9px] text-slate-400 text-center font-mono mt-16 uppercase">
            Documento emitido eletronicamente via Avant It System e persistido localmente de forma criptográfica.
          </p>
        </div>
      )}

      {printableReceipt && (
        <div id="pdf_receipt_printing_board" className="hidden print:block absolute inset-0 bg-white p-12 text-black z-50 font-sans">
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              @page {
                size: auto;
                margin: 15mm;
              }
              body {
                margin: 0px;
              }
            }
          ` }} />
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-950 pb-5">
            <div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{companyInfo.nomeFantasia}</h1>
              <p className="text-xs text-slate-500 font-mono">CNPJ: {companyInfo.cnpj}</p>
              <p className="text-[10px] text-slate-500">{companyInfo.logradouro}, {companyInfo.numero} - {companyInfo.bairro}</p>
              <p className="text-[10px] text-slate-500">{companyInfo.municipio}/{companyInfo.uf} - {companyInfo.email}</p>
            </div>
            <div className="text-right">
              <div className="bg-slate-100 border-2 border-slate-950 rounded px-4 py-2 inline-block text-right">
                <span className="text-[10px] text-slate-900 font-bold block uppercase tracking-wide">Valor do Recibo</span>
                <span className="text-lg font-black text-slate-950 font-mono">R$ {printableReceipt.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <p className="text-xs text-slate-800 font-mono font-bold mt-2">Registro No: {printableReceipt.number}</p>
            </div>
          </div>

          {/* Document Title */}
          <div className="text-center my-10">
            <h2 className="text-xl font-black text-slate-950 uppercase tracking-widest border-y-2 border-slate-950 py-3">Recibo de Pagamento</h2>
          </div>

          {/* Receipt description statement */}
          <div className="text-sm leading-relaxed text-slate-800 space-y-5 font-sans my-8">
            <p>
              Recebemos de <strong className="text-slate-950 font-bold">{printableReceipt.clientName}</strong>
              {printableReceipt.clientDocument && (
                <span>, inscrito(a) sob o CPF/CNPJ <strong className="text-slate-950 font-mono font-bold">{printableReceipt.clientDocument}</strong></span>
              )}
              , a importância líquida de:
            </p>
            
            <div className="bg-slate-50 p-4 rounded-lg border-2 border-slate-200 italic text-slate-950 font-bold text-center text-sm">
              * ( {printableReceipt.valueInWords} ) *
            </div>

            <p>
              Referente a: <strong className="text-slate-950">{printableReceipt.reference}</strong>
            </p>
            
            <p>
              Para maior clareza, firmamos o presente recibo dando plena, geral e irrevogável quitação do valor recebido por meio de <strong className="text-slate-900 font-bold">{printableReceipt.paymentMethod}</strong>.
            </p>
          </div>

          {/* Date and Signature Area */}
          <div className="pt-12 flex justify-between items-end gap-6 my-12">
            <div className="text-xs text-slate-600">
              <p>{companyInfo.municipio || 'São Paulo'}, {printableReceipt.date.split('-').reverse().join('/')}</p>
            </div>
            
            {printableReceipt.isSigned && (
              <div className="text-center w-64 border-t-2 border-slate-950 pt-2 font-sans">
                <p className="text-xs font-bold text-slate-950">{printableReceipt.signatureName || 'Representante Autorizado'}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Assinante Emitente</p>
              </div>
            )}
          </div>

          <div className="text-center pt-20 border-t border-slate-350 text-[9px] text-slate-400 font-mono uppercase tracking-widest">
            REGISTRO TRIBUTÁRIO PROCESSADO AUTOMATICAMENTE VIA SISTEMA DE ORÇAMENTOS & RECIBOS AVANT IT
          </div>
        </div>
      )}

      {/* FOOTER CORPORATIVE */}
      <footer className="mt-auto bg-white border-t border-slate-200/50 py-5 text-center text-xs text-slate-500 print:hidden">
        <p>© 2026 Avant It System - Gestão Comercial de Orçamentos & Cadeias Integradoras. Todos os direitos reservados.</p>
        <p className="text-[10px] text-slate-400 font-mono mt-1">Conectado sob ambiente de homologação • Versão 3.5-Flash Ativa</p>
      </footer>

    </div>
  );
}
