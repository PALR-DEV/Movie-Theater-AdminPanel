import Layout from "./Layout";
import { useState, useRef, useEffect } from "react";
import AlertUtils from "../Utils/AlertUtils";
import { supabase } from "../Config/supabase";

export default function FoodItemsView() {
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [debug_hasEmpty, setdebug_hasEmpty] = useState(true);
    const [menuItems, setMenuItems] = useState([])

    useEffect(() => {
        async function fetchMenuItems() {
            try {
                const { data, error } = await supabase
                    .from('MenuItems')
                    .select('*');
                if (error) throw error;
                setMenuItems(data);
            } catch (error) {
                AlertUtils.showError('Failed to fetch menu items: ' + error.message);
            }
        }
        fetchMenuItems();
    }, [])



    async function StoreImage(file) {
        try {
            // Get the authenticated user's ID
            const userId = (await supabase.auth.getUser()).data.user.id;
            
            // Generate unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            
            // Define the folder structure with the user's ID
            const folderPath = `cineTown/${userId}/`;
            const filePath = `${folderPath}${fileName}`;
            
            // Upload file to Supabase with folder structure
            const { data, error } = await supabase.storage
                .from('menu-items')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                });
            
            if (error) throw error;
            
            // Get public URL
            const { data: { publicUrl } } = await supabase.storage
                .from('menu-items')
                .getPublicUrl(filePath);
    
            console.log(publicUrl);
            return publicUrl;
        } catch (error) {
            AlertUtils.showError('Failed to upload image: ' + error.message);
            throw error;
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const imageFile = formData.get('image');
        
        try {
            let imageUrl = editingItem?.image; // Keep existing image URL if editing
            
            // Only upload new image if a file is selected
            if (imageFile instanceof File) {
                imageUrl = await StoreImage(imageFile);
            }
            
            const newItem = {
                name: formData.get('name'),
                price: parseFloat(formData.get('price')),
                description: formData.get('description'),
                category: formData.get('category'),
                client_id: (await supabase.auth.getUser()).data.user.id,
                image: imageUrl
            };
    
            if (editingItem) {
                // Update existing item in database
                const { error } = await supabase
                    .from('MenuItems')
                    .update(newItem)
                    .eq('id', editingItem.id);
                    
                if (error) throw error;
                
                // Update local state
                setMenuItems(prev =>
                    prev.map(item =>
                        item.id === editingItem.id
                            ? { ...item, ...newItem }
                            : item
                    )
                );
                AlertUtils.showSuccess('Item updated successfully!');
            } else {
                // Insert new item into database
                const { data, error } = await supabase
                    .from('MenuItems')
                    .insert(newItem)
                    .select();
                    
                if (error) throw error;
                
                // Update local state
                setMenuItems(prev => [...prev, data[0]]);
                AlertUtils.showSuccess('Item added successfully!');
            }
            
            setIsModalOpen(false);
            setImagePreview(null);
            
        } catch (error) {
            AlertUtils.showError('Failed to save item: ' + error.message);
        }
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleDeleteItem = async (id) => {
        try {
            const result = await AlertUtils.showConfirm(
                'Delete Item',
                'Are you sure you want to delete this item?'
            );

            if (result.isConfirmed) {
                AlertUtils.showLoading('Deleting item...');
                setMenuItems(prev => prev.filter(item => item.id !== id));
                AlertUtils.showSuccess('Item deleted successfully!');
            }
        } catch (error) {
            AlertUtils.showError('Failed to delete item');
        }
    };

    

    return (
        <Layout>
            <div className="h-[calc(100vh-80px)] flex flex-col">
                {/* Header Section - Always visible */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Food & Beverages</h1>
                    <button
                        onClick={() => {
                            setEditingItem(null);
                            setIsModalOpen(true);
                        }}
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 
                        transition-colors duration-200 flex items-center gap-2"
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
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                        </svg>
                        Add Item
                    </button>
                </div>

                {/* Content Section - Conditional Rendering */}
                {menuItems.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="mx-auto w-24 h-24 mb-4 text-gray-400">
                                <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                                        d="M15 3v4a1 1 0 001 1h4M14 13v4m0 0v4m0-4h4m-4 0H10m-5.498 2H4.5c-.375 0-.745-.107-1.068-.31a2.262 2.262 0 01-.848-.83 2.214 2.214 0 01-.324-1.166V6.5c0-.375.107-.745.31-1.068.204-.322.49-.583.83-.748.339-.165.714-.25 1.09-.25h11.176c.376 0 .751.085 1.09.25.34.165.626.426.83.748.203.323.31.693.31 1.068v4.174" 
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-medium text-gray-900 mb-2">No menu items yet</h3>
                            <p className="text-gray-500 mb-6">Get started by adding your first menu item.</p>
                            <button
                                onClick={() => {
                                    setEditingItem(null);
                                    setIsModalOpen(true);
                                }}
                                className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 
                                transition-colors duration-200 gap-2"
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
                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                    />
                                </svg>
                                Add Your First Item
                            </button>
                        </div>
                    </div>
                ) : (

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {menuItems.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow 
                                duration-200 overflow-hidden border border-gray-100"
                            >
                                {/* Item Image */}
                                <div className="h-40 bg-gray-50 flex items-center justify-center overflow-hidden">
                                    <img 
                                        src={item.image} 
                                        alt={item.name}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                                
                                {/* Item Details */}
                                <div className="p-4 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                                        <span className="text-green-600 font-medium">
                                            ${item.price.toFixed(2)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500">{item.description}</p>
                                    <div className="pt-2 flex justify-between items-center">
                                        <span className="text-xs font-medium text-gray-500 bg-gray-100 
                                        px-2 py-1 rounded-full">
                                            {item.category}
                                        </span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingItem(item);
                                                    setIsModalOpen(true);
                                                }}
                                                className="text-gray-600 hover:text-gray-900 transition-colors"
                                                title="Edit item"
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
                                                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                                    />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteItem(item.id)}
                                                className="text-red-600 hover:text-red-900 transition-colors"
                                                title="Delete item"
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
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        {/* Background overlay */}
                        <div 
                            className="fixed inset-0 transition-opacity bg-black/40 backdrop-blur-md" 
                            onClick={() => setIsModalOpen(false)}
                            aria-hidden="true"
                        />

                        {/* Modal panel */}
                        <div 
                            className="relative inline-block w-full max-w-lg p-8 my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-2xl shadow-2xl sm:align-middle
                            animate-[modal-slide_0.3s_ease-out] border border-gray-100"
                        >
                            {/* Close button */}
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-all duration-200"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            <h3 className="text-xl font-semibold text-gray-900 mb-6">
                                {editingItem ? 'Edit Item' : 'Add New Item'}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {['name', 'price', 'description', 'category'].map((field) => (
                                    <div key={field} className="relative">
                                        {field === 'category' ? (
                                            <select
                                                id={field}
                                                name={field}
                                                defaultValue={editingItem?.[field] || ''}
                                                required
                                                className="peer w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-black focus:ring-1 focus:ring-black transition-all duration-200 outline-none"
                                            >
                                                <option value="" disabled>Select a category</option>
                                                <option value="Snacks">Snacks</option>
                                                <option value="Beverages">Beverages</option>
                                                <option value="Combos">Combos</option>
                                                <option value="Desserts">Desserts</option>
                                                <option value="Others">Others</option>
                                            </select>
                                        ) : (
                                            <input
                                                type={field === 'price' ? 'number' : 'text'}
                                                id={field}
                                                name={field}
                                                step={field === 'price' ? '0.01' : undefined}
                                                min={field === 'price' ? '0' : undefined}
                                                defaultValue={editingItem?.[field]}
                                                placeholder=" "
                                                required
                                                className="peer w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-black focus:ring-1 focus:ring-black transition-all duration-200 outline-none placeholder-transparent"
                                            />
                                        )}
                                        <label
                                            htmlFor={field}
                                            className="absolute left-3 -top-2.5 bg-white px-2 text-sm text-gray-600 transition-all duration-200 peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-sm peer-focus:text-black capitalize"
                                        >
                                            {field}
                                        </label>
                                    </div>
                                ))}
                            
                                {/* Image Upload Field */}
                                <div className="relative">
                                    <input
                                        type="file"
                                        id="image"
                                        name="image"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        ref={fileInputRef}
                                        className="hidden"
                                        required={!editingItem}
                                    />
                                    <div className="border border-gray-200 rounded-xl p-4">
                                        <div className="flex flex-col items-center gap-4">
                                            {(imagePreview || editingItem?.image) && (
                                                <div className="w-full h-48 rounded-lg overflow-hidden bg-gray-50">
                                                    <img
                                                        src={imagePreview || editingItem?.image}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50"
                                            >
                                                {imagePreview || editingItem?.image ? 'Change Image' : 'Upload Image'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors duration-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 text-sm font-medium text-white bg-black rounded-xl hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors duration-200"
                                    >
                                        {editingItem ? 'Save Changes' : 'Add Item'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
