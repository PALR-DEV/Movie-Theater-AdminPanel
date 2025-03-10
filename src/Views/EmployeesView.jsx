import Layout from "./Layout";
import { useState } from 'react';

export default function EmployeesView() {
    const [employees, setEmployees] = useState([
        { id: 1, name: 'John Doe', role: 'Manager', email: 'john@example.com', phone: '787-123-4567', status: 'Active' },
        { id: 2, name: 'Jane Smith', role: 'Cashier', email: 'jane@example.com', phone: '787-234-5678', status: 'Active' },
    ]);

    const [showAddForm, setShowAddForm] = useState(false);
    const [newEmployee, setNewEmployee] = useState({
        name: '',
        role: '',
        email: '',
        phone: '',
        status: 'Active'
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEmployee(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setEmployees(prev => [...prev, { ...newEmployee, id: prev.length + 1 }]);
        setNewEmployee({
            name: '',
            role: '',
            email: '',
            phone: '',
            status: 'Active'
        });
        setShowAddForm(false);
    };

    const handleDeleteEmployee = (id) => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
            setEmployees(prev => prev.filter(emp => emp.id !== id));
        }
    };

    return (
        <Layout>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Employees</h1>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        Add Employee
                    </button>
                </div>

                {/* Add Employee Modal */}
                {showAddForm && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Add New Employee</h2>
                                <button
                                    onClick={() => setShowAddForm(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={newEmployee.name}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Role
                                    </label>
                                    <select
                                        name="role"
                                        value={newEmployee.role}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                        required
                                    >
                                        <option value="">Select Role</option>
                                        <option value="Manager">Manager</option>
                                        <option value="Cashier">Cashier</option>
                                        <option value="Usher">Usher</option>
                                        <option value="Projectionist">Projectionist</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={newEmployee.email}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={newEmployee.phone}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    Add Employee
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Employees Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {employees.map(employee => (
                        <div key={employee.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">{employee.name}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 text-sm rounded-full bg-gray-100">
                                        {employee.status}
                                    </span>
                                    <button
                                        onClick={() => handleDeleteEmployee(employee.id)}
                                        className="text-red-500 hover:text-red-700 transition-colors"
                                        aria-label="Delete employee"
                                    >
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p className="flex items-center">
                                    <span className="font-medium mr-2">Role:</span>
                                    {employee.role}
                                </p>
                                <p className="flex items-center">
                                    <span className="font-medium mr-2">Email:</span>
                                    {employee.email}
                                </p>
                                <p className="flex items-center">
                                    <span className="font-medium mr-2">Phone:</span>
                                    {employee.phone}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
}