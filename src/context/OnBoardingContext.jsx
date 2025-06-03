import { createContext, useContext, useState, useEffect } from 'react';

const OnboardingContext = createContext();

export const OnboardingProvider = ({ children }) => {
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [allProviders, setAllProviders] = useState([]);
  const [selectedProviders, setSelectedProviders] = useState([]);
  const [blockedProviders, setBlockedProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load onboarding state from storage
  useEffect(() => {
    const loadOnboardingState = async () => {
      try {
        const result = await chrome.storage.local.get([
          'onboardingCompleted',
          'allProviders',
          'selectedProviders',
          'blockedProviders'
        ]);
        console.log("Do I keep running?")

        setOnboardingCompleted(result.onboardingCompleted || false); //creates new references everytime , might cause dependency alteration
        setAllProviders(result.allProviders || []);
        setSelectedProviders(result.selectedProviders || []);
        setBlockedProviders(result.blockedProviders || []);
      } catch (error) {
        console.error('Error loading onboarding state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOnboardingState();
  }, []);

  // Save to storage whenever state changes
  const saveToStorage = async (updates) => {
    try {
      await chrome.storage.local.set(updates);
    } catch (error) {
      console.error('Error saving onboarding state:', error);
    }
  };

  const completeOnboarding = async (selectedProvidersList) => {
    const blocked = allProviders.filter(
      provider => !selectedProvidersList.some(selected => selected.value === provider.value)
    );

    const updates = {
      onboardingCompleted: true,
      selectedProviders: selectedProvidersList,
      blockedProviders: blocked
    };

    setOnboardingCompleted(true);
    setSelectedProviders(selectedProvidersList);
    setBlockedProviders(blocked);
    
    await saveToStorage(updates);
  };

  const updateProviders = async (newAllProviders) => {
    // Merge with existing providers, preserving user selections
    const mergedProviders = [...allProviders];
    
    newAllProviders.forEach(newProvider => {
      if (!mergedProviders.some(existing => existing.value === newProvider.value)) {
        mergedProviders.push(newProvider);
      }
    });

    setAllProviders(mergedProviders);
    await saveToStorage({ allProviders: mergedProviders });
    console.log("Updated providers")

    // If onboarding is completed, auto-select new providers (opt-out approach)
    if (onboardingCompleted) {
      const newSelected = [...selectedProviders];
      newAllProviders.forEach(newProvider => {
        if (!selectedProviders.some(selected => selected.value === newProvider.value) &&
            !blockedProviders.some(blocked => blocked.value === newProvider.value)) {
          newSelected.push(newProvider);
        }
      });
      
      if (newSelected.length !== selectedProviders.length) {
        setSelectedProviders(newSelected);
        await saveToStorage({ selectedProviders: newSelected });
      }
    }
  };

  const updatePreferences = async (newSelectedProviders) => {
    const newBlocked = allProviders.filter(
      provider => !newSelectedProviders.some(selected => selected.value === provider.value)
    );

    const updates = {
      selectedProviders: newSelectedProviders,
      blockedProviders: newBlocked
    };

    setSelectedProviders(newSelectedProviders);
    setBlockedProviders(newBlocked);
    
    await saveToStorage(updates);
  };

  const resetOnboarding = async () => {
    const updates = {
      onboardingCompleted: false,
      selectedProviders: [],
      blockedProviders: []
    };

    setOnboardingCompleted(false);
    setSelectedProviders([]);
    setBlockedProviders([]);
    
    await saveToStorage(updates);
  };

  const value = {
    onboardingCompleted,
    allProviders,
    selectedProviders,
    blockedProviders,
    isLoading,
    completeOnboarding,
    updateProviders,
    updatePreferences,
    resetOnboarding
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};