import Layout from "./Layout";
import { useState } from 'react';

export default function PriceViews() {
    const [pricingData, setPricingData] = useState({
        regular: {
            adult: 12.99,
            kids: 8.99,
        }
    });

    const [discountCode, setDiscountCode] = useState('');
    const [discountApplied, setDiscountApplied] = useState(false);
    const [discountPercentage, setDiscountPercentage] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editPrices, setEditPrices] = useState({
        adult: '',
        kids: ''
    });

    // Sample discount codes - in a real app, this would come from a database
    const [discountCodes, setDiscountCodes] = useState({
        'MOVIE10': { percentage: 10, active: true },
        'SUMMER20': { percentage: 20, active: true },
        'SPECIAL50': { percentage: 50, active: true },
        'STUDENT15': { percentage: 15, active: true },
    });

    const openModal = () => {
        setEditPrices({
            adult: pricingData.regular.adult.toString(),
            kids: pricingData.regular.kids.toString()
        });
        setIsModalOpen(true);
        // Prevent scrolling when modal is open
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        setIsModalOpen(false);
        // Re-enable scrolling when modal is closed
        document.body.style.overflow = 'auto';
    };

    const handlePriceChange = (e) => {
        const { name, value } = e.target;
        setEditPrices(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSavePrices = () => {
        const newAdultPrice = parseFloat(editPrices.adult);
        const newKidsPrice = parseFloat(editPrices.kids);

        if (isNaN(newAdultPrice) || isNaN(newKidsPrice)) {
            alert('Please enter valid prices');
            return;
        }

        setPricingData({
            regular: {
                adult: newAdultPrice,
                kids: newKidsPrice
            }
        });
        closeModal();
    };

    const toggleDiscountCode = (code) => {
        setDiscountCodes(prev => ({
            ...prev,
            [code]: {
                ...prev[code],
                active: !prev[code].active
            }
        }));

        // If the currently applied discount code is deactivated, remove it
        if (code === discountCode && discountCodes[code].active) {
            setDiscountApplied(false);
            setDiscountPercentage(0);
        }
    };

    // Function to handle discount code application
    const applyDiscount = () => {
        if (discountCodes[discountCode] && discountCodes[discountCode].active) {
            setDiscountPercentage(discountCodes[discountCode].percentage);
            setDiscountApplied(true);
        } else {
            setDiscountApplied(false);
            setDiscountPercentage(0);
            alert('Invalid or inactive discount code');
        }
    };

    // Calculate discounted price
    const getDiscountedPrice = (price) => {
        if (discountApplied) {
            const discountAmount = price * (discountPercentage / 100);
            return (price - discountAmount).toFixed(2);
        }
        return price.toFixed(2);
    };

    // Close modal when clicking outside
    const handleOutsideClick = (e) => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    };

    return (
        <Layout>
            <div className="space-y-6 animate-fade-in-down">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Ticket Pricing</h1>
                    <button
                        onClick={openModal}
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        Update Prices
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Main pricing card */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 h-full">
                        <h2 className="text-xl font-bold mb-6">Ticket Prices</h2>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-500 font-medium mb-2">Adult</p>
                                <p className="text-3xl font-bold text-black mb-1">${pricingData.regular.adult.toFixed(2)}</p>
                                {discountApplied && (
                                    <p className="text-green-600 font-medium">
                                        ${getDiscountedPrice(pricingData.regular.adult)}
                                        <span className="text-xs ml-1">with discount</span>
                                    </p>
                                )}
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-500 font-medium mb-2">Kids</p>
                                <p className="text-3xl font-bold text-black mb-1">${pricingData.regular.kids.toFixed(2)}</p>
                                {discountApplied && (
                                    <p className="text-green-600 font-medium">
                                        ${getDiscountedPrice(pricingData.regular.kids)}
                                        <span className="text-xs ml-1">with discount</span>
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <p className="text-sm text-gray-500 mb-2">Additional information:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Prices include all taxes</li>
                                <li>• Special group rates available</li>
                                <li>• Senior discount available at box office</li>
                            </ul>
                        </div>
                    </div>

                    {/* Discount Code Section */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 h-full flex flex-col">
                        <h2 className="text-xl font-bold mb-6">Apply Discount Code</h2>
                        <div className="flex flex-col gap-4 mb-4">
                            <input
                                type="text"
                                placeholder="Enter discount code"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                value={discountCode}
                                onChange={(e) => setDiscountCode(e.target.value)}
                            />
                            <button
                                onClick={applyDiscount}
                                className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors w-full"
                            >
                                Apply Discount
                            </button>
                        </div>
                        {discountApplied ? (
                            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-green-600 font-medium text-center">
                                    {discountPercentage}% discount applied successfully!
                                </p>
                            </div>
                        ) : (
                            <div className="mt-4 flex-grow">
                                <p className="text-gray-600 mb-3">Available discount codes:</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {Object.entries(discountCodes).map(([code, { percentage, active }]) => (
                                        <div key={code} className={`border border-gray-200 rounded-lg p-2 text-center ${active ? '' : 'opacity-50'}`}>
                                            <p className="font-medium">{code}</p>
                                            <p className="text-xs text-gray-500">{percentage}% off</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Significantly Improved Modal */}
                {isModalOpen && (
                    <div 
                        className="fixed inset-0 z-50 flex items-center justify-center"
                        onClick={handleOutsideClick}
                    >
                        {/* Enhanced backdrop with stronger blur effect */}
                        <div className="fixed inset-0 bg-black/65 backdrop-blur-lg transition-opacity"></div>
                        
                        {/* Modal Container - Perfectly centered with better spacing */}
                        <div 
                            className="relative bg-white rounded-3xl p-10 w-full max-w-xl shadow-2xl transform 
                            transition-all duration-300 animate-modal-float z-50 mx-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close button positioned outside the content area */}
                            <button
                                onClick={closeModal}
                                className="absolute right-6 top-6 p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                                aria-label="Close modal"
                            >
                                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            
                            {/* Improved header with better spacing */}
                            <div className="mb-10">
                                <h2 className="text-3xl font-bold text-gray-900">Update Prices</h2>
                                <p className="text-gray-500 mt-2">Adjust ticket prices and manage discount codes</p>
                            </div>
                            
                            <div className="space-y-10">
                                {/* Improved input spacing and styling */}
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <label className="block text-base font-medium text-gray-700">Adult Ticket Price</label>
                                        <div className="relative">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-medium">$</span>
                                            <input
                                                type="number"
                                                name="adult"
                                                step="0.01"
                                                value={editPrices.adult}
                                                onChange={handlePriceChange}
                                                className="w-full px-12 py-5 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-lg shadow-sm"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="block text-base font-medium text-gray-700">Kids Ticket Price</label>
                                        <div className="relative">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-medium">$</span>
                                            <input
                                                type="number"
                                                name="kids"
                                                step="0.01"
                                                value={editPrices.kids}
                                                onChange={handlePriceChange}
                                                className="w-full px-12 py-5 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-lg shadow-sm"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Improved discount codes section with better spacing */}
                                <div>
                                    <h3 className="text-xl font-medium text-gray-900 mb-6">Manage Discount Codes</h3>
                                    <div className="space-y-4 max-h-56 overflow-y-auto pr-4 -mr-4 scrollbar-thin">
                                        {Object.entries(discountCodes).map(([code, { percentage, active }]) => (
                                            <div key={code} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors shadow-sm">
                                                <div>
                                                    <p className="font-medium text-lg text-gray-900">{code}</p>
                                                    <p className="text-sm text-gray-500">{percentage}% off</p>
                                                </div>
                                                <button
                                                    onClick={() => toggleDiscountCode(code)}
                                                    className={`px-5 py-3 rounded-xl text-sm font-medium transition-all ${active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                                                >
                                                    {active ? 'Active' : 'Inactive'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Improved footer with better spacing and button styling */}
                                <div className="flex justify-end gap-4 pt-8 border-t border-gray-200">
                                    <button
                                        onClick={closeModal}
                                        className="px-8 py-4 border-2 border-gray-300 rounded-2xl hover:bg-gray-50 transition-colors text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSavePrices}
                                        className="px-10 py-4 bg-black text-white rounded-2xl hover:bg-gray-800 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black shadow-md"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add the enhanced animation styles */}
            <style jsx>{`
                @keyframes modal-float {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-modal-float {
                    animation: modal-float 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
            `}</style>
        </Layout>
    );
}