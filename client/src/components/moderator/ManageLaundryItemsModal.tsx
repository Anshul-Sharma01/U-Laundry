import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { AppDispatch, RootState } from '../../store/store';
import { fetchAllLaundryItems, deleteLaundryItem } from '../../store/slices/moderatorSlice';
import { HiXMark, HiTrash } from 'react-icons/hi2';
import toast from 'react-hot-toast';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function ManageLaundryItemsModal({ isOpen, onClose }: Props) {
    const dispatch = useDispatch<AppDispatch>();
    const { items, itemsLoading } = useSelector((s: RootState) => s.moderator);

    useEffect(() => {
        if (isOpen && items.length === 0) {
            dispatch(fetchAllLaundryItems());
        }
    }, [isOpen, dispatch, items.length]);

    if (!isOpen) return null;

    const handleDelete = async (itemId: string, itemTitle: string) => {
        if (!window.confirm(`Are you sure you want to delete "${itemTitle}"?`)) return;

        try {
            await dispatch(deleteLaundryItem(itemId)).unwrap();
            toast.success('Item deleted successfully');
        } catch (err: any) {
            toast.error(err || 'Failed to delete item');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-surface w-full max-w-2xl rounded-3xl shadow-2xl border border-accent/20 overflow-hidden flex flex-col max-h-[90vh]">
                
                <div className="flex justify-between items-center p-6 border-b border-accent/20 bg-bg/50">
                    <div>
                        <h2 className="text-xl font-bold text-text">Manage Laundry Items</h2>
                        <p className="text-sm text-muted mt-1">View and delete available catalog items.</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-accent/10 rounded-full hover:bg-accent/20 transition-colors text-text">
                        <HiXMark size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-bg/20">
                    {itemsLoading && items.length === 0 ? (
                        <div className="flex justify-center items-center py-10">
                            <span className="text-muted font-medium animate-pulse">Loading items...</span>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-12 text-muted font-medium bg-surface rounded-2xl border border-dashed border-accent/30">
                            No laundry items found. Add some from the dashboard!
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {items.map(item => (
                                <div key={item._id} className="bg-surface p-4 rounded-2xl border border-accent/20 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow group">
                                    <div className="w-16 h-16 rounded-xl bg-accent/10 overflow-hidden flex-shrink-0">
                                        {item.image?.secure_url ? (
                                            <img src={item.image.secure_url} alt={item.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-muted">No Img</div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-text truncate">{item.title}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-sm font-semibold text-primary">₹{item.pricePerUnit}</span>
                                            {item.category && (
                                                <span className="text-[10px] uppercase font-bold tracking-wider text-muted bg-accent/10 px-2 py-0.5 rounded-full">
                                                    {item.category}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(item._id, item.title)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                        title="Delete Item"
                                    >
                                        <HiTrash size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
