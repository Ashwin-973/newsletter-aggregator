/*CONVERT THIS TO A PROMISE */
export async function getAuthToken(interactive) {
  const CLIENT_ID = '214053972459-e5q2osrflbkjirbifv5oo5lids5nf9p0.apps.googleusercontent.com'; 
  const REDIRECT_URI = chrome.identity.getRedirectURL(); // Gets https://<YOUR_EXTENSION_ID>.chromiumapp.org/
  const SCOPES = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify' // Add other scopes as needed
  ].join(' ');

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', CLIENT_ID);
  authUrl.searchParams.set('response_type', 'token'); // Request access token directly
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('scope', SCOPES);
  authUrl.searchParams.set('prompt', 'consent'); // Ensures user sees account picker
  try {
    const responseUrl = await chrome.identity.launchWebAuthFlow({
      url: authUrl.toString(),
      interactive: interactive
    });


    if (!responseUrl) {
      console.error('Authentication flow cancelled or failed.');
      // Handle user cancellation or error
      return null;
    }

    // Extract the access token from the URL fragment
    const urlFragment = new URL(responseUrl).hash; // Get everything after #
    const params = new URLSearchParams(urlFragment.substring(1)); // Remove # and parse
    const accessToken = params.get('access_token');
    const expiresIn = params.get('expires_in');

    if (accessToken && expiresIn) {
      return {accessToken,expiresIn};
    } else {
      console.error('Access token not found in response.');
      // Handle error: token missing
      return null;
    }
  } catch (error) {
    console.error('launchWebAuthFlow error:', error.message);
    // Handle error: API specific or network issue
    return null;
  }
}

export const validateToken = async (token) => {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/tokeninfo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `access_token=${token}`
    });

    if (!response.ok) {
      return { valid: false, error: 'Token validation failed' };
    }

    const tokenInfo = await response.json();
    
    // Check if token has required scopes
    const requiredScopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/userinfo.email'
    ];
    
    const tokenScopes = tokenInfo.scope ? tokenInfo.scope.split(' ') : [];
    const hasRequiredScopes = requiredScopes.every(scope => 
      tokenScopes.includes(scope)
    );

    return {
      valid: true,
      hasRequiredScopes,
      expiresIn: parseInt(tokenInfo.expires_in),
      tokenInfo
    };
  } catch (error) {
    console.error('Token validation error:', error);
    return { valid: false, error: error.message };
  }
};
export async function removeAuthToken(){
  await chrome.storage.local.set({
      processedMessageIds: [],
      lastKnownHistoryId: null,
      failedMessageIds: [],
      syncStatus: {
        isInitialSyncComplete: false,
        lastFullSyncTime: null,
        lastDeltaSyncTime: null,
        totalNewslettersProcessed: 0,
        lastSyncErrors: []
      }
    });
  return 
}
export const getUserInfo = async (token,forceInteractive=true) => {
  // 1. Try to get the existing token from storage
  const storedAuthData = await chrome.storage.local.get(['authToken', 'tokenExpiry']);
  const { authToken, tokenExpiry } = storedAuthData;

  const now = Date.now(); // Current time in milliseconds
  // Give a small buffer (e.g., 5 minutes) before actual expiry
  const EXPIRE_BUFFER_MS = 5 * 60 * 1000;

  if (authToken && tokenExpiry && (tokenExpiry > (now + EXPIRE_BUFFER_MS))) {
    // Token exists and is still valid
    token = authToken;
    console.log('Using existing valid token.');
  }
  //refresh token logic
  else {
    console.log('Token missing, expired, or near expiry. Attempting to get a new one.');
    // 2. If token is missing/expired, initiate the interactive flow
    // No "silent" launchWebAuthFlow will work reliably here.
    // Always go interactive if interaction is truly needed to get a *new* token.

    // If forceInteractive is true, or if we definitely need a new token,
    // we must go interactive.
    if (!token || forceInteractive) { // If no token, or forced interactive
      console.log('Initiating interactive web auth flow...');
      const tokenResult = await getAuthToken(forceInteractive); // This should be your launchWebAuthFlow logic
      if (!tokenResult) {
        throw new Error('Failed to get token interactively. User may have cancelled.');
        // Handle failed authentication (e.g., show error to user, redirect to login page)
      }
      token=tokenResult.accessToken
      // Store the new token
      const newTokenExpiry = Date.now() + (parseInt(tokenResult.expiresIn) * 1000);
      await chrome.storage.local.set({
        authToken: token,
        tokenExpiry: newTokenExpiry
      });
    }
  }

   // Validate token before using
  const validation = await validateToken(token);
  if (!validation.valid) {
    console.error('Token validation failed:', validation.error);
    await removeAuthToken();
    throw new Error('Token validation failed');
  }

  if (!validation.hasRequiredScopes) {
    console.error('Token missing required scopes');
    await removeAuthToken();
    throw new Error('Token missing required Gmail permissions');
  }


  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Failed to fetch user info:', response.status, errorBody);
    if (response.status === 401) {
      // Token might be expired or revoked, try to remove it
      await removeAuthToken().catch(err => console.warn('Failed to remove potentially stale token:', err));
    }
    throw new Error(`Failed to fetch user info: ${response.status}`);
  }

  return await response.json();
}; 