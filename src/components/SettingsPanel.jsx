//to update /delete newsletter sender list
//toggle theme
//set priority senders
import { useState } from 'react';
import { useModal } from '../hooks/useModal';
import { useSettings } from '../context/SettingsContext';
import { useOnboarding } from '../context/OnboardingContext';
import { SelectProviders } from './SelectProviders';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Settings, 
  X, 
  Users, 
  Palette, 
  Sliders, 
  Info,
  Edit3,
  RotateCcw
} from 'lucide-react';

export const SettingsPanel = () => {
  const { open: isOpen, openModal, closeModal } = useModal();
  const { open: isProviderModalOpen, openModal: openProviderModal, closeModal: closeProviderModal } = useModal();
  const [activeTab, setActiveTab] = useState('providers');
  
  const { userPreferences, updatePreference, resetSettings } = useSettings();
  const { 
    selectedProviders, 
    blockedProviders, 
    allProviders, 
    resetOnboarding 
  } = useOnboarding();

  const tabs = [
    { id: 'providers', label: 'Provider Preferences', icon: Users },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'behavior', label: 'Behavior', icon: Sliders },
    { id: 'about', label: 'About', icon: Info }
  ];

  const handleResetAllSettings = async () => {
    if (confirm('Are you sure you want to reset all settings? This will clear your provider preferences and reset all options to default.')) {
      await resetSettings();
      await resetOnboarding();
      closeModal();
    }
  };

  const renderProviderPreferences = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Current Selection Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-700">{selectedProviders.length}</div>
            <div className="text-sm text-green-600">Selected Providers</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="text-2xl font-bold text-red-700">{blockedProviders.length}</div>
            <div className="text-sm text-red-600">Blocked Providers</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-700">{allProviders.length}</div>
            <div className="text-sm text-blue-600">Total Providers</div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Provider Management</h3>
          <Button onClick={openProviderModal} className="flex items-center gap-2">
            <Edit3 size={16} />
            Update Preferences
          </Button>
        </div>
        
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-green-700 mb-2">Recently Selected Providers</h4>
            <div className="flex flex-wrap gap-2">
              {selectedProviders.slice(0, 5).map(provider => (
                <Badge key={provider.value} variant="secondary" className="bg-green-100 text-green-800">
                  {provider.label}
                </Badge>
              ))}
              {selectedProviders.length > 5 && (
                <Badge variant="outline">+{selectedProviders.length - 5} more</Badge>
              )}
            </div>
          </div>
          
          {blockedProviders.length > 0 && (
            <div>
              <h4 className="font-medium text-red-700 mb-2">Recently Blocked Providers</h4>
              <div className="flex flex-wrap gap-2">
                {blockedProviders.slice(0, 5).map(provider => (
                  <Badge key={provider.value} variant="secondary" className="bg-red-100 text-red-800">
                    {provider.label}
                  </Badge>
                ))}
                {blockedProviders.length > 5 && (
                  <Badge variant="outline">+{blockedProviders.length - 5} more</Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAppearance = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Theme Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <div className="font-medium">Theme</div>
              <div className="text-sm text-gray-500">Choose your preferred theme</div>
            </div>
            <select 
              className="px-3 py-1 border rounded-md bg-gray-100 cursor-not-allowed"
              disabled
              value={userPreferences.theme}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <div className="font-medium">View Mode</div>
              <div className="text-sm text-gray-500">Adjust content density</div>
            </div>
            <select 
              className="px-3 py-1 border rounded-md bg-gray-100 cursor-not-allowed"
              disabled
              value={userPreferences.viewMode}
            >
              <option value="compact">Compact</option>
              <option value="comfortable">Comfortable</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <div className="font-medium">Font Size</div>
              <div className="text-sm text-gray-500">Adjust text size</div>
            </div>
            <select 
              className="px-3 py-1 border rounded-md bg-gray-100 cursor-not-allowed"
              disabled
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-sm text-yellow-800">
            <strong>Coming Soon:</strong> Theme and appearance customization will be available in a future update.
          </div>
        </div>
      </div>
    </div>
  );

  const renderBehavior = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Reading Behavior</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <div className="font-medium">Auto-mark as Read</div>
              <div className="text-sm text-gray-500">Automatically mark newsletters as read when opened</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={userPreferences.autoMarkRead}
                onChange={(e) => updatePreference('autoMarkRead', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <div className="font-medium">Notifications</div>
              <div className="text-sm text-gray-500">Get notified about new newsletters</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={userPreferences.notificationsEnabled}
                onChange={(e) => updatePreference('notificationsEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <div className="font-medium">Default Tab</div>
              <div className="text-sm text-gray-500">Which tab to show when opening the extension</div>
            </div>
            <select 
              className="px-3 py-1 border rounded-md"
              value={userPreferences.defaultTab}
              onChange={(e) => updatePreference('defaultTab', e.target.value)}
            >
              <option value="tab-1">Main</option>
              <option value="tab-2">Bookmarks</option>
              <option value="tab-3">Saved</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAbout = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Extension Information</h3>
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <div className="font-medium">Newsletter Aggregator</div>
            <div className="text-sm text-gray-500">Version 0.1.0</div>
            <div className="text-sm text-gray-500 mt-2">
              Declutter your Gmail inbox with newsletter filtering and AI summaries.
            </div>
          </div>
          
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" disabled>
              📋 View Changelog
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              🐛 Report Issue
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              💡 Request Feature
            </Button>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3 text-red-600">Danger Zone</h3>
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <div className="mb-3">
            <div className="font-medium text-red-800">Reset All Settings</div>
            <div className="text-sm text-red-600">
              This will reset all your preferences and provider selections to default values.
            </div>
          </div>
          <Button 
            variant="destructive" 
            onClick={handleResetAllSettings}
            className="flex items-center gap-2"
          >
            <RotateCcw size={16} />
            Reset All Settings
          </Button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'providers':
        return renderProviderPreferences();
      case 'appearance':
        return renderAppearance();
      case 'behavior':
        return renderBehavior();
      case 'about':
        return renderAbout();
      default:
        return renderProviderPreferences();
    }
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={openModal} 
        title="Settings"
        className="hover:bg-gray-100"
      >
        <Settings size={18} />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 p-4 min-w-[1000px] max-w[1200px] min-h-[900px] max-height-[1000px]  bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-4/5 max-w-4xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">Settings</h2>
              <button 
                onClick={closeModal}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-1 min-h-0">
              {/* Sidebar */}
              <div className="w-64 border-r bg-gray-50 p-4">
                <nav className="space-y-2">
                  {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-100 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Icon size={18} />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Provider Selection Modal */}
      {isProviderModalOpen && (
        <SelectProviders 
          isSettingsMode={true} 
          onClose={closeProviderModal} 
        />
      )}
    </>
  );
};