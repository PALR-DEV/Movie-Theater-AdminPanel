import { useEffect, useState } from 'react';
import Layout from './Layout';
import AlertUtils from '../Utils/AlertUtils';
import { supabase } from '../Config/supabase';

export default function SettingsView() {
    const [activeTab, setActiveTab] = useState('prices');
    const [prices, setPrices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newPrice, setNewPrice] = useState({
        name: '',
        price: ''
    });
    const [editingPrice, setEditingPrice] = useState(null);

    useEffect(() => {
        async function fetchPrices() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                const { data, error } = await supabase
                    .from('Prices')
                    .select('*')
                    .eq('client_id', user.id);

                if (error) throw error;
                setPrices(data || []);
                setIsLoading(false);
            } catch (error) {
                AlertUtils.showError('Failed to fetch prices: ' + error.message);
            }
        }
        fetchPrices();
    }, []);

    const handlePriceChange = (id, value, field) => {
        if (field === 'price') {
            // Only allow numbers and up to 2 decimal places
            if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
                setPrices(prev => prev.map(p => 
                    p.id === id ? { ...p, [field]: value } : p
                ));
            }
        } else {
            setPrices(prev => prev.map(p => 
                p.id === id ? { ...p, [field]: value } : p
            ));
        }
    };

    const handleSavePrices = async () => {
        try {
            AlertUtils.showLoading('Saving prices...');
            
            for (const price of prices) {
                const { error } = await supabase
                    .from('Prices')
                    .update({ 
                        name: price.name,
                        price: parseFloat(price.price)
                    })
                    .eq('id', price.id);
                
                if (error) throw error;
            }
            
            AlertUtils.showSuccess('Prices updated successfully!');
        } catch (error) {
            AlertUtils.showError('Failed to update prices: ' + error.message);
        }
    };

    const handleAddPrice = async () => {
        try {
            if (!newPrice.name || !newPrice.price) {
                AlertUtils.showError('Please fill in all fields');
                return;
            }

            AlertUtils.showLoading('Adding price...');
            const { data: { user } } = await supabase.auth.getUser();
            
            const { data, error } = await supabase
                .from('Prices')
                .insert([
                    {
                        name: newPrice.name,
                        price: parseFloat(newPrice.price),
                        client_id: user.id
                    }
                ])
                .select();

            if (error) throw error;

            setPrices(prev => [...prev, data[0]]);
            setNewPrice({ name: '', price: '' });
            AlertUtils.showSuccess('Price added successfully!');
        } catch (error) {
            AlertUtils.showError('Failed to add price: ' + error.message);
        }
    };

    const handleEditPrice = async () => {
        try {
            if (!editingPrice.name || !editingPrice.price) {
                AlertUtils.showError('Please fill in all fields');
                return;
            }

            AlertUtils.showLoading('Updating price...');
            const { error } = await supabase
                .from('Prices')
                .update({ 
                    name: editingPrice.name,
                    price: parseFloat(editingPrice.price)
                })
                .eq('id', editingPrice.id);

            if (error) throw error;

            setPrices(prev => prev.map(p => 
                p.id === editingPrice.id ? editingPrice : p
            ));
            setEditingPrice(null);
            AlertUtils.showSuccess('Price updated successfully!');
        } catch (error) {
            AlertUtils.showError('Failed to update price: ' + error.message);
        }
    };

    const handleDeletePrice = async (id) => {
        try {
            const result = await AlertUtils.showConfirm(
                'Delete Price',
                'Are you sure you want to delete this price?'
            );

            if (result.isConfirmed) {
                AlertUtils.showLoading('Deleting price...');
                const { error } = await supabase
                    .from('Prices')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                setPrices(prev => prev.filter(p => p.id !== id));
                AlertUtils.showSuccess('Price deleted successfully!');
            }
        } catch (error) {
            AlertUtils.showError('Failed to delete price: ' + error.message);
        }
    };

    const [discounts, setDiscounts] = useState([
        {
            id: 1,
            code: 'SUMMER2024',
            description: 'Summer Special Discount',
            percentage: 15,
            isActive: true,
            validFrom: '2024-06-01',
            validUntil: '2024-08-31'
        }
    ]);

    const [newDiscount, setNewDiscount] = useState({
        code: '',
        description: '',
        percentage: 0,
        isActive: true,
        validFrom: '',
        validUntil: '',
        isForever: false
    });

    const handleAddDiscount = async () => {
        try {
            if (!newDiscount.code || !newDiscount.description || newDiscount.percentage === '') {
                AlertUtils.showError('Please fill in all required fields');
                return;
            }

            AlertUtils.showLoading('Adding discount...');
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            setDiscounts(prev => [...prev, { ...newDiscount, id: Date.now() }]);
            setNewDiscount({
                code: '',
                description: '',
                percentage: 0,
                isActive: true,
                validFrom: '',
                validUntil: ''
            });

            AlertUtils.showSuccess('Discount added successfully!');
        } catch (error) {
            AlertUtils.showError('Failed to add discount');
        }
    };

    const handleToggleDiscountStatus = async (id) => {
        try {
            AlertUtils.showLoading('Updating discount status...');
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            setDiscounts(prev =>
                prev.map(discount =>
                    discount.id === id
                        ? { ...discount, isActive: !discount.isActive }
                        : discount
                )
            );

            AlertUtils.showSuccess('Discount status updated successfully!');
        } catch (error) {
            AlertUtils.showError('Failed to update discount status');
        }
    };

    const handleDeleteDiscount = async (id) => {
        try {
            const result = await AlertUtils.showConfirm(
                'Delete Discount',
                'Are you sure you want to delete this discount?'
            );

            if (result.isConfirmed) {
                AlertUtils.showLoading('Deleting discount...');
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));

                setDiscounts(prev => prev.filter(discount => discount.id !== id));
                AlertUtils.showSuccess('Discount deleted successfully!');
            }
        } catch (error) {
            AlertUtils.showError('Failed to delete discount');
        }
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <div className="space-y-10">
                        <div className="flex items-center justify-between border-b border-gray-200 pb-8">
                            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Settings</h1>
                        </div>

                        {/* Tabs */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden backdrop-blur-lg border border-gray-100">
                            <nav className="flex space-x-1 p-2 bg-gray-50/50 rounded-t-2xl">
                                {['prices', 'discounts'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`${activeTab === tab
                                                ? 'bg-white text-black'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                                            } flex-1 py-3 px-6 text-center text-sm font-medium capitalize transition-all duration-300 relative cursor-pointer select-none rounded-lg`}
                                    >
                                        {tab}
                                        {activeTab === tab && (
                                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black animate-fade-in" />
                                        )}
                                    </button>
                                ))}
                            </nav>

                            {/* Content */}
                            <div className="p-8 bg-white">
                                {/* Prices Tab */}
                                {activeTab === 'prices' && (
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-xl font-semibold text-gray-900">Ticket Prices</h2>
                                        </div>

                                        {/* Add New Price Form */}
                                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Price</h3>
                                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={newPrice.name}
                                                        onChange={(e) => setNewPrice(prev => ({ ...prev, name: e.target.value }))}
                                                        className="peer w-full px-3 py-3 border-0 border-b-2 border-gray-300 bg-transparent placeholder-transparent focus:border-black focus:outline-none focus:ring-0"
                                                        placeholder="Price Name"
                                                        id="price-name"
                                                    />
                                                    <label
                                                        htmlFor="price-name"
                                                        className="absolute left-0 -top-2.5 text-sm text-gray-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-black"
                                                    >
                                                        Price Name
                                                    </label>
                                                </div>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={newPrice.price}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
                                                                setNewPrice(prev => ({ ...prev, price: value }));
                                                            }
                                                        }}
                                                        className="peer w-full px-3 py-3 border-0 border-b-2 border-gray-300 bg-transparent placeholder-transparent focus:border-black focus:outline-none focus:ring-0"
                                                        placeholder="Price Amount"
                                                        id="price-amount"
                                                    />
                                                    <label
                                                        htmlFor="price-amount"
                                                        className="absolute left-0 -top-2.5 text-sm text-gray-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-black"
                                                    >
                                                        Price Amount ($)
                                                    </label>
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <button
                                                        onClick={handleAddPrice}
                                                        className="w-full px-4 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-white hover:text-black border-2 border-black transition-all duration-300"
                                                    >
                                                        Add Price
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Prices List */}
                                        {isLoading ? (
                                            <div className="text-center py-12">Loading...</div>
                                        ) : prices.length === 0 ? (
                                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                                                <p className="text-gray-500">No prices added yet</p>
                                                <p className="text-sm text-gray-400 mt-1">Add your first price using the form above</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                                {prices.map((price) => (
                                                    <div key={price.id} className="relative group bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                                                        {editingPrice?.id === price.id ? (
                                                            <div className="space-y-4">
                                                                <input
                                                                    type="text"
                                                                    value={editingPrice.name}
                                                                    onChange={(e) => setEditingPrice(prev => ({ ...prev, name: e.target.value }))}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-black focus:outline-none"
                                                                    placeholder="Price Name"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={editingPrice.price}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
                                                                            setEditingPrice(prev => ({ ...prev, price: value }));
                                                                        }
                                                                    }}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-black focus:outline-none"
                                                                    placeholder="Price Amount"
                                                                />
                                                                <div className="flex space-x-2">
                                                                    <button
                                                                        onClick={handleEditPrice}
                                                                        className="flex-1 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-white hover:text-black border border-black transition-all duration-300"
                                                                    >
                                                                        Save
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setEditingPrice(null)}
                                                                        className="flex-1 px-4 py-2 bg-white text-black rounded-lg text-sm font-medium border border-gray-300 hover:border-black transition-all duration-300"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="space-y-4">
                                                                    <p className="text-gray-600">{price.name}</p>
                                                                    <p className="text-2xl font-bold">${parseFloat(price.price).toFixed(2)}</p>
                                                                </div>
                                                                <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                                    <button
                                                                        onClick={() => setEditingPrice(price)}
                                                                        className="p-2 text-gray-400 hover:text-black transition-colors duration-200"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                                        </svg>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeletePrice(price.id)}
                                                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Discounts Tab */}
                                {activeTab === 'discounts' && (
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-xl font-semibold text-gray-900">Discount Management</h2>
                                        </div>

                                        {/* Add New Discount Form */}
                                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Discount</h3>
                                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={newDiscount.code}
                                                        onChange={(e) => setNewDiscount(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                                                        className="peer w-full px-3 py-3 border-0 border-b-2 border-gray-300 bg-transparent placeholder-transparent focus:border-black focus:outline-none focus:ring-0 transition-all"
                                                        placeholder="Discount Code"
                                                        id="discount-code"
                                                    />
                                                    <label
                                                        htmlFor="discount-code"
                                                        className="absolute left-0 -top-2.5 text-sm text-gray-600 transition-all
                                                                 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3
                                                                 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-black"
                                                    >
                                                        Discount Code
                                                    </label>
                                                </div>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={newDiscount.description}
                                                        onChange={(e) => setNewDiscount(prev => ({ ...prev, description: e.target.value }))}
                                                        className="peer w-full px-3 py-3 border-0 border-b-2 border-gray-300 bg-transparent placeholder-transparent focus:border-black focus:outline-none focus:ring-0 transition-all"
                                                        placeholder="Description"
                                                        id="discount-description"
                                                    />
                                                    <label
                                                        htmlFor="discount-description"
                                                        className="absolute left-0 -top-2.5 text-sm text-gray-600 transition-all
                                                                 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3
                                                                 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-black"
                                                    >
                                                        Description
                                                    </label>
                                                </div>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={newDiscount.percentage}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            if (value === '' || /^\d{1,3}$/.test(value) && parseInt(value) <= 100) {
                                                                setNewDiscount(prev => ({ ...prev, percentage: value === '' ? '' : parseInt(value) }))
                                                            }
                                                        }}
                                                        onBlur={() => {
                                                            if (newDiscount.percentage !== '') {
                                                                setNewDiscount(prev => ({ ...prev, percentage: parseInt(prev.percentage) }))
                                                            }
                                                        }}
                                                        className="peer w-full px-3 py-3 border-0 border-b-2 border-gray-300 bg-transparent placeholder-transparent focus:border-black focus:outline-none focus:ring-0 transition-all"
                                                        placeholder="Discount Percentage"
                                                        id="discount-percentage"
                                                    />
                                                    <label
                                                        htmlFor="discount-percentage"
                                                        className="absolute left-0 -top-2.5 text-sm text-gray-600 transition-all
                                                                 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3
                                                                 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-black"
                                                    >
                                                        Discount Percentage
                                                    </label>
                                                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                                        <span className="text-gray-500 text-lg font-medium">%</span>
                                                    </div>
                                                </div>
                                                <div className="relative">
                                                    <input
                                                        type="date"
                                                        value={newDiscount.validFrom}
                                                        onChange={(e) => setNewDiscount(prev => ({ ...prev, validFrom: e.target.value }))}
                                                        className="peer w-full px-3 py-3 border-0 border-b-2 border-gray-300 bg-transparent placeholder-transparent focus:border-black focus:outline-none focus:ring-0 transition-all"
                                                        placeholder="Valid From"
                                                        id="valid-from"
                                                    />
                                                    <label
                                                        htmlFor="valid-from"
                                                        className="absolute left-0 -top-2.5 text-sm text-gray-600 transition-all
                                                                 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3
                                                                 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-black"
                                                    >
                                                        Valid From
                                                    </label>
                                                </div>
                                                <div className="relative space-y-2">
                                                    <div className="relative">
                                                        <input
                                                            type="date"
                                                            value={newDiscount.validUntil}
                                                            onChange={(e) => setNewDiscount(prev => ({ ...prev, validUntil: e.target.value }))}
                                                            className="peer w-full px-3 py-3 border-0 border-b-2 border-gray-300 bg-transparent placeholder-transparent focus:border-black focus:outline-none focus:ring-0 transition-all"
                                                            placeholder="Valid Until"
                                                            id="valid-until"
                                                            disabled={newDiscount.isForever}
                                                        />
                                                        <label
                                                            htmlFor="valid-until"
                                                            className="absolute left-0 -top-2.5 text-sm text-gray-600 transition-all
                                                                     peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3
                                                                     peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-black"
                                                        >
                                                            Valid Until
                                                        </label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => setNewDiscount(prev => ({ ...prev, isForever: !prev.isForever, validUntil: prev.isForever ? '' : '9999-12-31' }))}
                                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${newDiscount.isForever ? 'bg-black' : 'bg-gray-200'}`}
                                                            role="switch"
                                                            aria-checked={newDiscount.isForever}
                                                        >
                                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${newDiscount.isForever ? 'translate-x-6' : 'translate-x-1'}`} />
                                                        </button>
                                                        <span className="text-sm text-gray-600">Valid Forever</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-end">
                                                    <button
                                                        onClick={handleAddDiscount}
                                                        className="w-full px-4 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-white hover:text-black border-2 border-black transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 shadow-sm hover:shadow-md"
                                                    >
                                                        Add Discount
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}