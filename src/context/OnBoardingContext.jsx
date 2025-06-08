import { createContext, useContext, useState, useEffect } from 'react';
// import { extractProviderInfo } from '@/components/Popup';

const OnboardingContext = createContext();   /*CREATE CONTEXT */

export const OnboardingProvider = ({ children }) => {
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [newsletters,setNewsletters]=useState([])
  const [allProviders, setAllProviders] = useState([]);
  const [selectedProviders, setSelectedProviders] = useState([]);
  const [blockedProviders, setBlockedProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // Info : Load onboarding state from storage
  useEffect(() => {
    const loadOnboardingState = async () => {
      try {
        const result = await chrome.storage.local.get([
          'onboardingCompleted',
          'newsletters',
          'allProviders',
          'selectedProviders',
          'blockedProviders'
        ]);
        setOnboardingCompleted(result.onboardingCompleted || false); //hunch : creates new object references everytime , might cause dependency alteration
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

useEffect(()=>
{
  chrome.storage.local.get('newsletters', ({ newsletters: storedNewsletters }) => {
          try {
          const newsletters = storedNewsletters || [];
          setNewsletters(newsletters.filter(nl=>!(new Set(blockedProviders
        .map(blocked=>blocked.value)))
        .has((extractProviderInfo(nl.from)).value)));
          const providers = getUniqueProviders(newsletters);
          setAllProviders(providers);
          updateProviders(providers.filter(p => p.value !== 'all'));
          console.log("Update provider called from init useEffect")
        } catch (error) {
          console.error('Error processing newsletters:', error);
          setAllProviders([]); // Fallback to empty array
        }
    })

    // Listener for storage changes (e.g., new newsletters fetched by background)
const storageChangedListener = (changes, area) => {
      if (area === 'local') {
        if(changes.newsletters?.newValue){
          // console.log("Change in Newsletters in Context : ",newsletters)
          setNewsletters(changes.newsletters.newValue.filter(nl=>!(new Set(blockedProviders
          .map(blocked=>blocked.value)))
          .has((extractProviderInfo(nl.from)).value)) || []);
          setAllProviders(getUniqueProviders(changes.newsletters.newValue));
          updateProviders(getUniqueProviders(changes.newsletters.newValue).filter(p => p.value !== 'all'));
          console.log("Update provider called from storage listener")
          }
      }
    };
    chrome.storage.onChanged.addListener(storageChangedListener);
    return () => {
      chrome.storage.onChanged.removeListener(storageChangedListener);
    };
},[blockedProviders])  //any one blocked/selected


const extractProviderInfo = (from) => {
  const matches = from.match(/(.*?)\s*<(.+?)>/);
  if (matches) {
    const [, label, email] = matches; //first element contains full match
    return {
            value: email,
            label: label.trim() || email
          }
  }
  return { value: from, label: from };
};

const getUniqueProviders = (newsletters) => {
   if (!Array.isArray(newsletters) || newsletters.length === 0) {
    // return [{ value: "all", label: "All" }];
    return [];
  }
  const providers = new Map();
  // providers.set("all", { value: "all", label: "All" });

  newsletters.forEach(nl => {
    if (nl?.from) {
        const providerInfo=extractProviderInfo(nl.from)
        if (!providers.has(providerInfo.value)) {
          providers.set(providerInfo.value,providerInfo );
        }
      }
    }
  );

  return Array.from(providers.values())
};

  // info : Save to storage whenever state changes
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
    newsletters,
    setNewsletters,
    allProviders,
    selectedProviders,
    blockedProviders,
    isLoading,
    completeOnboarding,
    updateProviders,
    updatePreferences,
    resetOnboarding
  };
/*PROVIDE CONTEXT*/
  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};
/*CONSUME CONTEXT*/
export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};