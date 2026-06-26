import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Gestão de Orçamentos Inteligente | Avant It Orçamentos',
  description: 'Sistema moderno e inteligente para cadastro de orçamentos, cotações automáticas com fornecedores e controle financeiro avançado.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
