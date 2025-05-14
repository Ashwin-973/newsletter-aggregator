// Initialize GIS and GAPI

import { getAuthToken, removeAuthToken, getUserInfo } from '../src/auth/auth.js';
import { fetchNewslettersFromGmail } from '../src/api/gmail.js';

// Load Google API client library
// try {
//   importScripts('https://apis.google.com/js/api.js');
// } catch (e) {
//   console.error("Error importing GAPI script:", e);
// }

const GMAIL_FETCH_ALARM = 'gmailFetchAlarm';

// Function to fetch newsletters using the new approach
async function fetchNewsletters(token) {
  try {
    const newsletters = await fetchNewslettersFromGmail(token);
    await chrome.storage.local.set({ newsletters: newsletters || [] });
    console.log('Newsletters fetched and stored:', newsletters);
  } catch (error) {
    console.error('Error during newsletter fetch:', error);
    if (error.message?.includes('401') || error.status === 401 || error.message?.toLowerCase().includes('token has been expired or revoked')) {
      console.log('Auth error during API call, attempting to clear token and sign out state.');
      handleLogout(); 
    }
  }
}

// Authentication and State Management
async function handleLogin() {
  try {
    const token = await getAuthToken(true);
    if (token) {
      await chrome.storage.local.set({ isAuthenticated: true, authToken: token });
      const userInfo = await getUserInfo(token);
      await chrome.storage.local.set({ userInfo });
      console.log('User signed in:', userInfo);
      console.log("Fetching newsletters with token : ",token)
      await fetchNewsletters(token);
      chrome.alarms.create(GMAIL_FETCH_ALARM, { periodInMinutes: 1 });
      return { success: true, userInfo };
    }
    return { success: false, error: 'User did not grant access or closed the consent screen.' };
  } catch (error) {
    console.error('Login failed:', error);
    await chrome.storage.local.set({ isAuthenticated: false, authToken: null, userInfo: null });
    const errorMessage = error.message || 'An unknown error occurred during login.';
    return { success: false, error: errorMessage };
  }
}

async function handleLogout() {
  let success = false;
  try {
    const { authToken } = await chrome.storage.local.get('authToken');
    if (authToken) {
      await removeAuthToken(authToken);
    }
    await removeAuthToken(null);
    success = true;
  } catch (error) {
    console.error('Error removing auth token during logout:', error);
    success = false;
  } finally {
    await chrome.storage.local.set({
      isAuthenticated: false,
      authToken: null,
      userInfo: null,
      newsletters: []
    });
    chrome.alarms.clear(GMAIL_FETCH_ALARM);
    console.log('User signed out and alarm cleared. Logout success:', success);
  }
  return { success };
}

async function getAuthStatus() {
  try {
    const { isAuthenticated, userInfo } = await chrome.storage.local.get(['isAuthenticated', 'userInfo']);
    if (isAuthenticated) {
      try {
        const token = await getAuthToken(false);
        if (token) {
          return { isAuthenticated: true, userInfo };
        }
        console.log("Silent token retrieval failed. Logging out.")
        await handleLogout(); 
        return { isAuthenticated: false };
      } catch (error) {
        console.error("Error during silent token retrieval or validation, logging out:", error);
        await handleLogout();
        return { isAuthenticated: false };
      }
    }
    return { isAuthenticated: false };
  } catch (error) {
    console.error('Error getting auth status:', error);
    return { isAuthenticated: false };
  }
}

// Event Listeners
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('Extension installed or updated:', details);
  const status = await getAuthStatus();
  if (status.isAuthenticated) {
    const { authToken } = await chrome.storage.local.get('authToken');
    if(authToken){
        await fetchNewsletters(authToken);
        chrome.alarms.create(GMAIL_FETCH_ALARM, { periodInMinutes: 1 });
    }
  } else {
    chrome.alarms.clear(GMAIL_FETCH_ALARM);
  }
});

chrome.runtime.onStartup.addListener(async () => {
  console.log('Extension started.');
  const status = await getAuthStatus();
  if (status.isAuthenticated) {
    const { authToken } = await chrome.storage.local.get('authToken');
     if(authToken){
        await fetchNewsletters(authToken);
        chrome.alarms.create(GMAIL_FETCH_ALARM, { periodInMinutes: 1 });
    }
  } else {
    chrome.alarms.clear(GMAIL_FETCH_ALARM);
  }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === GMAIL_FETCH_ALARM) {
    console.log('Alarm triggered for fetching Gmail data.');
    const { isAuthenticated, authToken } = await chrome.storage.local.get(['isAuthenticated', 'authToken']);
    if (isAuthenticated && authToken) {
      await fetchNewsletters(authToken);
    } else {
      console.log('Not authenticated or no token, skipping fetch and clearing alarm.');
      chrome.alarms.clear(GMAIL_FETCH_ALARM); 
      await chrome.storage.local.set({ isAuthenticated: false, authToken: null, userInfo: null });
    }
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'login') {
    handleLogin().then(sendResponse);
    return true;
  } else if (request.action === 'logout') {
    handleLogout().then(sendResponse);
    return true;
  } else if (request.action === 'getAuthStatus') {
    getAuthStatus().then(sendResponse);
    return true;
  }
  return false;
});

/*const CLIENT_ID = encodeURIComponent('1062713297927-2r9vfe6fbmgc80s5r8m5a77v9ir42jm3.apps.googleusercontent.com');
const RESPONSE_TYPE = encodeURIComponent('id_token');
const REDIRECT_URI = encodeURIComponent('https://jkdipnciegjhdoghbmpobkgcgbgijoik.chromiumapp.org/')
const SCOPE = encodeURIComponent('openid');
const STATE = encodeURIComponent('meet' + Math.random().toString(36).substring(2, 15));
const PROMPT = encodeURIComponent('consent');

let user_signed_in = false;

function is_user_signed_in() {
    return user_signed_in;
}

function create_auth_endpoint() {
    let nonce = encodeURIComponent(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));

    let openId_endpoint_url =
        `https://accounts.google.com/o/oauth2/v2/auth
?client_id=${CLIENT_ID}
&response_type=${RESPONSE_TYPE}
&redirect_uri=${REDIRECT_URI}
&scope=${SCOPE}
&state=${STATE}
&nonce=${nonce}
&prompt=${PROMPT}`;

    console.log(openId_endpoint_url);
    return openId_endpoint_url;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'login') {
        if (user_signed_in) {
            console.log("User is already signed in.");
        } else {
            chrome.identity.launchWebAuthFlow({
                'url': create_auth_endpoint(),
                'interactive': true
            }, function (redirect_url) {
                if (chrome.runtime.lastError) {
                  console.log("Problem signing in")
                    // problem signing in
                } else {
                    let id_token = redirect_url.substring(redirect_url.indexOf('id_token=') + 9);
                    id_token = id_token.substring(0, id_token.indexOf('&'));
                    const user_info = KJUR.jws.JWS.readSafeJSONString(b64utoutf8(id_token.split(".")[1]));

                    if ((user_info.iss === 'https://accounts.google.com' || user_info.iss === 'accounts.google.com')
                        && user_info.aud === CLIENT_ID) {
                        console.log("User successfully signed in.");
                        user_signed_in = true;
                        chrome.browserAction.setPopup({ popup: './popup-signed-in.html' }, () => {
                            sendResponse('success');
                        });
                    } else {
                        // invalid credentials
                        console.log("Invalid credentials.");
                    }
                }
            });

            return true;
        }
    } else if (request.message === 'logout') {
        user_signed_in = false;
        chrome.browserAction.setPopup({ popup: './popup.html' }, () => {
            sendResponse('success');
        });

        return true;
    } else if (request.message === 'isUserSignedIn') {
        sendResponse(is_user_signed_in());
    }
});*/