import Layout from "./Layout";
import { useEffect, useState } from 'react';
import { supabase } from "../Config/supabase";
import AlertUtils from "../Utils/AlertUtils";

export default function EmployeesView() {
    const [employees, setEmployees] = useState([]);
    // const [employees, setEmployees] = useState([
    //     { id: 1, name: 'John Doe', role: 'Manager', email: 'john@example.com', phone: '787-123-4567', status: 'Active' },
    //     { id: 2, name: 'Jane Smith', role: 'Cashier', email: 'jane@example.com', phone: '787-234-5678', status: 'Active' },
    // ]);

    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [newEmployee, setNewEmployee] = useState({
        name: '',
        role: '',
        email: '',
        phone: '',
        password: '',
    });

    const [editEmployee, setEditEmployee] = useState({
        name: '',
        role: '',
        email: '',
        phone: '',
        password: ''
    });

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                setIsLoading(true);
                await getEmployees();

            } catch (error) {
                throw error;
            } finally {
                setIsLoading(false);
            }
        };

        fetchEmployees();
    }, [])

    async function getEmployees() {
        try {
            AlertUtils.showLoading('Loading employees...');
            const { data, error } = await supabase.from('Employees').select('*').order('created_at', { ascending: true });
            if (error) {
                console.error('Error fetching employees:', error);
                AlertUtils.showError('Failed to load employees');
            }
            setEmployees(data);
            AlertUtils.closeLoading();


        } catch (error) {
            throw error;

        }
    }



    async function getEmployeeWithID(employeeId) {
        try {
            const {data, error} = await supabase.from('Employees').select('*').eq('id', employeeId).single();
            if(error) {
                throw error;
            }
            console.log(data);
            setEditEmployee(data);

        } catch (error) {
            throw error;

        }

    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEmployee(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditEmployee(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditSubmit = async(e) => {
        e.preventDefault();
        try {
            AlertUtils.showLoading('Updating employee...');
            const { data, error } = await supabase
                .from('Employees')
                .update({
                    name: editEmployee.name,
                    role: editEmployee.role,
                    email: editEmployee.email,
                    phone: editEmployee.phone,
                    password: editEmployee.password
                })
                .eq('id', editEmployee.id)
                .select();

            if (error) throw error;
            AlertUtils.showSuccess('Employee updated successfully');
            setShowEditForm(false);
            await getEmployees();

        } catch (error) {
            console.error('Error updating employee:', error);
            AlertUtils.showError('Failed to update employee');

        }

        setShowEditForm(false);
    }


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            AlertUtils.showLoading('Adding employee...');

            const { data, error } = await supabase
                .from('Employees')
                .insert([{
                    name: newEmployee.name,
                    role: newEmployee.role,
                    email: newEmployee.email,
                    phone: newEmployee.phone,
                    password: newEmployee.password
                }])
                .select();

            if (error) throw error;
            AlertUtils.showSuccess('Employee added successfully');
            setShowAddForm(false);
            await getEmployees();


        } catch (error) {
            console.error('Error adding employee:', error);
            AlertUtils.showError('Failed to add employee');
        }
    };

    const handleDeleteEmployee = async (id) => {
        try {
            const result = await AlertUtils.showConfirm(
                'Delete Employee',
                'Are you sure you want to delete this employee?'
            );

            if (result.isConfirmed) {
                AlertUtils.showLoading('Deleting employee...');
                
                // Delete employee from database
                const { error } = await supabase
                    .from('Employees')
                    .delete()
                    .eq('id', id);
                
                if (error) throw error;
                
                // Update UI after successful deletion
                setEmployees(prev => prev.filter(emp => emp.id !== id));
                AlertUtils.showSuccess('Employee deleted successfully');
            }
        } catch (error) {
            console.error('Error deleting employee:', error);
            AlertUtils.showError('Failed to delete employee');
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
                {/* Edit Employee Modal */}

                


                {showEditForm && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Editing Employee: Pedro</h2>
                                <button
                                    onClick={() => setShowEditForm(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>
                            <form onSubmit={handleEditSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={editEmployee.name || ''}
                                        onChange={handleEditInputChange}
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
                                        value={editEmployee.role || ''}
                                        onChange={handleEditInputChange}
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
                                        value={editEmployee.email || ''}
                                        onChange={handleEditInputChange}
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
                                        value={editEmployee.phone || ''}
                                        onChange={handleEditInputChange}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        password
                                    </label>
                                    <input
                                        type="text"
                                        name="password"
                                        value={editEmployee.password || ''}
                                        onChange={handleEditInputChange}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                        required
                                    />
                                </div>
                                <button onClick={handleEditSubmit}
                                    type="submit"
                                    className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    Update Employee
                                </button>
                            </form>
                        </div>
                    </div>
                )}


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

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        password
                                    </label>
                                    <input
                                        type="text"
                                        name="password"
                                        value={newEmployee.password}
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

                    {employees.length === 0 && !showAddForm ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
                            <div className="bg-gray-50 rounded-full p-6 mb-6">
                                <svg
                                    className="w-16 h-16 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">No Employees Yet</h2>
                            <p className="text-gray-500 mb-6 text-center max-w-sm">
                                Get started by adding your first employee to manage your theater staff.
                            </p>
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="inline-flex items-center px-6 py-3 rounded-lg bg-black text-white hover:bg-gray-800 transition-all transform hover:scale-105 duration-200 shadow-sm"
                            >
                                <svg
                                    className="w-5 h-5 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                    />
                                </svg>
                                Add First Employee
                            </button>
                        </div>

                    ) : (


                        employees.map(employee => (
                            <div key={employee.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold">{employee.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => {
                                            setShowEditForm(true);
                                            getEmployeeWithID(employee.id);


                                        }} className="px-5 py-2 text-sm rounded-full bg-gray-100 hover:bg-gray-200 ">
                                            Edit
                                        </button>
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

                                    <p className="flex items-center">
                                        <span className="font-medium mr-2">Password:</span>
                                        {employee.password}
                                    </p>
                                </div>
                            </div>

                        ))
                    )}
                </div>
            </div>
        </Layout>
    );
}