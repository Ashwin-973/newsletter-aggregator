import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

const defaultPreferences = {
  theme: 'light',
  autoMarkRead: true,
  notificationsEnabled: true,
  defaultTab: 'tab-1',
  viewMode: 'comfortable'
};

export const SettingsProvider = ({ children }) => {
  const [userPreferences, setUserPreferences] = useState(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from storage
useEffect(() => {
    const loadSettings = async () => {
      try {
        const result = await chrome.storage.local.get('userPreferences');
        setUserPreferences({ ...defaultPreferences, ...result.userPreferences });
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

const updatePreference = async (key, value) => {
    const newPreferences = { ...userPreferences, [key]: value };
    setUserPreferences(newPreferences);
    
    try {
      await chrome.storage.local.set({ userPreferences: newPreferences });
    } catch (error) {
      console.error('Error saving preference:', error);
    }
  };

const updatePreferences = async (updates) => {
    const newPreferences = { ...userPreferences, ...updates };
    setUserPreferences(newPreferences);
    
    try {
      await chrome.storage.local.set({ userPreferences: newPreferences });
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

const resetSettings = async () => {
    setUserPreferences(defaultPreferences);
    try {
      await chrome.storage.local.set({ userPreferences: defaultPreferences });
    } catch (error) {
      console.error('Error resetting settings:', error);
    }
  };

  const value = {
    userPreferences,
    isLoading,
    updatePreference,
    updatePreferences,
    resetSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};
