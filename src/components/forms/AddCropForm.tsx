import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface AddCropFormProps {
  onSubmit: (data: { name: string; targetIncome: number; icon: string }) => Promise<void>;
}

const COMMON_ICONS = ['🌾', '🌽', '🍅', '🥔', '🍎', '🍇', '☕', '🥜', '🌰', '🥥', '🌴', '🌳'];

export function AddCropForm({ onSubmit }: AddCropFormProps) {
  const [name, setName] = useState('');
  const [targetIncome, setTargetIncome] = useState('');
  const [icon, setIcon] = useState(COMMON_ICONS[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetIncome) return;
    
    try {
      setLoading(true);
      await onSubmit({
        name,
        targetIncome: Number(targetIncome),
        icon
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Crop Name</label>
        <input 
          type="text" 
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Wheat, Tomatoes"
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Target Income</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
          <input 
            type="number" 
            required
            min="0"
            step="1000"
            value={targetIncome}
            onChange={(e) => setTargetIncome(e.target.value)}
            placeholder="0"
            className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Icon</label>
        <div className="grid grid-cols-6 gap-2">
          {COMMON_ICONS.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIcon(i)}
              className={`text-2xl p-2 rounded-lg border flex items-center justify-center transition-colors ${
                icon === i ? 'border-farm-green-500 bg-farm-green-50 scale-105 shadow-sm' : 'border-gray-100 hover:bg-gray-50'
              }`}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-farm-green-600 text-white rounded-xl font-medium hover:bg-farm-green-700 transition flex items-center justify-center disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
          Save Crop
        </button>
      </div>
    </form>
  );
}
