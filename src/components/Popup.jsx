import { useState, useEffect } from "react";
import { isAfter, isSameDay, subDays,parse} from 'date-fns';
import { useOnboarding } from "../context/OnboardingContext";
import { useSettings } from "../context/SettingsContext";
import { DurationDropdown } from "./DurationDropdown";
import { NewslettersDropdown } from "./NewslettersDropdown";
import { SegmentedControl } from "./SegmentedControl";
import { ContextMenu } from "./ContextMenu";
import { SettingsPanel } from "./SettingsPanel";
import { SelectProviders } from "./SelectProviders";
import { SignIn } from "@/auth/SignIn"; // Assuming SignIn component is for UI only now
import { BoxIcon, HouseIcon, PanelsTopLeftIcon, LogOutIcon,RefreshCw, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { IconRestore } from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ToolTip } from "./ToolTip";
//centralize newsletter state in onBoardinhg Context
export function Popup() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // const [newsletters, setNewsletters] = useState([]);
  // const [allProviders,setAllProviders] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [readFilter, setReadFilter] = useState("all");
  const [durationFilter,setDurationFilter]=useState("1")
  const [selectedSenders,setSelectedSenders]=useState([])
  const [resetState,setResetState]=useState(false)
  const [contextMenu, setContextMenu] = useState({  
  isOpen: false,
  position: { x: 0, y: 0 },
  newsletter: null
}); 
const [syncStatus, setSyncStatus] = useState({
  isInitialSyncComplete: false,
  lastFullSyncTime: null,
  lastDeltaSyncTime: null,
  totalNewslettersProcessed: 0,
  lastSyncErrors: []
});
const [isSyncing, setIsSyncing] = useState(false);
const { 
    onboardingCompleted, 
    newsletters,
    setNewsletters,
    allProviders,
    selectedProviders,
    blockedProviders,
    updateProviders, 
    isLoading: onboardingLoading 
  } = useOnboarding();
const { userPreferences } = useSettings();
console.log("Newsletters after filtering from blockers : ",newsletters)
console.log(`Current Filters : duration - ${durationFilter} , providers - ${selectedSenders} ,read filter - ${readFilter}`)
  // info : Check auth status on component mount
useEffect(() => {
    setIsLoading(true);
    chrome.runtime.sendMessage({ action: 'getAuthStatus' }, (response) => {
      if (response && response.isAuthenticated) {
        setIsAuthenticated(true);
        setUserInfo(response.userInfo);
        // Fetch initial newsletters from storage
        /*chrome.storage.local.get('newsletters', ({ newsletters: storedNewsletters }) => {
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
        });*/
      } else {
        setIsAuthenticated(false);
        setUserInfo(null);
      }
      setIsLoading(false);
    });

// Listener for storage changes (e.g., new newsletters fetched by background)
const storageChangedListener = (changes, area) => {
      if (area === 'local') {
        if (changes.isAuthenticated) {
          setIsAuthenticated(changes.isAuthenticated.newValue);
        }
        /*if(changes.newsletters?.newValue){
          console.log("Change in Newsletters in Popup : ",newsletters)
          setNewsletters(changes.newsletters.newValue.filter(nl=>!(new Set(blockedProviders
          .map(blocked=>blocked.value)))
          .has((extractProviderInfo(nl.from)).value)) || []);
          setAllProviders(getUniqueProviders(changes.newsletters.newValue));
          updateProviders(getUniqueProviders(changes.newsletters.newValue).filter(p => p.value !== 'all'));
          console.log("Update provider called from storage listener")
        }*/
        if (changes.userInfo) {
          setUserInfo(changes.userInfo.newValue);
        }
        // If logged out via storage change, update state
        if (changes.isAuthenticated && changes.isAuthenticated.newValue === false) {
          setNewsletters([]);
          setUserInfo(null);
        }
      }
    };
    chrome.storage.onChanged.addListener(storageChangedListener);

    return () => {
      chrome.storage.onChanged.removeListener(storageChangedListener);
    };
  }, []);  //removed all deps to avoid infinite re-renders (newsletters and updatednewsletters)

//info : monitor sync status
useEffect(() => {
  if (isAuthenticated) {
    // Get initial sync status
    chrome.runtime.sendMessage({ action: 'getSyncStatus' }, (response) => {
      if (response) {
        setSyncStatus(response);
      }
    });

    // Listen for sync status updates
    const syncStatusListener = (changes, area) => {
      if (area === 'local' && changes.syncStatus) {
        setSyncStatus(changes.syncStatus.newValue);
      }
    };

    chrome.storage.onChanged.addListener(syncStatusListener);
    return () => chrome.storage.onChanged.removeListener(syncStatusListener);
  }
}, [isAuthenticated]);

// Add these handler functions
const handleManualSync = async () => {
  setIsSyncing(true);
  try {
    const response = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'forceSyncNewsletters' }, resolve);
    });
    
    if (response.success) {
      console.log('Manual sync completed:', response.message);
    } else {
      console.error('Manual sync failed:', response.error);
    }
  } catch (error) {
    console.error('Manual sync error:', error);
  } finally {
    setIsSyncing(false);
  }
};

const handleRetryFailed = async () => {
  try {
    const response = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'retryFailedMessages' }, resolve);
    });
    
    if (response.success) {
      console.log('Retry completed:', response.message);
    } else {
      console.error('Retry failed:', response.error);
    }
  } catch (error) {
    console.error('Retry error:', error);
  }
};


const handleReset=()=>
{
    setDurationFilter("1");
    setSelectedSenders([])
    setReadFilter("all"); // Corresponding setter also commented out
    setResetState(false)
}
const handleDurationStatus=(value)=>
  {
    console.log("Selected duration filter : ",value)
    setDurationFilter(value);
    setResetState(true)
    
}

const handleProviderStatus=(value)=>
{
  console.log("Selected providers : ",value)
  setSelectedSenders(value)
  setResetState(true)
}

  
const handleReadStatus = (value) => {
    setReadFilter(value); // Corresponding setter also commented out
    setResetState(true)
    // Future: Trigger refetch or client-side filter of newsletters based on 'value'
  };


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

// Handle date parsing with multiple format attempts
const parseNewsletterDate = (dateString) => {
      if (!dateString) return null;
      
      try {
        // Clean up the date string
        const cleanDate = dateString
          .replace(/\s+/g, ' ')
          .replace(/\([^)]*\)/g, '')
          .trim();
        
        // Try multiple date formats
        const formats = [
          'E, dd MMM yyyy HH:mm:ss xx',  // Original format
          'dd MMM yyyy HH:mm:ss xx',     // Without day name
          'E, dd MMM yyyy HH:mm:ss X',   // Different timezone format
          'dd MMM yyyy HH:mm:ss X'       // Without day name, different timezone
        ];
        
        // Try parsing with date-fns formats
        for (const format of formats) {
          try {
            const parsed = parse(cleanDate, format, now);
            if (!isNaN(parsed.getTime())) {
              return parsed;
            }
          } catch (e) {
            continue;
          }
        }
        
        // Fallback to native Date parsing
        const nativeDate = new Date(cleanDate);
        if (!isNaN(nativeDate.getTime())) {
          return nativeDate;
        }
        
        // Last resort: try with timezone normalization
        const normalizedDate = cleanDate.replace(/-0000$/, '+0000');
        const finalAttempt = new Date(normalizedDate);
        if (!isNaN(finalAttempt.getTime())) {
          return finalAttempt;
        }
        
        return null;
      } catch (error) {
        console.warn('Failed to parse date:', dateString, error);
        return null;
      }
    };


const applyFilters = (newsletters, { duration, providers, readStatus }) => {
  return newsletters.filter(nl => {
    const now = new Date();
    
    
    const dateObject = parseNewsletterDate(nl.date);
    if (!dateObject) {
      console.warn('Skipping newsletter with invalid date:', nl.date);
      return false; // Skip newsletters with unparseable dates
    }

    // Duration filter
    const passesDateFilter = () => {
      if (!duration) return true;
      if (Array.isArray(duration)) {
        const [customDate, customTime] = duration;
        try {
          const filterDate = new Date(`${customDate}T${customTime}`);
          if (isNaN(filterDate.getTime())) return true; // Skip filter if invalid
          return isAfter(dateObject, filterDate);
        } catch (error) {
          console.warn('Invalid custom date filter:', error);
          return true;
        }
      }
      
      switch(duration) {
        case "1": 
          return true;
        case "2": // Today
          return isSameDay(dateObject, now);
        case "3": // Last 7 days
          return isAfter(dateObject, subDays(now, 7));
        default:
          return true;
      }
    };

    // Provider filter
    const passesProviderFilter = () => {
      if (!providers.length || providers[0]?.value === "all") return true;
      return providers.some(p => nl.from.includes(p.value));
    };

    // Read status filter
    const passesReadFilter = () => {
      switch(readStatus.toLowerCase()) {
        case "read":
          return nl.read;
        case "unread":
          return !nl.read;
        default:
          return true;
      }
    };

    return passesDateFilter() && passesProviderFilter() && passesReadFilter();
  }).sort((a, b) => {
    // Safe date sorting
    const dateA = parseNewsletterDate(a.date);
    const dateB = parseNewsletterDate(b.date);
    
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    
    return dateB.getTime() - dateA.getTime();
  });
};

const handleAuthClick = () => {
    setIsLoading(true);
    chrome.runtime.sendMessage({ action: 'login' }, (response) => {
      setIsLoading(false);
      if (response && response.success) {
        setIsAuthenticated(true);
        setUserInfo(response.userInfo);
        // Newsletters will be updated via storage listener or initial fetch in background
      } else {
        console.error("Login failed:", response?.error);
        setIsAuthenticated(false);
        setUserInfo(null);
      }
    });
};

const handleSignOutClick = () => {
    setIsLoading(true);
    chrome.runtime.sendMessage({ action: 'logout' }, (response) => {
      setIsLoading(false);
      if (response && response.success) {
        setIsAuthenticated(false);
        setUserInfo(null);
        setNewsletters([]);
      } else {
        console.error("Logout failed");
        // Potentially keep user as authenticated if logout failed, or force UI update
      }
    });
};

if (isLoading && !isAuthenticated) {
    return <div className="p-4 text-center">Loading...</div>;
  }

if (isAuthenticated && !onboardingCompleted && !onboardingLoading) {
    return <SelectProviders />;
  }

//handle newsletter click
const handleNewsletterClick = (newsletter) => {
  // Create a new tab with the reader view
  const readerUrl = chrome.runtime.getURL(`reader.html?messageId=${newsletter.id}`);
  chrome.tabs.create({ url: readerUrl });
};

const handleContextMenu = (e, newsletter) => {
  e.preventDefault();
  e.stopPropagation()
  /*tf DOES THIS DO ACTUALLY? */
//  const popupContainer = document.querySelector('.min-w-\\[1000px\\]');
  const popupContainer=document.getElementById('popup');
  const popupRect = popupContainer?.getBoundingClientRect();
  console.log("Coordinates :",popupRect)
  const relativeX = popupRect ? e.clientX - popupRect.left : e.clientX;
  const relativeY = popupRect ? e.clientY - popupRect.top : e.clientY;
  console.log(`X : ${relativeX} Y :${relativeY} `)
  console.log("Context menu clicked")
  //menu doesn't overflow popup bounds
  const menuWidth = 175; 
  const menuHeight = 80; 
  const adjustedX = Math.min(relativeX, popupRect.width - menuWidth);
  const adjustedY = Math.min(relativeY, popupRect.height - menuHeight);
  console.log(`adjX : ${adjustedX} adjY :${adjustedY} `)
  setContextMenu({
    isOpen: true,
    position: { x: adjustedX, y: adjustedY },
    newsletter
  });
};

const closeContextMenu = () => {
  console.log("Context menu closed")
  setContextMenu(prev => ({ ...prev, isOpen: false }));
};

const handleBookmark = async (newsletter) => {
  try {
    const newBookmarkStatus = !newsletter.bookmark;
    await new Promise((resolve) => {
      chrome.runtime.sendMessage({
        action: 'updateNewsletterStatus',
        messageId: newsletter.id,
        updates: { bookmark: newBookmarkStatus }
      }, resolve);
    });
  } catch (error) {
    console.error('Failed to update bookmark status:', error);
  }
};

const handleReadLater = async (newsletter) => {
  try {
    const newReadLaterStatus = !newsletter.readLater;
    await new Promise((resolve) => {
      chrome.runtime.sendMessage({
        action: 'updateNewsletterStatus',
        messageId: newsletter.id,
        updates: { readLater: newReadLaterStatus }
      }, resolve);
    });
  } catch (error) {
    console.error('Failed to update read later status:', error);
  }
};

const SyncStatusBar = () => {
  const hasErrors = syncStatus.lastSyncErrors && syncStatus.lastSyncErrors.length > 0;
  const lastSyncTime = syncStatus.lastDeltaSyncTime || syncStatus.lastFullSyncTime;
  
  return (
    <div className="mb-3 p-2 bg-white rounded-lg border shadow-sm">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {isSyncing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : hasErrors ? (
            <AlertCircle className="h-4 w-4 text-orange-500" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
          
          <span className="text-sm">
            {isSyncing ? 'Syncing...' : 
             hasErrors ? 'Sync completed with errors' : 
             'Sync up to date'}
          </span>
          
          {syncStatus.totalNewslettersProcessed > 0 && (
            <Badge variant="secondary" className="text-[13px]">
              {syncStatus.totalNewslettersProcessed} newsletters
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {lastSyncTime && (
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(lastSyncTime).toLocaleTimeString()}
            </span>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleManualSync}
            disabled={isSyncing}
            title="Manual sync"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          </Button>
          
          {hasErrors && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRetryFailed}
              title="Retry failed messages"
            >
              <AlertCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
const renderNewsletterItem = (newsletter) => {
  const subject = newsletter?.subject || 'No Subject';
  const from = newsletter?.from || 'Unknown Sender';
  const date = newsletter?.date;
  const readProgress = newsletter?.readProgress || 0;
  
  return (
    <li 
      key={newsletter?.id} 
      className="p-2 border rounded hover:bg-[var(--primary-50)] cursor-pointer transition-colors relative"
      onClick={() => handleNewsletterClick(newsletter)}
      onContextMenu={(e) => handleContextMenu(e, newsletter)}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate flex items-center gap-2" title={subject}>
            {subject}
            <div className="flex gap-1">
              {newsletter.bookmark && <span className="text-xs bg-[var(--info-200)] text-blue-800 px-1 rounded">📖</span>}
              {newsletter.readLater && <span className="text-xs bg-[var(--warning-200)] text-yellow-800 px-1 rounded">🕒</span>}
              {newsletter.incomplete && <span className="text-xs bg-[var(--error-200)] text-orange-800 px-1 rounded">📄</span>}
              {!newsletter.read && <span className="text-xs bg-[var(--success-200)] text-green-800 px-1 rounded">●</span>}
            </div>
          </div>
          <div className="text-xs text-muted-foreground font-semibold truncate" title={from}>{from}</div>
          {date && <div className="font-medium leading-[1.6]  text-[11px] text-muted-foreground">{new Date(date).toLocaleDateString()}</div>}
          {newsletter.incomplete && (
            <div className="mt-1">
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div 
                  className="h-1 bg-orange-400 rounded-full"
                  style={{ width: `${readProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-1">
        <span className=" text-[var(--primary-600)] hover:text-[var(--primary-700)]"> {newsletter.incomplete ? `Continue reading (${Math.round(readProgress)}%) →` : 'Click to read →'}</span>
      </div>
    </li>
  );
};

return (
    <div id="popup" className="bg-[var(--primary-50)] relative p-4 w-[780px] h-[600px] max-w-[780px] max-h-[600px]">
      {!isAuthenticated ? (
        <SignIn isLoading={isLoading} handleAuthClick={handleAuthClick} />
      ) : ( 
        <Tabs className="max-w-full max-h-full"  defaultValue="tab-1">
          <div className="flex justify-between items-center mb-3">
            <ScrollArea className="flex-grow">
              <TabsList>
                <TabsTrigger value="tab-1">
                  <HouseIcon className="-ms-0.5 me-1.5 opacity-60" size={16} aria-hidden="true" />
                  Main
                </TabsTrigger>
                <TabsTrigger value="tab-2" className="group">
                  <PanelsTopLeftIcon className="-ms-0.5 me-1.5 opacity-60" size={16} aria-hidden="true" />
                  Bookmarks
                  <Badge
                    className="bg-primary/15 ms-1.5 min-w-5 px-1 transition-opacity group-data-[state=inactive]:opacity-50"
                    variant="secondary">
                    {newsletters.filter(nl => nl.bookmark).length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="tab-3" className="group">
                  <BoxIcon className="-ms-0.5 me-1.5 opacity-60" size={16} aria-hidden="true" />
                  Saved
                  <Badge
                    className="bg-primary/15 ms-1.5 min-w-5 px-1 transition-opacity group-data-[state=inactive]:opacity-50"
                    variant="secondary">
                      {newsletters.filter(nl => nl.readLater || nl.incomplete).length}
                  </Badge>
                </TabsTrigger>
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
            <ToolTip info="Settings">
              <SettingsPanel/>
            </ToolTip>
            <ToolTip info="Logout">
              <Button variant="ghost" size="icon" onClick={handleSignOutClick} title="Sign Out">
                <LogOutIcon size={18} />
              </Button>
            </ToolTip>
          </div>
          <SyncStatusBar /> {/* Add the sync status bar here */}
          <TabsContent  value="tab-1">
            <Card className="mb-4 ">  {/*take whatever space you need */}
              <CardHeader>
                <CardTitle>Filter Newsletters</CardTitle>
                <CardDescription>
                  Filter by date, provider, or read status.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="max-w-full flex justify-around items-center gap-4 ">
                  <DurationDropdown onChange={handleDurationStatus} value={durationFilter}/>
                  <NewslettersDropdown onChange={handleProviderStatus}  providers={selectedProviders} value={selectedSenders|| []} />   {/*search is happening through value and not label*/}
                  <SegmentedControl defaultValue="All" onChange={handleReadStatus} value={readFilter}/>
                  <ToolTip info="Reset Filters">
                    <Button variant="ghost"  onClick={handleReset} disabled={!resetState}>
                        <IconRestore size={64}/>
                    </Button> {/* write proper disabled/opaque logic for this */}
                  </ToolTip>
                </div>
              </CardContent>
            </Card>

           <Card className="">  {/*claim any positve extra space left by card1 */}
              <CardHeader>  {/*again take whatever space you need */}
                <CardTitle className="flex items-center justify-between">
                <span>Your Newsletters</span>
                {/* Add sync info */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {syncStatus.isInitialSyncComplete ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Synced
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-orange-500" />
                      Initial sync pending
                    </span>
                  )}
                </div>
              </CardTitle>
              {userInfo && <CardDescription>Logged in as {userInfo.email}</CardDescription>}
            </CardHeader>
            <CardContent className="">
              {isLoading && newsletters.length === 0 && (
                <div className="flex items-center gap-2 p-4">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <p>Loading newsletters...</p>
                </div>
              )}
              {!isLoading && newsletters.length === 0 && !syncStatus.isInitialSyncComplete && (
                <div className="text-center p-4">
                  <p className="mb-2">No newsletters found yet.</p>
                  <Button onClick={handleManualSync} disabled={isSyncing}>
                    {isSyncing ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        Syncing...
                      </>
                    ) : (
                      'Start Sync'
                    )}
                  </Button>
                </div>
              )}
              {!isLoading && newsletters.length === 0 && syncStatus.isInitialSyncComplete && (
                <p>No newsletters match your current filters.</p>
              )}
              {newsletters.length > 0 && (
                <ScrollArea className="h-[234px]">
                  <ul className="space-y-2">
                    {applyFilters(newsletters, {
                      duration: durationFilter,
                      providers: selectedSenders,
                      readStatus: readFilter
                    }).map(renderNewsletterItem)}
                  </ul>
                </ScrollArea>
              )}
            </CardContent>
            </Card>
          </TabsContent>
              {/*Bookmarking space */}
          <TabsContent value="tab-2">
            <Card>
              <CardHeader>
                <CardTitle>Bookmarks</CardTitle>
                <CardDescription>
                  Your bookmarked newsletters will appear here.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
        const bookmarkedNewsletters = newsletters.filter(nl => nl.bookmark);
        return bookmarkedNewsletters.length > 0 ? (
          <ScrollArea className="h-[300px]">
            <ul className="space-y-2">
              {bookmarkedNewsletters.map(renderNewsletterItem)}
            </ul>
          </ScrollArea>
        ) : (
          <p>No bookmarked newsletters yet.</p>
        );
      })()}
              </CardContent>
            </Card>
          </TabsContent>
              {/*incomplete/read later space */}
          <TabsContent value="tab-3">
            <Card>
              <CardHeader>
                <CardTitle>Saved</CardTitle>
                <CardDescription>
                  Newsletters marked for read later and incomplete newsletters.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
        const savedNewsletters = newsletters.filter(nl => nl.readLater || nl.incomplete);
        return savedNewsletters.length > 0 ? (
          <ScrollArea className="h-[300px]">
            <ul className="space-y-2">
              {savedNewsletters.map(renderNewsletterItem)}
            </ul>
          </ScrollArea>
        ) : (
          <p>No saved newsletters yet.</p>
        );
      })()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
      {contextMenu.isOpen && (
      <ContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        newsletter={contextMenu.newsletter}
        onClose={closeContextMenu}
        onBookmark={handleBookmark}
        onReadLater={handleReadLater}
      />)}
    </div>
  );
}


