import { useState, useEffect } from "react";
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
  const [userInfo, setUserInfo] = useState(null);
  // const [readFilter, setReadFilter] = useState("all"); // Commented out as unused for now

  const handleFilterChange = (value) => {
    // setReadFilter(value); // Corresponding setter also commented out
    console.log('Filter changed:', value);
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
        if (changes.userInfo) {
          setUserInfo(changes.userInfo.newValue);
        }
        if (changes.newsletters) {
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
    <div className="w-[400px] p-4">
      {!isAuthenticated ? (
        <SignIn isLoading={isLoading} handleAuthClick={handleAuthClick} />
      ) : (
        <Tabs defaultValue="tab-1">
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
                <div className="flex justify-between items-center space-x-2">
                  <DurationDropdown />
                  <NewslettersDropdown />
                  <SegmentedControl defaultValue="All" onChange={handleFilterChange} />
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
                      {newsletters.map((nl) => {
                        const subject = nl.payload?.headers?.find(h => h.name === 'Subject')?.value || 'No Subject';
                        const from = nl.payload?.headers?.find(h => h.name === 'From')?.value || 'Unknown Sender';
                        const date = nl.payload?.headers?.find(h => h.name === 'Date')?.value;
                        return (
                          <li key={nl.id} className="p-2 border rounded hover:bg-muted">
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
