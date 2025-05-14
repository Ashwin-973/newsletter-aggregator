export const getAuthToken = (interactive) => {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive }, (token) => {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError)
        reject(chrome.runtime.lastError);
      } else {
        resolve(token);
      }
    });
  });
};

export const removeAuthToken = (token) => {
  return new Promise((resolve, reject) => {
    if (!token) {
      // If no specific token is provided, clear all cached tokens for this app.
      // This is a more thorough sign-out.
      chrome.identity.clearAllCachedAuthTokens(() => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    } else {
      // Remove a specific token from the cache.
      chrome.identity.removeCachedAuthToken({ token }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    }
  });
};

export const getUserInfo = async (token) => {
  if (!token) {
    token = await getAuthToken(false); // Try to get a token silently
  }
  if (!token) {
    throw new Error("No auth token available for getUserInfo");
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
      await removeAuthToken(token).catch(err => console.warn('Failed to remove potentially stale token:', err));
    }
    throw new Error(`Failed to fetch user info: ${response.status}`);
  }

  return await response.json();
}; 