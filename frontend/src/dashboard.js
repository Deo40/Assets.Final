import React, { useEffect, useState, Fragment } from 'react';
import axios from 'axios';
import { Dialog, Transition } from '@headlessui/react';
import {
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const API_KEY = localStorage.getItem('apiKey');

  const [assets, setAssets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewAsset, setViewAsset] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editAsset, setEditAsset] = useState({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAsset, setNewAsset] = useState({ name: '', type: '', status: 'active' });

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/assets', {
          headers: { 'x-api-key': API_KEY },
        });
        setAssets(res.data);
      } catch (err) {
        console.error('Error fetching assets:', err);
      }
    };
  
    fetchAssets();
  }, [API_KEY]);
  
  const handleAddAsset = async () => {
    if (!newAsset.name || !newAsset.type || !newAsset.status) {
      alert("All fields are required.");
      return;
    }
  
    try {
      const res = await axios.post('/api/assets', newAsset, {
        headers: { 'x-api-key': API_KEY },
      });
  
      setAssets((prevAssets) => [...prevAssets, res.data]);
      setNewAsset({ name: '', type: '', status: 'active' }); // reset
      setIsAddModalOpen(false); // close modal
    } catch (err) {
      console.error('Add asset error:', err);
      alert("Failed to add asset. See console for details.");
    }
  };
  
  const handleUpdateAsset = async () => {
    try {
      const res = await axios.put(`/api/assets/${viewAsset.asset_id}`, editAsset, {
        headers: { 'x-api-key': API_KEY },
      });
      const updatedAssets = assets.map((a) =>
        a.asset_id === viewAsset.asset_id ? res.data : a
      );
      setAssets(updatedAssets);
      setViewAsset(res.data);
      setIsEditing(false);
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  const handleDeleteAsset = async () => {
    try {
      await axios.delete(`/api/assets/${viewAsset.asset_id}`, {
        headers: { 'x-api-key': API_KEY },
      });
      setAssets(assets.filter((a) => a.asset_id !== viewAsset.asset_id));
      setViewAsset(null);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const filteredAssets = assets.filter((asset) =>
    asset.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = async () => {
    try {
      await axios.post('/api/logout', {}, {
        headers: { 'x-api-key': API_KEY },
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('apiKey');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100 relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-10">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">Dashboard</h1>

          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg"
            />
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Asset Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {filteredAssets.map((asset) => (
            <div
              key={asset.asset_id}
              className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition"
            >
              <div className="flex items-center space-x-3">
                {asset.status === 'active' ? (
                  <CheckCircleIcon className="h-6 w-6 text-green-500" />
                ) : (
                  <XCircleIcon className="h-6 w-6 text-red-500" />
                )}
                <h2 className="text-xl font-semibold text-gray-800">{asset.name}</h2>
              </div>
              <p className="mt-2 text-sm text-gray-600">Type: {asset.type}</p>
              <p
                className={`mt-2 inline-block px-3 py-1 text-xs font-semibold rounded-full 
                ${asset.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
              >
                {asset.status.toUpperCase()}
              </p>
              <div className="mt-4">
                <button
                  onClick={() => setViewAsset(asset)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm"
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Floating Add Button */}
        <button
          className="fixed bottom-8 right-8 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg"
          onClick={() => setIsAddModalOpen(true)}
        >
          <PlusIcon className="h-6 w-6" />
        </button>

        {/* View/Edit Modal */}
        <Transition appear show={!!viewAsset} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={() => setViewAsset(null)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>
            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md bg-white rounded-2xl p-6 text-left shadow-xl">
                    {viewAsset && (
                      <>
                        <div className="flex justify-between items-center">
                          <Dialog.Title className="text-lg font-medium text-gray-900">
                            {isEditing ? 'Edit Asset' : 'Asset Details'}
                          </Dialog.Title>
                          <XMarkIcon
                            className="h-5 w-5 cursor-pointer text-gray-500"
                            onClick={() => {
                              setIsEditing(false);
                              setViewAsset(null);
                            }}
                          />
                        </div>
                        <div className="mt-4 space-y-4">
                          {isEditing ? (
                            <>
                              <input
                                value={editAsset?.name || ''}
                                onChange={(e) =>
                                  setEditAsset({ ...editAsset, name: e.target.value })
                                }
                                className="w-full border p-2 rounded"
                                placeholder="Asset Name"
                              />
                              <input
                                value={editAsset?.type || ''}
                                onChange={(e) =>
                                  setEditAsset({ ...editAsset, type: e.target.value })
                                }
                                className="w-full border p-2 rounded"
                                placeholder="Type"
                              />
                              <select
                                value={editAsset?.status || 'active'}
                                onChange={(e) =>
                                  setEditAsset({ ...editAsset, status: e.target.value })
                                }
                                className="w-full border p-2 rounded"
                              >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                              </select>
                            </>
                          ) : (
                            <>
                              <p><strong>Name:</strong> {viewAsset?.name}</p>
                              <p><strong>Type:</strong> {viewAsset?.type}</p>
                              <p><strong>Status:</strong> {viewAsset?.status}</p>
                            </>
                          )}
                        </div>
                        <div className="mt-6 flex justify-end space-x-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={handleUpdateAsset}
                                className="bg-green-600 text-white px-4 py-2 rounded"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setIsEditing(false)}
                                className="bg-gray-300 px-4 py-2 rounded"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditAsset(viewAsset);
                                  setIsEditing(true);
                                }}
                                className="bg-indigo-600 text-white px-4 py-2 rounded"
                              >
                                Edit
                              </button>
                              <button
                                onClick={handleDeleteAsset}
                                className="bg-red-600 text-white px-4 py-2 rounded"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>

        {/* Add Modal */}
        <Transition appear show={isAddModalOpen} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={() => setIsAddModalOpen(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>
            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md bg-white rounded-2xl p-6 text-left shadow-xl">
                    <Dialog.Title className="text-lg font-medium text-gray-900">
                      Add New Asset
                    </Dialog.Title>
                    <div className="mt-4 space-y-4">
                      <input
                        value={newAsset.name}
                        onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                        className="w-full border p-2 rounded"
                        placeholder="Asset Name"
                      />
                      <input
                        value={newAsset.type}
                        onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
                        className="w-full border p-2 rounded"
                        placeholder="Asset Type"
                      />
                      <select
                        value={newAsset.status}
                        onChange={(e) => setNewAsset({ ...newAsset, status: e.target.value })}
                        className="w-full border p-2 rounded"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={handleAddAsset}
                        className="bg-indigo-600 text-white px-4 py-2 rounded"
                      >
                        Add Asset
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </div>
  );
};

export default Home;
