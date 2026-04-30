import { useState, useEffect, useCallback } from 'react';
import {
    HiReceiptPercent, HiSparkles, HiClock, HiUserGroup,
    HiPlus, HiPencilSquare, HiTrash, HiXMark, HiCheck,
    HiShieldCheck
} from 'react-icons/hi2';
import axiosInstance from '../../helpers/axiosInstance';
import toast from 'react-hot-toast';

interface PricingRuleConfig {
    minItems?: number;
    discountPercent: number;
    startHour?: number;
    endHour?: number;
    minOrders?: number;
}

interface PricingRule {
    _id: string;
    type: 'bulk' | 'off_peak' | 'loyalty';
    label: string;
    description: string;
    isActive: boolean;
    priority: number;
    config: PricingRuleConfig;
    createdAt: string;
    updatedAt: string;
}

const RULE_TYPES = [
    { value: 'bulk', label: 'Bulk Discount', icon: HiReceiptPercent, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', desc: 'Discount based on number of items' },
    { value: 'off_peak', label: 'Off-Peak', icon: HiClock, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200', desc: 'Discount during off-peak hours' },
    { value: 'loyalty', label: 'Loyalty', icon: HiUserGroup, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', desc: 'Discount for returning customers' },
] as const;

const EMPTY_FORM = {
    type: 'bulk' as 'bulk' | 'off_peak' | 'loyalty',
    label: '',
    description: '',
    isActive: true,
    priority: 10,
    config: {
        discountPercent: 5,
        minItems: 10,
        startHour: 22,
        endHour: 6,
        minOrders: 10,
    },
};

export default function PricingRulesPage() {
    const [rules, setRules] = useState<PricingRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRule, setEditingRule] = useState<PricingRule | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [isSaving, setIsSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const fetchRules = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get('/pricing/rules');
            setRules(data?.data?.rules || []);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to fetch pricing rules');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRules();
    }, [fetchRules]);

    const openCreateModal = () => {
        setEditingRule(null);
        setForm(EMPTY_FORM);
        setShowModal(true);
    };

    const openEditModal = (rule: PricingRule) => {
        setEditingRule(rule);
        setForm({
            type: rule.type,
            label: rule.label,
            description: rule.description,
            isActive: rule.isActive,
            priority: rule.priority,
            config: {
                discountPercent: rule.config.discountPercent,
                minItems: rule.config.minItems || 10,
                startHour: rule.config.startHour ?? 22,
                endHour: rule.config.endHour ?? 6,
                minOrders: rule.config.minOrders || 10,
            },
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.label.trim()) {
            toast.error('Label is required');
            return;
        }

        // Build config based on type
        const config: PricingRuleConfig = {
            discountPercent: form.config.discountPercent,
        };
        if (form.type === 'bulk') config.minItems = form.config.minItems;
        if (form.type === 'off_peak') {
            config.startHour = form.config.startHour;
            config.endHour = form.config.endHour;
        }
        if (form.type === 'loyalty') config.minOrders = form.config.minOrders;

        const payload = {
            type: form.type,
            label: form.label.trim(),
            description: form.description.trim(),
            isActive: form.isActive,
            priority: form.priority,
            config,
        };

        try {
            setIsSaving(true);
            if (editingRule) {
                await axiosInstance.patch(`/pricing/rules/${editingRule._id}`, payload);
                toast.success('Pricing rule updated');
            } else {
                await axiosInstance.post('/pricing/rules', payload);
                toast.success('Pricing rule created');
            }
            setShowModal(false);
            fetchRules();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save rule');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (ruleId: string) => {
        if (!confirm('Delete this pricing rule?')) return;

        try {
            setDeletingId(ruleId);
            await axiosInstance.delete(`/pricing/rules/${ruleId}`);
            toast.success('Pricing rule deleted');
            fetchRules();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete rule');
        } finally {
            setDeletingId(null);
        }
    };

    const handleToggle = async (rule: PricingRule) => {
        try {
            setTogglingId(rule._id);
            await axiosInstance.patch(`/pricing/rules/${rule._id}`, { isActive: !rule.isActive });
            toast.success(`Rule ${rule.isActive ? 'disabled' : 'enabled'}`);
            fetchRules();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to toggle rule');
        } finally {
            setTogglingId(null);
        }
    };

    const getRuleTypeInfo = (type: string) => RULE_TYPES.find(r => r.value === type) || RULE_TYPES[0];

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
            {/* Header */}
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary via-secondary to-primary shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
                <div className="relative z-10">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
                        Smart Pricing Engine 💰
                    </h1>
                    <p className="text-white/80 text-lg md:text-xl font-medium max-w-2xl">
                        Configure dynamic discounts — bulk, off-peak, and loyalty rules applied automatically to student orders.
                    </p>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted font-semibold">
                    {rules.length} rule{rules.length !== 1 ? 's' : ''} configured • {rules.filter(r => r.isActive).length} active
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
                >
                    <HiPlus className="w-5 h-5" />
                    Add Rule
                </button>
            </div>

            {/* Rules Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(n => (
                        <div key={n} className="h-48 rounded-[2rem] bg-accent/10 animate-pulse" />
                    ))}
                </div>
            ) : rules.length === 0 ? (
                <div className="text-center py-16 bg-surface rounded-[2.5rem] border border-accent/20">
                    <HiSparkles className="w-16 h-16 text-muted/20 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-text/70 mb-2">No Pricing Rules Yet</h3>
                    <p className="text-muted text-sm max-w-sm mx-auto mb-6">Create your first discount rule to start offering smart pricing to students.</p>
                    <button
                        onClick={openCreateModal}
                        className="px-6 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all"
                    >
                        Create First Rule
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rules.map(rule => {
                        const typeInfo = getRuleTypeInfo(rule.type);
                        const Icon = typeInfo.icon;
                        return (
                            <div
                                key={rule._id}
                                className={`bg-surface rounded-[2rem] border-2 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group ${
                                    rule.isActive ? 'border-accent/20' : 'border-red-200 opacity-70'
                                }`}
                            >
                                {/* Top row: icon + type badge + actions */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-11 h-11 rounded-2xl ${typeInfo.bg} border ${typeInfo.border} flex items-center justify-center`}>
                                            <Icon className={`w-5 h-5 ${typeInfo.color}`} />
                                        </div>
                                        <div>
                                            <span className={`text-[0.65rem] font-bold uppercase tracking-widest ${typeInfo.color} ${typeInfo.bg} px-2 py-0.5 rounded-full border ${typeInfo.border}`}>
                                                {typeInfo.label}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => openEditModal(rule)}
                                            className="p-2 rounded-lg hover:bg-accent/10 text-muted hover:text-primary transition-colors"
                                            title="Edit"
                                        >
                                            <HiPencilSquare className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(rule._id)}
                                            disabled={deletingId === rule._id}
                                            className="p-2 rounded-lg hover:bg-red-50 text-muted hover:text-red-500 transition-colors disabled:opacity-50"
                                            title="Delete"
                                        >
                                            <HiTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Label + description */}
                                <h3 className="text-lg font-extrabold text-text mb-1 group-hover:text-primary transition-colors">{rule.label}</h3>
                                {rule.description && (
                                    <p className="text-sm text-muted mb-4 line-clamp-2">{rule.description}</p>
                                )}

                                {/* Config details */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted font-medium">Discount</span>
                                        <span className="font-extrabold text-emerald-600">{rule.config.discountPercent}% OFF</span>
                                    </div>
                                    {rule.type === 'bulk' && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted font-medium">Min items</span>
                                            <span className="font-bold text-text">{rule.config.minItems}+</span>
                                        </div>
                                    )}
                                    {rule.type === 'off_peak' && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted font-medium">Hours</span>
                                            <span className="font-bold text-text">{rule.config.startHour}:00 – {rule.config.endHour}:00</span>
                                        </div>
                                    )}
                                    {rule.type === 'loyalty' && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted font-medium">Min orders</span>
                                            <span className="font-bold text-text">{rule.config.minOrders}+</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted font-medium">Priority</span>
                                        <span className="font-bold text-text">{rule.priority}</span>
                                    </div>
                                </div>

                                {/* Active toggle */}
                                <button
                                    onClick={() => handleToggle(rule)}
                                    disabled={togglingId === rule._id}
                                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 disabled:opacity-50 ${
                                        rule.isActive
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                            : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                                    }`}
                                >
                                    {rule.isActive ? (
                                        <><HiCheck className="w-4 h-4" /> Active</>
                                    ) : (
                                        <><HiXMark className="w-4 h-4" /> Disabled</>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ─── Create / Edit Modal ─── */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative bg-surface rounded-[2rem] shadow-2xl border border-accent/20 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-surface px-6 pt-6 pb-4 border-b border-accent/20 z-10 rounded-t-[2rem]">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-extrabold text-text">
                                    {editingRule ? 'Edit Pricing Rule' : 'Create Pricing Rule'}
                                </h3>
                                <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-accent/10 text-muted hover:text-text transition-colors">
                                    <HiXMark className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Rule Type */}
                            <div>
                                <label className="text-sm font-bold text-muted uppercase tracking-wider mb-2 block">Rule Type</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {RULE_TYPES.map(rt => (
                                        <button
                                            key={rt.value}
                                            onClick={() => setForm(f => ({ ...f, type: rt.value }))}
                                            className={`p-3 rounded-xl border-2 text-center transition-all ${
                                                form.type === rt.value
                                                    ? `${rt.border} ${rt.bg} ${rt.color}`
                                                    : 'border-accent/20 hover:border-accent/40'
                                            }`}
                                        >
                                            <rt.icon className={`w-5 h-5 mx-auto mb-1 ${form.type === rt.value ? rt.color : 'text-muted'}`} />
                                            <span className="text-xs font-bold">{rt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Label */}
                            <div>
                                <label className="text-sm font-bold text-muted uppercase tracking-wider mb-2 block">Label *</label>
                                <input
                                    type="text"
                                    value={form.label}
                                    onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                                    placeholder="e.g., Bulk Discount (10+ items)"
                                    className="w-full px-4 py-3 rounded-xl border border-accent/20 bg-bg text-text placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-sm font-bold text-muted uppercase tracking-wider mb-2 block">Description</label>
                                <input
                                    type="text"
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="Student-facing description"
                                    className="w-full px-4 py-3 rounded-xl border border-accent/20 bg-bg text-text placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>

                            {/* Discount Percent */}
                            <div>
                                <label className="text-sm font-bold text-muted uppercase tracking-wider mb-2 block">Discount Percent *</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={form.config.discountPercent}
                                        onChange={e => setForm(f => ({ ...f, config: { ...f.config, discountPercent: Number(e.target.value) } }))}
                                        min={0}
                                        max={100}
                                        className="w-full px-4 py-3 rounded-xl border border-accent/20 bg-bg text-text focus:outline-none focus:border-primary transition-colors pr-10"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted font-bold">%</span>
                                </div>
                            </div>

                            {/* Type-specific config */}
                            {form.type === 'bulk' && (
                                <div>
                                    <label className="text-sm font-bold text-muted uppercase tracking-wider mb-2 block">Min Items Required</label>
                                    <input
                                        type="number"
                                        value={form.config.minItems}
                                        onChange={e => setForm(f => ({ ...f, config: { ...f.config, minItems: Number(e.target.value) } }))}
                                        min={1}
                                        className="w-full px-4 py-3 rounded-xl border border-accent/20 bg-bg text-text focus:outline-none focus:border-primary transition-colors"
                                    />
                                </div>
                            )}

                            {form.type === 'off_peak' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-bold text-muted uppercase tracking-wider mb-2 block">Start Hour (0-23)</label>
                                        <input
                                            type="number"
                                            value={form.config.startHour}
                                            onChange={e => setForm(f => ({ ...f, config: { ...f.config, startHour: Number(e.target.value) } }))}
                                            min={0}
                                            max={23}
                                            className="w-full px-4 py-3 rounded-xl border border-accent/20 bg-bg text-text focus:outline-none focus:border-primary transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-muted uppercase tracking-wider mb-2 block">End Hour (0-23)</label>
                                        <input
                                            type="number"
                                            value={form.config.endHour}
                                            onChange={e => setForm(f => ({ ...f, config: { ...f.config, endHour: Number(e.target.value) } }))}
                                            min={0}
                                            max={23}
                                            className="w-full px-4 py-3 rounded-xl border border-accent/20 bg-bg text-text focus:outline-none focus:border-primary transition-colors"
                                        />
                                    </div>
                                </div>
                            )}

                            {form.type === 'loyalty' && (
                                <div>
                                    <label className="text-sm font-bold text-muted uppercase tracking-wider mb-2 block">Min Completed Orders</label>
                                    <input
                                        type="number"
                                        value={form.config.minOrders}
                                        onChange={e => setForm(f => ({ ...f, config: { ...f.config, minOrders: Number(e.target.value) } }))}
                                        min={1}
                                        className="w-full px-4 py-3 rounded-xl border border-accent/20 bg-bg text-text focus:outline-none focus:border-primary transition-colors"
                                    />
                                </div>
                            )}

                            {/* Priority */}
                            <div>
                                <label className="text-sm font-bold text-muted uppercase tracking-wider mb-2 block">Priority (lower = first)</label>
                                <input
                                    type="number"
                                    value={form.priority}
                                    onChange={e => setForm(f => ({ ...f, priority: Number(e.target.value) }))}
                                    min={0}
                                    className="w-full px-4 py-3 rounded-xl border border-accent/20 bg-bg text-text focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>

                            {/* Active toggle */}
                            <div className="flex items-center justify-between p-4 rounded-xl bg-bg border border-accent/10">
                                <div>
                                    <p className="font-bold text-text text-sm">Active</p>
                                    <p className="text-xs text-muted">Enable this rule immediately</p>
                                </div>
                                <button
                                    onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                                    className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${form.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}
                                >
                                    <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 ${form.isActive ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
                                </button>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-surface px-6 py-4 border-t border-accent/20 flex justify-end gap-3 rounded-b-[2rem]">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-5 py-2.5 rounded-xl font-bold text-muted hover:bg-accent/10 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-6 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSaving ? (
                                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                                ) : (
                                    <><HiCheck className="w-4 h-4" /> {editingRule ? 'Update' : 'Create'}</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
