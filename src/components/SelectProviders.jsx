import { useState, useMemo, useEffect } from "react";
import { Button } from "./ui/button";
import { BadgePlus, BadgeMinus, X, Search } from 'lucide-react';
import { useOnboarding } from "../context/OnboardingContext";

export const SelectProviders = ({ isSettingsMode = false, onClose = null }) => {
  const { 
    allProviders, 
    selectedProviders, 
    completeOnboarding, 
    updatePreferences 
  } = useOnboarding();

  const [currentSelected, setCurrentSelected] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Initialize selected providers
  useEffect(() => {
    console.log("Why am I running?")
    if (currentSelected.length === 0) {
    if (isSettingsMode) {
      setCurrentSelected(selectedProviders);
    } else {
      // First time onboarding - all providers selected by default (opt-out approach)
      setCurrentSelected(allProviders);
    }
  }
  }, [allProviders,selectedProviders,isSettingsMode]);//effect never runs whehn settings is the only dependency

  // Filter providers based on search
  const filteredAvailable = useMemo(() => {
    const available = allProviders.filter(
      provider => !currentSelected.some(selected => selected.value === provider.value)
    );
    
    if (!searchTerm) return available;
    
    return available.filter(provider =>
      provider.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.value.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allProviders, currentSelected, searchTerm]);

  const filteredSelected = useMemo(() => {
    if (!searchTerm) return currentSelected;
    
    return currentSelected.filter(provider =>
      provider.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.value.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [currentSelected, searchTerm]);

  const handleAddProvider = (providerToAdd) => {
    setCurrentSelected(prev => [...prev, providerToAdd]);
  };

  const handleRemoveProvider = (providerToRemove) => {
    console.log("Current selected :", currentSelected)
    setCurrentSelected(prev => 
      prev.filter(provider => provider.value !== providerToRemove.value)
    );
  };

  const handleSelectAll = () => {
    setCurrentSelected(allProviders);
  };

  const handleDeselectAll = () => {
    setCurrentSelected([]);
  };

  const handleSave = async () => {
    try {
      if (isSettingsMode) {
        await updatePreferences(currentSelected);
        if (onClose) onClose();
      } else {
        await completeOnboarding(currentSelected);
      }
    } catch (error) {
      console.error('Error saving provider preferences:', error);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className=" p-4 min-w-[1000px] max-w[1200px] min-h-[900px] max-height-[1000px] z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-4/5 min-w-4/5 min-h-6/7  max-w-7xl max-h-[90vh] relative flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">
              {isSettingsMode ? 'Update Newsletter Preferences' : 'Choose Your Newsletter Providers'}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {isSettingsMode 
                ? 'Modify which newsletter providers you want to receive emails from'
                : 'Select the newsletter providers you want to receive emails from. You can change this later in settings.'
              }
            </p>
          </div>
          {isSettingsMode && (
            <button 
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Search and Stats */}
        <div className="mb-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search providers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              {currentSelected.length} of {allProviders.length} providers selected
            </span>
            <div className="space-x-2">
              <button
                onClick={handleSelectAll}
                className="text-blue-600 hover:text-blue-800"
              >
                Select All
              </button>
              <button
                onClick={handleDeselectAll}
                className="text-red-600 hover:text-red-800"
              >
                Deselect All
              </button>
            </div>
          </div>
        </div>

        {/* Provider Lists */}
        <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-[300px]">
          {/* Selected providers */}
          <div className="flex-1">
            <h3 className="font-medium mb-2 text-green-700">
              Selected Providers ({filteredSelected.length})
            </h3>
            <div className="h-96 p-4 max-h-[270px] bg-green-50 border border-green-200 rounded-md flex flex-col gap-2 overflow-y-auto">
              {filteredSelected.length === 0 ? (
                <div className="text-gray-500 italic p-4 text-center">
                  {searchTerm ? 'No matching selected providers' : 'No providers selected'}
                </div>
              ) : (
                filteredSelected.map((provider, idx) => (
                  <div key={`selected-${provider.value}`} className="w-full p-3 bg-white border border-green-300 rounded shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate" title={provider.label}>
                          {provider.label}
                        </div>
                        <div className="text-xs text-gray-500 truncate" title={provider.value}>
                          {provider.value}
                        </div>
                      </div>
                      <button 
                        className="flex-shrink-0 ml-2" 
                        onClick={() => handleRemoveProvider(provider)}
                        title="Remove from selected"
                      >
                        <BadgeMinus className="text-red-500 hover:text-red-700" size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Available providers */}
          <div className="flex-1">
            <h3 className="font-medium mb-2 text-gray-700">
              Available Providers ({filteredAvailable.length})
            </h3>
            <div className="h-96 p-4 max-h-[270px] bg-gray-50 border border-gray-200 rounded-md flex flex-col gap-2 overflow-y-auto">
              {filteredAvailable.length === 0 ? (
                <div className="text-gray-500 italic p-4 text-center">
                  {searchTerm ? 'No matching available providers' : 'All providers selected'}
                </div>
              ) : (
                filteredAvailable.map((provider, idx) => (
                  <div key={`available-${provider.value}`} className="w-full p-3 bg-white border border-gray-300 rounded shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate" title={provider.label}>
                          {provider.label}
                        </div>
                        <div className="text-xs text-gray-500 truncate" title={provider.value}>
                          {provider.value}
                        </div>
                      </div>
                      <button 
                        className="flex-shrink-0 ml-2" 
                        onClick={() => handleAddProvider(provider)}
                        title="Add to selected"
                      >
                        <BadgePlus className="text-green-500 hover:text-green-700" size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <div className="text-sm text-gray-600">
            {allProviders.length - currentSelected.length} providers will be blocked
          </div>
          <div className="space-x-3">
            {isSettingsMode && (
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            )}
            <Button 
              onClick={handleSave}
              disabled={allProviders.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSettingsMode ? 'Update Preferences' : 'Complete Setup'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};