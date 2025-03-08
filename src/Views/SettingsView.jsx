import { useEffect, useState } from 'react';
import Layout from './Layout';
import AlertUtils from '../Utils/AlertUtils';

export default function SettingsView() {
    const [activeTab, setActiveTab] = useState('prices');
    const [prices, setPrices] = useState({
        adult: 12.99,
        senior: 10.99,
        kid: 8.99
    });



    useEffect(() => {
    }, []);




    const handlePriceChange = (type, value) => {
        // Only allow numbers and up to 2 decimal places
        if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
            setPrices(prev => ({
                ...prev,
                [type]: value === '' ? '' : value
            }));
        }
    };

    const formatPrice = (price) => {
        if (price === '') return '';
        // Format as USD with exactly 2 decimal places
        return parseFloat(price).toFixed(2);
    };

    const handleSavePrices = async () => {
        try {
            AlertUtils.showLoading('Saving prices...');
            // Here you would typically make an API call to save the prices
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
            AlertUtils.showSuccess('Prices updated successfully!');
        } catch (error) {
            AlertUtils.showError('Failed to update prices');
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
                                        className={`${
                                            activeTab === tab
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
                                            <button
                                                onClick={handleSavePrices}
                                                className="inline-flex items-center px-6 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-white hover:text-black border-2 border-black transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 shadow-sm hover:shadow-md"
                                            >
                                                Save Changes
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                            {Object.entries(prices).map(([type, price]) => (
                                                <div key={type} className="relative group bg-gray-50/50 p-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:bg-white border border-gray-100 hover:border-gray-200">
                                                    <div className="relative">
                                                        <input
                                                            id={type}
                                                            type="text"
                                                            value={price}
                                                            onChange={(e) => handlePriceChange(type, e.target.value)}
                                                            onBlur={() => setPrices(prev => ({
                                                                ...prev,
                                                                [type]: formatPrice(prev[type])
                                                            }))}
                                                            className="peer w-full px-8 py-3 border-0 border-b-2 border-gray-300 bg-transparent placeholder-transparent focus:border-black focus:outline-none focus:ring-0 transition-all text-right text-lg font-medium"
                                                            placeholder={`${type} Ticket Price`}
                                                        />
                                                        <label
                                                            htmlFor={type}
                                                            className="absolute left-0 -top-2.5 text-sm text-gray-600 transition-all
                                                                     peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3
                                                                     peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-black capitalize tracking-wide"
                                                        >
                                                            {type} Ticket Price
                                                        </label>
                                                        <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                                                            <span className="text-gray-500 text-lg font-medium">$</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
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