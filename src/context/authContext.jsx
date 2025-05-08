import {useState,useEffect,createContext,useContext} from 'react'
import { initializeGapiClient } from '@/api/gmail';
const AuthContext = createContext(undefined)

export function AuthProvider({children})
{
    const [isAuthorize, setIsAuthorize] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [tokenClient, setTokenClient] = useState(null);
    const VITE_SCOPES = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify', // For marking as read/unread
    ];

    let gsiInited=false
    if (window.google && window.google.accounts && window.gapi){
      gsiInited=true
    }
    useEffect(() => {
      if(gsiInited){
        const gisClient = window.google.accounts.oauth2.initTokenClient({
          client_id: import.meta.env.VITE_CLIENT_ID,
          scope:VITE_SCOPES.join(' '), 
          callback: (tokenResponse) => { 
            setIsLoading(false);
            if (tokenResponse && tokenResponse.access_token) {
              console.log("Sign-in successful, got access token.");
              // Store the token or use it immediately
              // Set the token for GAPI client calls
              window.gapi.client.setToken({ access_token: tokenResponse.access_token });
              loadGmailClient(); // Load the GMAIL API client now
            } else {
              // Handle errors, tokenResponse might contain an error field
              console.error("Error during GIS token callback:", tokenResponse);
              setIsAuthorize(false); // Ensure state reflects failure
            }
          },
          error_callback: (error) => { // Handle errors during the flow
            setIsLoading(false);
            console.error("GIS Auth Error:", error);
            setIsAuthorize(false); // Ensure state reflects failure
          }
        });
        setTokenClient(gisClient);
    
        // --- Load GAPI Client (for API calls, NOT auth) ---
        // It's okay to load the GAPI client library itself, just not the 'auth2' part
        window.gapi.load('client', initializeGapiClient); // Load 'client' only
    
      }
    else{
      console.log("Yet to init gsi")
    }}, [gsiInited]);


     const handleAuthClick = () => {
        setIsLoading(true);
          if (tokenClient) {
            // Request the access token using the initialized client
            tokenClient.requestAccessToken();
            // The callback defined in initTokenClient will handle the result
          } else {
            console.error("Token client not initialized yet.");
            setIsLoading(false);
          }
      };


     const loadGmailClient = () => {
        // GAPI client should already be initialized by initializeGapiClient
        // And the token should have been set in the GIS callback
        // Now, you can technically make Gmail API calls if needed,
        // but often just setting authorized state is enough initially.
        console.log("Ready to make Gmail API calls (if GAPI client init succeeded)");
        setIsAuthorize(true); // Set authorized state
        // Example: If you needed to immediately fetch something:
        // getMessages();
      };


    return(
        <AuthContext.Provider value={{
            handleAuthClick,
            isLoading,
            isAuthorize,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuthState() {
    const context = useContext(AuthContext);
    if (context === undefined) {
      throw new Error('useAuthState must be used within an AuthStateProvider');
    }
    return context;
  }