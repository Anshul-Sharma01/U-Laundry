import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createLaundryItem } from '../../store/slices/moderatorSlice';
import { HiXMark } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import type { AppDispatch } from '../../store/store';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddLaundryItemModal({ isOpen, onClose }: Props) {
    const dispatch = useDispatch<AppDispatch>();

    const [title, setTitle] = useState('');
    const [pricePerUnit, setPricePerUnit] = useState('');
    const [maxQuantity, setMaxQuantity] = useState('10');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !pricePerUnit || !image) {
            toast.error('Title, Price, and Image are required!');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('pricePerUnit', pricePerUnit);
        formData.append('maxQuantityPerOrder', maxQuantity);
        formData.append('category', category);
        formData.append('description', description);
        formData.append('image', image);

        try {
            setLoading(true);
            const res = await dispatch(createLaundryItem(formData)).unwrap();
            toast.success(res.message || 'Item created successfully!');
            onClose();
        } catch (err: any) {
            toast.error(err || 'Failed to create item');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-surface w-full max-w-xl rounded-3xl shadow-2xl border border-accent/20 overflow-hidden flex flex-col max-h-[90vh]">

                <div className="flex justify-between items-center p-6 border-b border-accent/20 bg-bg/50">
                    <h2 className="text-xl font-bold text-text">Add New Laundry Item</h2>
                    <button onClick={onClose} className="p-2 bg-accent/10 rounded-full hover:bg-accent/20 transition-colors text-text">
                        <HiXMark size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    <form id="add-item-form" onSubmit={handleSubmit} className="flex flex-col gap-5">

                        {/* Image Upload */}
                        <div className="flex flex-col items-center gap-4 mb-2">
                            <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-primary flex items-center justify-center bg-primary/5 overflow-hidden relative group">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-sm font-medium text-primary text-center px-2">Click to Upload Image</span>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="flex flex-col gap-1.5 focus-within-glow">
                                <label className="text-sm font-bold text-text/80 ml-1">Title <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="e.g. T-Shirt"
                                    className="px-4 py-3 rounded-xl bg-bg border border-accent/30 text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1.5 focus-within-glow">
                                <label className="text-sm font-bold text-text/80 ml-1">Price per Unit (₹) <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    min="0"
                                    value={pricePerUnit}
                                    onChange={e => setPricePerUnit(e.target.value)}
                                    placeholder="e.g. 15"
                                    className="px-4 py-3 rounded-xl bg-bg border border-accent/30 text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="flex flex-col gap-1.5 focus-within-glow">
                                <label className="text-sm font-bold text-text/80 ml-1">Max Quantity per Order</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={maxQuantity}
                                    onChange={e => setMaxQuantity(e.target.value)}
                                    className="px-4 py-3 rounded-xl bg-bg border border-accent/30 text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5 focus-within-glow">
                                <label className="text-sm font-bold text-text/80 ml-1">Category</label>
                                <input
                                    type="text"
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    placeholder="e.g. clothes, bedding"
                                    className="px-4 py-3 rounded-xl bg-bg border border-accent/30 text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5 focus-within-glow">
                            <label className="text-sm font-bold text-text/80 ml-1">Description (Optional)</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Short description..."
                                rows={3}
                                className="px-4 py-3 rounded-xl bg-bg border border-accent/30 text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                            ></textarea>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-accent/20 bg-bg/50 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl font-bold text-text bg-accent/10 hover:bg-accent/20 transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="add-item-form"
                        className="px-6 py-2.5 rounded-xl font-bold text-white bg-primary hover:bg-secondary focus:ring-4 focus:ring-primary/30 transition-all shadow-md hover:shadow-lg disabled:opacity-70 flex items-center gap-2"
                        disabled={loading}
                    >
                        {loading && (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {loading ? 'Creating...' : 'Create Item'}
                    </button>
                </div>

            </div>
        </div>
    );
}
