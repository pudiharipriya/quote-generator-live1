import React, { useState } from 'react';
import { SupabaseRateConfig, AwsInstanceConfig } from '../../types/pricing';
import {
  DEFAULT_SUPABASE_RATES,
  DEFAULT_AWS_INSTANCES,
} from '../../utils/pricingEngine';
import {
  Database,
  Server,
  Plus,
  Trash2,
  RotateCcw,
  Save,
  Check,
  Edit2,
  DollarSign,
  Cpu,
  HardDrive,
} from 'lucide-react';

interface RateConfigManagerProps {
  supabaseRates: SupabaseRateConfig[];
  setSupabaseRates: (rates: SupabaseRateConfig[]) => void;
  awsInstances: AwsInstanceConfig[];
  setAwsInstances: (instances: AwsInstanceConfig[]) => void;
}

export const RateConfigManager: React.FC<RateConfigManagerProps> = ({
  supabaseRates,
  setSupabaseRates,
  awsInstances,
  setAwsInstances,
}) => {
  const [savedNotice, setSavedNotice] = useState(false);
  const [showAddAwsModal, setShowAddAwsModal] = useState(false);

  // New AWS Instance state
  const [newAwsType, setNewAwsType] = useState('');
  const [newAwsVcpu, setNewAwsVcpu] = useState(2);
  const [newAwsRam, setNewAwsRam] = useState(4);
  const [newAwsHourly, setNewAwsHourly] = useState(0.05);
  const [newAwsStreams, setNewAwsStreams] = useState(6);
  const [newAwsDesc, setNewAwsDesc] = useState('');

  // Handle Supabase rate field edit
  const handleSbChange = (
    plan: string,
    field: keyof SupabaseRateConfig,
    val: number
  ) => {
    const updated = supabaseRates.map((r) => {
      if (r.plan === plan) {
        return { ...r, [field]: val };
      }
      return r;
    });
    setSupabaseRates(updated);
    triggerNotice();
  };

  // Handle AWS rate field edit
  const handleAwsChange = (
    id: string,
    field: keyof AwsInstanceConfig,
    val: number | string
  ) => {
    const updated = awsInstances.map((inst) => {
      if (inst.id === id) {
        const item = { ...inst, [field]: val };
        if (field === 'hourlyRate' && typeof val === 'number') {
          item.monthlyRate = Number((val * 730).toFixed(2));
        }
        return item;
      }
      return inst;
    });
    setAwsInstances(updated);
    triggerNotice();
  };

  // Add new custom AWS instance
  const handleAddAwsInstance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAwsType) return;

    const newInst: AwsInstanceConfig = {
      id: `custom_${newAwsType.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
      instanceType: newAwsType,
      vcpu: Number(newAwsVcpu),
      ramGB: Number(newAwsRam),
      hourlyRate: Number(newAwsHourly),
      monthlyRate: Number((Number(newAwsHourly) * 730).toFixed(2)),
      cameraStreamsSupported: Number(newAwsStreams),
      description: newAwsDesc || 'Custom EC2 instance specification',
    };

    setAwsInstances([...awsInstances, newInst]);
    setShowAddAwsModal(false);
    setNewAwsType('');
    setNewAwsDesc('');
    triggerNotice();
  };

  // Delete AWS instance
  const handleDeleteAws = (id: string) => {
    if (awsInstances.length <= 1) {
      alert('You must keep at least one AWS instance type!');
      return;
    }
    setAwsInstances(awsInstances.filter((i) => i.id !== id));
    triggerNotice();
  };

  // Reset to factory defaults
  const handleResetDefaults = () => {
    if (confirm('Reset all Supabase and AWS rates to factory defaults?')) {
      setSupabaseRates(DEFAULT_SUPABASE_RATES);
      setAwsInstances(DEFAULT_AWS_INSTANCES);
      triggerNotice();
    }
  };

  const triggerNotice = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <span>Rate & Cost Configuration Tables</span>
            {savedNotice && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                Auto-saved
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400">
            Edit infrastructure cost rates for Supabase database/storage and AWS EC2 camera compute instances
          </p>
        </div>

        <button
          onClick={handleResetDefaults}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Factory Rates</span>
        </button>
      </div>

      {/* 1. Supabase Rate Config Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Supabase Pricing Rate Matrix</h3>
          </div>
          <span className="text-xs text-slate-400">Rates applied to Normal & AI/ML CMS</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Plan Tier</th>
                <th className="py-3 px-4">Compute Base Cost ($/mo)</th>
                <th className="py-3 px-4">Included Storage (GB)</th>
                <th className="py-3 px-4">Addl Storage Rate ($/GB)</th>
                <th className="py-3 px-4">Included Bandwidth (GB)</th>
                <th className="py-3 px-4">Addl Bandwidth Rate ($/GB)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {supabaseRates.map((r) => (
                <tr key={r.plan} className="hover:bg-slate-900/40">
                  <td className="py-3 px-4 font-sans font-semibold text-white">
                    <span className="capitalize">{r.plan}</span>
                    <span className="text-xs font-normal text-slate-400 block">{r.name}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="relative w-28">
                      <span className="absolute left-2.5 top-1.5 text-slate-500">$</span>
                      <input
                        type="number"
                        min="0"
                        value={r.computeMonthlyCost}
                        onChange={(e) =>
                          handleSbChange(r.plan, 'computeMonthlyCost', Number(e.target.value))
                        }
                        className="w-full glass-input text-white rounded pl-6 pr-2 py-1 text-xs focus:outline-none"
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      min="0"
                      value={r.includedStorageGB}
                      onChange={(e) =>
                        handleSbChange(r.plan, 'includedStorageGB', Number(e.target.value))
                      }
                      className="w-24 glass-input text-white rounded px-2 py-1 text-xs focus:outline-none"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="relative w-28">
                      <span className="absolute left-2.5 top-1.5 text-slate-500">$</span>
                      <input
                        type="number"
                        step="0.005"
                        min="0"
                        value={r.additionalStoragePerGB}
                        onChange={(e) =>
                          handleSbChange(
                            r.plan,
                            'additionalStoragePerGB',
                            Number(e.target.value)
                          )
                        }
                        className="w-full glass-input text-emerald-400 font-bold rounded pl-6 pr-2 py-1 text-xs focus:outline-none"
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      min="0"
                      value={r.includedBandwidthGB}
                      onChange={(e) =>
                        handleSbChange(r.plan, 'includedBandwidthGB', Number(e.target.value))
                      }
                      className="w-24 glass-input text-white rounded px-2 py-1 text-xs focus:outline-none"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="relative w-28">
                      <span className="absolute left-2.5 top-1.5 text-slate-500">$</span>
                      <input
                        type="number"
                        step="0.005"
                        min="0"
                        value={r.additionalBandwidthPerGB}
                        onChange={(e) =>
                          handleSbChange(
                            r.plan,
                            'additionalBandwidthPerGB',
                            Number(e.target.value)
                          )
                        }
                        className="w-full glass-input text-emerald-400 font-bold rounded pl-6 pr-2 py-1 text-xs focus:outline-none"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. AWS EC2 Rate Config Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="p-4 bg-purple-950/30 border-b border-purple-900/40 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Server className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold text-white">AWS EC2 Instance Rate Table (AI/ML CMS)</h3>
          </div>
          <button
            onClick={() => setShowAddAwsModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Instance</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Instance Type</th>
                <th className="py-3 px-4">vCPU</th>
                <th className="py-3 px-4">RAM (GB)</th>
                <th className="py-3 px-4">Hourly Rate ($/hr)</th>
                <th className="py-3 px-4">Monthly Rate (730h)</th>
                <th className="py-3 px-4">Est. Camera Capacity</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {awsInstances.map((inst) => (
                <tr key={inst.id} className="hover:bg-slate-900/40">
                  <td className="py-3 px-4 font-sans font-semibold text-white">
                    <input
                      type="text"
                      value={inst.instanceType}
                      onChange={(e) => handleAwsChange(inst.id, 'instanceType', e.target.value)}
                      className="glass-input text-white rounded px-2 py-1 text-xs focus:outline-none w-36 font-sans font-bold"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      min="1"
                      value={inst.vcpu}
                      onChange={(e) => handleAwsChange(inst.id, 'vcpu', Number(e.target.value))}
                      className="w-16 glass-input text-white rounded px-2 py-1 text-xs focus:outline-none"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      min="1"
                      value={inst.ramGB}
                      onChange={(e) => handleAwsChange(inst.id, 'ramGB', Number(e.target.value))}
                      className="w-16 glass-input text-white rounded px-2 py-1 text-xs focus:outline-none"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="relative w-28">
                      <span className="absolute left-2 top-1 text-slate-500">$</span>
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={inst.hourlyRate}
                        onChange={(e) =>
                          handleAwsChange(inst.id, 'hourlyRate', Number(e.target.value))
                        }
                        className="w-full glass-input text-emerald-400 font-bold rounded pl-5 pr-2 py-1 text-xs focus:outline-none"
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-400 text-sm">
                    ${inst.monthlyRate.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      min="1"
                      value={inst.cameraStreamsSupported}
                      onChange={(e) =>
                        handleAwsChange(
                          inst.id,
                          'cameraStreamsSupported',
                          Number(e.target.value)
                        )
                      }
                      className="w-20 glass-input text-purple-300 rounded px-2 py-1 text-xs focus:outline-none"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleDeleteAws(inst.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                      title="Delete instance type"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Custom AWS Instance Modal */}
      {showAddAwsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-slate-700 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Server className="w-5 h-5 text-purple-400" />
              <span>Add Custom AWS EC2 Instance Type</span>
            </h3>

            <form onSubmit={handleAddAwsInstance} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Instance Name (e.g. c6i.2xlarge)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. c6i.xlarge"
                  value={newAwsType}
                  onChange={(e) => setNewAwsType(e.target.value)}
                  className="w-full glass-input text-white rounded-lg px-3 py-2 text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    vCPUs
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newAwsVcpu}
                    onChange={(e) => setNewAwsVcpu(Number(e.target.value))}
                    className="w-full glass-input text-white rounded-lg px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    RAM (GB)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newAwsRam}
                    onChange={(e) => setNewAwsRam(Number(e.target.value))}
                    className="w-full glass-input text-white rounded-lg px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Hourly Rate ($/hr)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={newAwsHourly}
                    onChange={(e) => setNewAwsHourly(Number(e.target.value))}
                    className="w-full glass-input text-white rounded-lg px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Monthly (730h)
                  </label>
                  <div className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm font-bold text-emerald-400">
                    ${(newAwsHourly * 730).toFixed(2)}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Est. Camera Feed Capacity
                </label>
                <input
                  type="number"
                  min="1"
                  value={newAwsStreams}
                  onChange={(e) => setNewAwsStreams(Number(e.target.value))}
                  className="w-full glass-input text-white rounded-lg px-3 py-2 text-sm focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAwsModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30"
                >
                  Add Instance Rate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
