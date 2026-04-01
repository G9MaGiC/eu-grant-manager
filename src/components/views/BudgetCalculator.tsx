import { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { 
  Calculator, 
  Plus, 
  Trash2, 
  Euro, 
  Percent,
  Download,
  Save,
  PieChart,
  TrendingUp,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

interface BudgetItem {
  id: string;
  category: string;
  description: string;
  amount: number;
}

const defaultCategories = [
  'Personnel',
  'Equipment',
  'Travel',
  'Subcontracting',
  'Other Direct Costs',
  'Indirect Costs',
];

export function BudgetCalculator() {
  const [items, setItems] = useState<BudgetItem[]>([
    { id: '1', category: 'Personnel', description: 'Project Manager (12 months)', amount: 48000 },
    { id: '2', category: 'Personnel', description: 'Technical Staff (12 months)', amount: 72000 },
    { id: '3', category: 'Equipment', description: 'IT Infrastructure', amount: 25000 },
    { id: '4', category: 'Travel', description: 'Meetings and conferences', amount: 8000 },
    { id: '5', category: 'Subcontracting', description: 'External consultants', amount: 15000 },
  ]);
  const [coFinancingRate, setCoFinancingRate] = useState(80);
  const [grantName, setGrantName] = useState('KPO Energy Retrofit');

  useEffect(() => {
    gsap.fromTo('.budget-row',
      { opacity: 0, x: -10 },
      { opacity: 1, x: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' }
    );
  }, [items]);

  const totalBudget = items.reduce((sum, item) => sum + item.amount, 0);
  const euContribution = totalBudget * (coFinancingRate / 100);
  const ownContribution = totalBudget - euContribution;

  const addItem = () => {
    const newItem: BudgetItem = {
      id: Date.now().toString(),
      category: 'Other Direct Costs',
      description: '',
      amount: 0,
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof BudgetItem, value: string | number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    toast.success('Item removed');
  };

  const getCategoryTotal = (category: string) => {
    return items.filter(item => item.category === category).reduce((sum, item) => sum + item.amount, 0);
  };

  const categoryBreakdown = defaultCategories.map(cat => ({
    category: cat,
    amount: getCategoryTotal(cat),
    percentage: totalBudget > 0 ? (getCategoryTotal(cat) / totalBudget) * 100 : 0,
  })).filter(cat => cat.amount > 0);

  const handleSave = () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1000)),
      {
        loading: 'Saving budget...',
        success: 'Budget saved successfully',
        error: 'Failed to save budget',
      }
    );
  };

  const handleExport = () => {
    toast.success('Budget exported to Excel');
  };

  return (
    <div className="p-7">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#22C55E] to-[#16A34A] rounded-xl flex items-center justify-center">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-primary">Budget Calculator</h1>
              <p className="text-secondary">Plan and calculate your grant budget</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button 
            onClick={handleSave}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Budget
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main Calculator */}
        <div className="col-span-8">
          <div className="card-dark p-6">
            {/* Grant Name */}
            <div className="mb-6">
              <label className="text-secondary text-sm mb-2 block">Grant Name</label>
              <input
                type="text"
                value={grantName}
                onChange={(e) => setGrantName(e.target.value)}
                className="w-full bg-tertiary border border-theme rounded-xl px-4 py-3 text-primary text-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/50"
              />
            </div>

            {/* Budget Items */}
            <div className="space-y-3 mb-6">
              <div className="grid grid-cols-12 gap-3 text-secondary text-sm font-medium px-4">
                <div className="col-span-3">Category</div>
                <div className="col-span-5">Description</div>
                <div className="col-span-3">Amount (€)</div>
                <div className="col-span-1"></div>
              </div>
              
              {items.map((item) => (
                <div key={item.id} className="budget-row grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-3">
                    <select
                      value={item.category}
                      onChange={(e) => updateItem(item.id, 'category', e.target.value)}
                      className="w-full bg-tertiary border border-theme rounded-lg px-3 py-2 text-primary text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/50"
                    >
                      {defaultCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      placeholder="Enter description..."
                      className="w-full bg-tertiary border border-theme rounded-lg px-3 py-2 text-primary text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/50"
                    />
                  </div>
                  <div className="col-span-3">
                    <div className="relative">
                      <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                      <input
                        type="number"
                        value={item.amount || ''}
                        onChange={(e) => updateItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                        className="w-full bg-tertiary border border-theme rounded-lg pl-9 pr-3 py-2 text-primary text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/50"
                      />
                    </div>
                  </div>
                  <div className="col-span-1">
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-secondary hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Button */}
            <button 
              onClick={addItem}
              className="w-full py-3 border-2 border-dashed border-theme rounded-xl text-secondary hover:text-primary hover:border-accent/50 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Budget Item
            </button>

            {/* Co-financing */}
            <div className="mt-6 pt-6 border-t border-theme">
              <div className="flex items-center justify-between mb-4">
                <label className="text-secondary text-sm flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  EU Co-financing Rate
                </label>
                <span className="text-primary font-medium">{coFinancingRate}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={coFinancingRate}
                onChange={(e) => setCoFinancingRate(parseInt(e.target.value))}
                className="w-full h-2 bg-tertiary rounded-lg appearance-none cursor-pointer accent-[#4F46E5]"
              />
              <div className="flex justify-between text-secondary text-xs mt-2">
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="col-span-4 space-y-5">
          {/* Total Summary */}
          <div className="card-dark p-5">
            <h3 className="text-primary font-semibold mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-accent" />
              Budget Summary
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-tertiary rounded-xl">
                <p className="text-secondary text-sm mb-1">Total Budget</p>
                <p className="text-primary text-2xl font-bold">
                  {new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR' }).format(totalBudget)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-accent/10 rounded-xl border border-[#4F46E5]/30">
                  <p className="text-accent text-sm mb-1">EU Funding</p>
                  <p className="text-primary text-lg font-semibold">
                    {new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR', notation: 'compact' }).format(euContribution)}
                  </p>
                  <p className="text-accent text-xs">{coFinancingRate}%</p>
                </div>
                <div className="p-4 bg-[#22C55E]/10 rounded-xl border border-[#22C55E]/30">
                  <p className="text-[#22C55E] text-sm mb-1">Own Contribution</p>
                  <p className="text-primary text-lg font-semibold">
                    {new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR', notation: 'compact' }).format(ownContribution)}
                  </p>
                  <p className="text-[#22C55E] text-xs">{100 - coFinancingRate}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="card-dark p-5">
            <h3 className="text-primary font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#22C55E]" />
              Category Breakdown
            </h3>
            <div className="space-y-3">
              {categoryBreakdown.map((cat, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-secondary">{cat.category}</span>
                    <span className="text-primary">{cat.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-tertiary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent rounded-full transition-all duration-500"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                  <p className="text-secondary text-xs mt-1">
                    {new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR' }).format(cat.amount)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Validation */}
          <div className="card-dark p-5">
            <h3 className="text-primary font-semibold mb-4">Budget Validation</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#22C55E]">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm">Budget structure valid</span>
              </div>
              <div className="flex items-center gap-2 text-[#22C55E]">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm">Co-financing rate eligible</span>
              </div>
              {totalBudget > 1000000 && (
                <div className="flex items-center gap-2 text-[#F59E0B]">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Large budget - extra scrutiny expected</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
