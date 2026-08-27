import { useState } from 'react';
import { Save, User, MapPin, Globe, Database, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { seedDatabase } from '../lib/db';

export default function Settings() {
  const { user } = useAuth();
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState('');

  const handleSeed = async () => {
    if (!user) return;
    try {
      setSeeding(true);
      setSeedSuccess('');
      await seedDatabase(user.uid);
      setSeedSuccess('Successfully populated database with mock data!');
    } catch (error: any) {
      setSeedSuccess('Failed to seed: ' + error.message);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-farm-green-900">Settings</h1>
        <p className="text-gray-500">Manage your farm profile and app preferences.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <User className="w-5 h-5 text-farm-green-600" /> Farm Profile
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Farm Name</label>
              <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:outline-none" defaultValue="Green Valley Estate" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
              <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:outline-none" defaultValue="John Doe" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location <MapPin className="w-4 h-4 inline text-gray-400" /></label>
            <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:outline-none" defaultValue="Kerala, India" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Globe className="w-5 h-5 text-farm-green-600" /> Regional Settings
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:outline-none">
                <option>INR (₹)</option>
                <option>USD ($)</option>
                <option>EUR (€)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Measurement Unit</label>
              <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:outline-none">
                <option>Kilograms (kg)</option>
                <option>Pounds (lb)</option>
                <option>Tons (t)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Database className="w-5 h-5 text-farm-green-600" /> Database Management
          </h2>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="flex flex-wrap gap-4">
            <button className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition">
              Export Database
            </button>
            <button className="px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg font-medium hover:bg-gray-100 transition">
              Import Database
            </button>
            <button 
              onClick={handleSeed}
              disabled={seeding}
              className="px-4 py-2 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg font-medium hover:bg-yellow-100 transition disabled:opacity-50 flex items-center"
            >
              {seeding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Seed Mock Data (Firebase)
            </button>
          </div>
          {seedSuccess && <p className="text-sm font-medium text-green-600">{seedSuccess}</p>}
        </div>
      </div>

      <div className="flex justify-end">
        <button className="flex items-center px-6 py-2 bg-farm-green-600 text-white rounded-lg font-medium hover:bg-farm-green-700 transition shadow-sm">
          <Save className="w-4 h-4 mr-2" /> Save Changes
        </button>
      </div>
    </div>
  );
}
