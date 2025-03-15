import Layout from './Layout';
import { useState } from 'react';

export default function TransactionView() {
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState({
        status: 'All', // Default: All statuses
        paymentMethod: 'All', // Default: All payment methods
        dateRange: 'All' // Default: No date range filter
    });

    const allTransactions = [
        {
            id: 1,
            date: '2024-03-15',
            customer: 'John Smith',
            amount: 45.99,
            status: 'Completed',
            items: ['Ticket x2', 'Popcorn Combo'],
            paymentMethod: 'Visa',
            cardLast4: '4242',
            reference: 'TXN-2024315-001',
            email: 'john.smith@email.com',
            processingFee: 1.38,
            type: 'Purchase'
        },
        {
            id: 2,
            date: '2024-03-14',
            customer: 'Sarah Johnson',
            amount: 32.50,
            status: 'Pending',
            items: ['Ticket x1', 'Soft Drink'],
            paymentMethod: 'Mastercard',
            cardLast4: '8791',
            reference: 'TXN-2024314-002',
            email: 'sarah.j@email.com',
            processingFee: 0.98,
            type: 'Purchase'
        },
        {
            id: 3,
            date: '2024-03-14',
            customer: 'Mike Brown',
            amount: 25.00,
            status: 'Refunded',
            items: ['Ticket x1'],
            paymentMethod: 'Visa',
            cardLast4: '1234',
            reference: 'TXN-2024314-003',
            email: 'mike.b@email.com',
            processingFee: 0.75,
            type: 'Refund'
        }
    ];

    // Helper function to calculate date ranges
    const getDateRange = (range) => {
        const today = new Date();
        switch (range) {
            case 'Week':
                return new Date(today.setDate(today.getDate() - 7));
            case 'Month':
                return new Date(today.setMonth(today.getMonth() - 1));
            case 'Year':
                return new Date(today.setFullYear(today.getFullYear() - 1));
            default:
                return null; // No date range filter
        }
    };

    // Apply filters to transactions
    const filteredTransactions = allTransactions.filter((transaction) => {
        const matchesStatus = filter.status === 'All' || transaction.status === filter.status;
        const matchesPaymentMethod =
            filter.paymentMethod === 'All' || transaction.paymentMethod === filter.paymentMethod;

        // Filter by date range
        const startDate = getDateRange(filter.dateRange);
        const transactionDate = new Date(transaction.date);
        const matchesDateRange = !startDate || transactionDate >= startDate;

        return matchesStatus && matchesPaymentMethod && matchesDateRange;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'bg-green-50 text-green-600';
            case 'Pending': return 'bg-yellow-50 text-yellow-600';
            case 'Refunded': return 'bg-red-50 text-red-600';
            default: return 'bg-gray-50 text-gray-600';
        }
    };

    const getPaymentMethodIcon = (method) => {
        switch (method.toLowerCase()) {
            case 'visa': return '💳 Visa';
            case 'mastercard': return '💳 Mastercard';
            default: return '💳 Card';
        }
    };

    return (
        <Layout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                            Export CSV
                        </button>
                        {/* Filter Button */}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
                        >
                            Filter
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 transition-transform transform hover:scale-105 duration-300">
                        <dt className="text-sm font-medium text-gray-500">Total Transactions</dt>
                        <dd className="mt-1 text-2xl font-bold text-gray-900">{filteredTransactions.length}</dd>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 transition-transform transform hover:scale-105 duration-300">
                        <dt className="text-sm font-medium text-gray-500">Total Revenue</dt>
                        <dd className="mt-1 text-2xl font-bold text-green-600">
                            ${filteredTransactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                        </dd>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 transition-transform transform hover:scale-105 duration-300">
                        <dt className="text-sm font-medium text-gray-500">Processing Fees</dt>
                        <dd className="mt-1 text-2xl font-bold text-gray-900">
                            ${filteredTransactions.reduce((sum, t) => sum + t.processingFee, 0).toFixed(2)}
                        </dd>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {filteredTransactions.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-gray-50 transition-colors duration-200">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{transaction.customer}</div>
                                            <div className="text-sm text-gray-500">{transaction.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${transaction.amount.toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                                                {transaction.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                                            <button 
                                                onClick={() => setSelectedTransaction(transaction)} 
                                                className="text-indigo-600 hover:text-indigo-900 font-medium"
                                            >
                                                View
                                            </button>
                                            {transaction.status !== 'Refunded' && (
                                                <button className="text-red-600 hover:text-red-900 font-medium">Refund</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal for Filtering */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        {/* Background overlay */}
                        <div className="fixed inset-0 transition-opacity bg-gray-500/75 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                        {/* Modal panel */}
                        <div className="relative inline-block w-full max-w-lg p-8 my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-2xl shadow-xl sm:align-middle">
                            {/* Close button */}
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 focus:outline-none"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold text-gray-900">Filter Transactions</h3>
                                {/* Status Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <select
                                        value={filter.status}
                                        onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                    >
                                        <option value="All">All</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Refunded">Refunded</option>
                                    </select>
                                </div>
                                {/* Payment Method Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                                    <select
                                        value={filter.paymentMethod}
                                        onChange={(e) => setFilter({ ...filter, paymentMethod: e.target.value })}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                    >
                                        <option value="All">All</option>
                                        <option value="Visa">Visa</option>
                                        <option value="Mastercard">Mastercard</option>
                                    </select>
                                </div>
                                {/* Date Range Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date Range</label>
                                    <select
                                        value={filter.dateRange}
                                        onChange={(e) => setFilter({ ...filter, dateRange: e.target.value })}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                    >
                                        <option value="All">All</option>
                                        <option value="Week">Last Week</option>
                                        <option value="Month">Last Month</option>
                                        <option value="Year">Last Year</option>
                                    </select>
                                </div>
                                {/* Apply Filters Button */}
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Transaction Details Modal */}
            {selectedTransaction && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        {/* Background overlay */}
                        <div className="fixed inset-0 transition-opacity bg-gray-500/75 backdrop-blur-sm" onClick={() => setSelectedTransaction(null)}></div>
                        {/* Modal panel */}
                        <div className="relative inline-block w-full max-w-2xl p-8 my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-2xl shadow-xl sm:align-middle">
                            {/* Close button */}
                            <button
                                onClick={() => setSelectedTransaction(null)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 focus:outline-none"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold text-gray-900">Transaction Details</h3>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Reference</p>
                                    <p className="mt-1 text-base text-gray-900">{selectedTransaction.reference}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Customer</p>
                                    <p className="mt-1 text-base text-gray-900">{selectedTransaction.customer}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Email</p>
                                    <p className="mt-1 text-base text-gray-900">{selectedTransaction.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Date</p>
                                    <p className="mt-1 text-base text-gray-900">{selectedTransaction.date}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Amount</p>
                                    <p className="mt-1 text-base text-gray-900">${selectedTransaction.amount.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Status</p>
                                    <p className="mt-1 text-base text-gray-900">{selectedTransaction.status}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Items</p>
                                    <ul className="list-disc pl-5 mt-1">
                                        {selectedTransaction.items.map((item, index) => (
                                            <li key={index} className="text-base text-gray-900">{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}