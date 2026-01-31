import { cn } from '@/lib/utils';
import { 
  ClipboardList, 
  BarChart3, 
  Package, 
  AlertTriangle, 
  Percent, 
  FileText 
} from 'lucide-react';

export type TabId = 'comandas' | 'dashboard' | 'estoque' | 'perdas' | 'taxas' | 'relatorios';

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'comandas', label: 'Comandas', icon: <ClipboardList className="w-4 h-4" /> },
  { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'estoque', label: 'Estoque', icon: <Package className="w-4 h-4" /> },
  { id: 'perdas', label: 'Perdas', icon: <AlertTriangle className="w-4 h-4" /> },
  { id: 'taxas', label: 'Taxas', icon: <Percent className="w-4 h-4" /> },
  { id: 'relatorios', label: 'Relatórios', icon: <FileText className="w-4 h-4" /> },
];

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <nav className="flex gap-1 p-2 overflow-x-auto scrollbar-hide bg-secondary/50 border-b border-border">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'tab-button flex items-center gap-2 whitespace-nowrap',
            activeTab === tab.id && 'active'
          )}
        >
          {tab.icon}
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
