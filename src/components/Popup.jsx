import { useState, useEffect } from "react";
import { isAfter, isSameDay, subDays,parse} from 'date-fns';
import { DurationDropdown } from "./DurationDropdown";
import { NewslettersDropdown } from "./NewslettersDropdown";
import { SegmentedControl } from "./SegmentedControl";
import { SignIn } from "@/auth/SignIn"; // Assuming SignIn component is for UI only now
import { BoxIcon, HouseIcon, PanelsTopLeftIcon, LogOutIcon } from "lucide-react";
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

export function Popup() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newsletters, setNewsletters] = useState([]);
  const [allProviders,setAllProviders] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [readFilter, setReadFilter] = useState("all"); // Commented out as unused for now
  const [durationFilter,setDurationFilter]=useState("")
  const [selectedProviders,setSelectedProviders]=useState([])
  const [resetState,setResetState]=useState(false)
console.log("Unique providers :",allProviders)


const handleReset=()=>
{
    setDurationFilter("1");
    setSelectedProviders([])
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
    setSelectedProviders(value)
    setResetState(true)
  }

  
  const handleReadStatus = (value) => {
    setReadFilter(value); // Corresponding setter also commented out
    console.log('Read changed:', value);
    // Future: Trigger refetch or client-side filter of newsletters based on 'value'
  };



  // Check auth status on component mount
useEffect(() => {
    setIsLoading(true);
    chrome.runtime.sendMessage({ action: 'getAuthStatus' }, (response) => {
      if (response && response.isAuthenticated) {
        setIsAuthenticated(true);
        setUserInfo(response.userInfo);
        // Fetch initial newsletters from storage
        chrome.storage.local.get('newsletters', ({ newsletters: storedNewsletters }) => {
          setNewsletters(storedNewsletters || []);
          setAllProviders(getUniqueProviders(storedNewsletters || []));
        });
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
        if(changes.newsletters?.newValue){
          setNewsletters(changes.newsletters.newValue);
          setAllProviders(getUniqueProviders(changes.newsletters.newValue));
        }
        if (changes.userInfo) {
          setUserInfo(changes.userInfo.newValue);
        }
        if (changes.newsletters) {
          console.log("Newsletters in Popup : ",newsletters)
          setNewsletters(changes.newsletters.newValue || []);
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
  }, []);

/*useEffect(()=>
{
  if(!resetState){
    console.log("I ran")
    handleReset()
  }
},[resetState])*/

const extractProviderInfo = (from) => {
  const matches = from.match(/(.*?)\s*<(.+?)>/);
  if (matches) {
    return {
      value: matches[2], // email address
      label: matches[1].trim() || matches[2] // display name or email if no name
    };
  }
  return { value: from, label: from };
};

const getUniqueProviders = (newsletters) => {
  const providers = new Set();
  const uniqueProviders = [{ value: "all", label: "All" }];
  
  newsletters.forEach(nl => {
    if (nl.from && !providers.has(nl.from)) {
      providers.add(nl.from);
      uniqueProviders.push(extractProviderInfo(nl.from));
    }
  });

  console.log(uniqueProviders)
  
  return uniqueProviders;
};


const applyFilters = (newsletters, { duration, providers, readStatus }) => {
  return newsletters.filter(nl => {
      const now = new Date();  //gives date in GMT
      const inputFormat = 'E, dd MMM yyyy HH:mm:ss xx';
        // Clean up the date string first
      const cleanDate = nl.date
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\([^)]*\)/g, '') // Remove anything in parentheses like (UTC)
        .trim(); // Remove leading/trailing spaces
      const dateObject = parse(cleanDate, inputFormat, now);
      const isoStringGMT = dateObject.toISOString();

    // Duration filter
    const passesDateFilter = () => {
      if (!duration) return true;
      if (Array.isArray(duration)) {
        const [customDate, customTime] = duration;
        // if(!customTime) customTime='00:00:00'
        const filterDate = new Date(`${customDate}T${customTime}`);  //convert from date/time to GMT
        console.log(filterDate)
        console.log(isAfter(isoStringGMT, filterDate))
        return isAfter(isoStringGMT, filterDate); 
      }
      
      switch(duration) {
        case "1": 
          return true;
        case "2": // Today
          return isSameDay(isoStringGMT, now);
        case "3": // Last 7 days
          console.log(isAfter(isoStringGMT,now))
          return isAfter(isoStringGMT, subDays(now, 7));   //subtract 7 days from now
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
  }).sort((a, b) => new Date(b.date) - new Date(a.date)); // Always newest first
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

  return (
    <div className="min-w-[1000px] max-w[1200px] min-h-[900px] max-height-[1000px] p-4">
      {!isAuthenticated ? (
        <SignIn isLoading={isLoading} handleAuthClick={handleAuthClick} />
      ) : (
        <Tabs className="max-w-full"  defaultValue="tab-1">
          <div className="flex justify-between items-center mb-3">
            <ScrollArea className="flex-grow">
              <TabsList>
                <TabsTrigger value="tab-1">
                  <HouseIcon className="-ms-0.5 me-1.5 opacity-60" size={16} aria-hidden="true" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="tab-2" className="group">
                  <PanelsTopLeftIcon className="-ms-0.5 me-1.5 opacity-60" size={16} aria-hidden="true" />
                  Bookmarks
                  <Badge
                    className="bg-primary/15 ms-1.5 min-w-5 px-1 transition-opacity group-data-[state=inactive]:opacity-50"
                    variant="secondary">
                    0 {/* Placeholder */}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="tab-3" className="group">
                  <BoxIcon className="-ms-0.5 me-1.5 opacity-60" size={16} aria-hidden="true" />
                  Read Later
                   {/* <Badge className="ms-1.5 transition-opacity group-data-[state=inactive]:opacity-50">New</Badge> */}
                </TabsTrigger>
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
            <Button variant="ghost" size="icon" onClick={handleSignOutClick} title="Sign Out">
              <LogOutIcon size={18} />
            </Button>
          </div>

          <TabsContent value="tab-1">
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Filter Newsletters</CardTitle>
                <CardDescription>
                  Filter by date, provider, or read status.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="max-w-[800px] flex justify-center items-center gap-4 space-x-2">
                  <DurationDropdown onChange={handleDurationStatus} value={durationFilter}/>
                  <NewslettersDropdown onChange={handleProviderStatus}  providers={allProviders} value={selectedProviders} />   {/*search is happening through value and not label*/}
                  <SegmentedControl defaultValue="All" onChange={handleReadStatus} value={readFilter}/>
                  <button className="bg-slate-600 rounded-xl whitespace-nowrap" type='button' onClick={handleReset} disabled={!resetState}>Reset filters</button> {/* write proper disabled/opaque logic for this */}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Newsletters</CardTitle>
                {userInfo && <CardDescription>Logged in as {userInfo.email}</CardDescription>}
              </CardHeader>
              <CardContent>
                {isLoading && newsletters.length === 0 && <p>Loading newsletters...</p>}
                {!isLoading && newsletters.length === 0 && <p>No newsletters found or yet to be fetched.</p>}
                {newsletters.length > 0 && (
                  <ScrollArea className="h-[300px]">
                    <ul className="space-y-2">
                      {applyFilters(newsletters, {
                        duration: durationFilter,
                        providers: selectedProviders,
                        readStatus: readFilter
                          }).map((nl) => {
                        const subject = nl?.subject || 'No Subject'
                        const from = nl?.from || 'Unknown Sender';
                        const date = nl?.date;
                        return (
                          <li key={nl?.id} className="p-2 border rounded hover:bg-muted">
                            <div className="font-semibold text-sm truncate" title={subject}>{subject}</div>
                            <div className="text-xs text-muted-foreground truncate" title={from}>{from}</div>
                            {date && <div className="text-xs text-muted-foreground">{new Date(date).toLocaleDateString()}</div>}
                          </li>
                        );
                      })}
                    </ul>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tab-2">
            <Card>
              <CardHeader>
                <CardTitle>Bookmarks</CardTitle>
                <CardDescription>
                  Your bookmarked newsletters will appear here.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Bookmark feature coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tab-3">
            <Card>
              <CardHeader>
                <CardTitle>Read Later</CardTitle>
                <CardDescription>
                  Newsletters you've marked to read later.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Read later feature coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
