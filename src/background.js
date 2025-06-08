// Initialize GIS and GAPI
//use functions in storage js to store newsletters
// import { getAuthToken, removeAuthToken, getUserInfo } from '../src/auth/auth.js';
// import { 
//   fetchNewslettersFromGmail, 
//   fetchEmailContent, 
//   parseEmailContent, 
//   markMessageAsRead,
//   batchFetchEmailContents,
//   getGmailHistory,
//   getGmailProfile
// } from '../src/api/gmail.js';
// import { 
//   mergeNewsletterData,
//   getNewsletters,
//   setNewsletters,
//   getProcessedMessageIds,
//   addProcessedMessageIds,
//   getLastKnownHistoryId,
//   setLastKnownHistoryId,
//   getFailedMessageIds,
//   addFailedMessageIds,
//   getSyncStatus,
//   updateSyncStatus
// } from '../src/lib/storage.js';
import { getAuthToken, removeAuthToken, getUserInfo } from './auth.js';
import { 
  fetchNewslettersFromGmail, 
  fetchNewsletterById,
  fetchEmailContent, 
  parseEmailContent, 
  markMessageAsRead,
  batchFetchEmailContents,
  getGmailHistory,
  getGmailProfile
} from './gmail.js';
import { 
mergeNewsletterData,
getNewsletters,
 setNewsletters,
  getProcessedMessageIds,
  addProcessedMessageIds,
  getLastKnownHistoryId,
  setLastKnownHistoryId,
  getFailedMessageIds,
  addFailedMessageIds,
  getSyncStatus,
  updateSyncStatus
} from './storage.js';


// Load Google API client library
// try {
//   importScripts('https://apis.google.com/js/api.js');
// } catch (e) {
//   console.error("Error importing GAPI script:", e);
// }

const GMAIL_FETCH_ALARM = 'gmailFetchAlarm';
const RETRY_FAILED_ALARM = 'retryFailedAlarm';
const GMAIL_FETCH_ALARM_PERIOD=3
const RETRY_FAILED_ALARM_PERIOD=6

// Sync orchestrator class
class NewsletterSyncManager {
  constructor() {
    this.isFullSyncRunning = false;
    this.isDeltaSyncRunning = false;
    this.syncQueue = [];
  }

  async performInitialFullSync(token) {
    if (this.isFullSyncRunning) {
      console.log('Full sync already running, skipping...');
      return { success: false, message: 'Sync already in progress' };
    }

    this.isFullSyncRunning = true;
    console.log('Starting initial full sync...');

    try {
      await updateSyncStatus({
        lastSyncErrors: [],
        syncStartTime: Date.now()
      });

      const processedIds = await getProcessedMessageIds();
      let allNewMessageIds = [];
      let pageToken = null;
      let totalEstimate = 0;

      // Step 1: Collect all message IDs with pagination - runs stateless
      do {
        const {newsletterData,nextPageToken,resultSizeEstimate} = await fetchNewslettersFromGmail(token, {
          maxResults: 30, // Larger batches for listing
          pageToken
        });
        const newIds = newsletterData.map(nl =>nl.id).filter(id => !processedIds.has(id));
        const filteredNewsletterData=newsletterData.filter(nl=> !processedIds.has(nl.id))

        allNewMessageIds.push(...newIds);
        pageToken = nextPageToken;
        console.log(nextPageToken)
        totalEstimate = resultSizeEstimate;


        console.log(`Collected ${newIds.length} new message IDs (${allNewMessageIds.length} total : saved to local processedID's)`);
        await addProcessedMessageIds(allNewMessageIds)
        //save newsletterData to local storage
        const existingNewsletters=await getNewsletters()
        await setNewsletters([...existingNewsletters,...filteredNewsletterData])
        console.log(`Stored another ${filteredNewsletterData.length} newsletters to local storage`)

        // Prevent infinite loops
        if (allNewMessageIds.length > 10000) {
          console.warn('Reached maximum message limit for single sync');
          break;
        }

      } while (pageToken);

      console.log(`Full sync: Found ${allNewMessageIds.length} new messages to process`);

      if (allNewMessageIds.length === 0) {
        await updateSyncStatus({
          isInitialSyncComplete: true,
          lastFullSyncTime: Date.now(),
          syncEndTime: Date.now()
        });
        return { success: true, processed: 0, message: 'No new newsletters found' };
      }

      // info : Fetch email contents in controlled batches
      // const results = await this.processBatchedEmails(token, allNewMessageIds, 'full-sync');

      // info : Update history ID for future delta syncs
      try {
        const profile = await getGmailProfile(token);
        if (profile.historyId) {
          await setLastKnownHistoryId(profile.historyId);
          console.log(`Updated history ID to: ${profile.historyId}`);
        }
      } catch (error) {
        console.warn('Failed to update history ID:', error);
      }

      await updateSyncStatus({
        isInitialSyncComplete: true,
        lastFullSyncTime: Date.now(),
        totalNewslettersProcessed: allNewMessageIds.length,
        syncEndTime: Date.now(),
        lastSyncErrors:null
      });

      console.log(`Full sync completed: ${allNewMessageIds.length} successful, None failed`);
      
      return {
        success: true,
        processed: allNewMessageIds.length,
        failed: null,  //mock for now
        message: `Processed ${allNewMessageIds.length} newsletters`
      };

    } catch (error) {
      console.error('Full sync failed:', error);
      
      await updateSyncStatus({
        lastSyncErrors: [{ error: error.message, timestamp: Date.now() }],
        syncEndTime: Date.now()
      });

      if (error.message?.includes('401')) {
        await this.handleAuthError();
      }

      return { success: false, error: error.message };
    } finally {
      this.isFullSyncRunning = false;
    }
  }

async performDeltaSync(token) {
    if (this.isDeltaSyncRunning) {
      console.log('Delta sync already running, skipping...');
      return { success: false, message: 'Delta sync already in progress' };
    }

    this.isDeltaSyncRunning = true;
    console.log('Starting delta sync...');

    try {
      const lastHistoryId = await getLastKnownHistoryId();
      
      if (!lastHistoryId) {
        console.log('No history ID found, performing full sync instead');
        this.isDeltaSyncRunning = false;
        return await this.performInitialFullSync(token);
      }

      const historyResponse = await getGmailHistory(token, lastHistoryId, ['messageAdded']);

      if (historyResponse.needsFullSync) {
        console.log('History ID too old, performing full sync');
        this.isDeltaSyncRunning = false;
        return await this.performInitialFullSync(token);
      }

      const newMessageIds = [];
      
      if (historyResponse.history && historyResponse.history.length > 0) {
        historyResponse.history.forEach(historyItem => {
          if (historyItem.messagesAdded) {
            historyItem.messagesAdded.forEach(msgAdded => {
              newMessageIds.push(msgAdded.message.id);
            });
          }
        });
      }

      console.log(`Delta sync: Found ${newMessageIds.length} new messages`);

      if (newMessageIds.length === 0) {
        await updateSyncStatus({
          lastDeltaSyncTime: Date.now()
        });
        return { success: true, processed: 0, message: 'No new newsletters found' };
      }

      // Filter out already processed messages
      const processedIds = await getProcessedMessageIds();
      const unprocessedIds = newMessageIds.filter(id => !processedIds.has(id));

      if (unprocessedIds.length === 0) {
        await updateSyncStatus({
          lastDeltaSyncTime: Date.now()
        });
        return { success: true, processed: 0, message: 'All messages already processed' };
      }

      const newNewsletters=fetchNewsletterById(token,unprocessedIds)
      console.log(`Collected ${unprocessedIds.length} new message IDs: saved to local processedID's)`);
      await addProcessedMessageIds(unprocessedIds)
      //save newsletterData to local storage
      const existingNewsletters=await getNewsletters()
      await setNewsletters([...existingNewsletters,...newNewsletters])
      console.log(`Stored another ${newNewsletters.length} newsletters to local storage`)

      // Process new messages
      // const results = await this.processBatchedEmails(token, unprocessedIds, 'delta-sync');

      // info : update history ID
      if (historyResponse.historyId) {
        await setLastKnownHistoryId(historyResponse.historyId);
      }

      await updateSyncStatus({
        lastDeltaSyncTime: Date.now(),
        totalNewslettersProcessed: (await getSyncStatus()).totalNewslettersProcessed + unprocessedIds.length,
        lastSyncErrors: null //mock for now
      });

      console.log(`Delta sync completed: ${unprocessedIds.length} successful, zero failed`);

      return {
        success: true,
        processed: unprocessedIds.length,
        failed: null,
        message: `Processed ${unprocessedIds.length} new newsletters`
      };

    } catch (error) {
      console.error('Delta sync failed:', error);
      
      await updateSyncStatus({
        lastSyncErrors: [{ error: error.message, timestamp: Date.now() }],
        lastDeltaSyncTime: Date.now()
      });

      if (error.message?.includes('401')) {
        await this.handleAuthError();
      }

      return { success: false, error: error.message };
    } finally {
      this.isDeltaSyncRunning = false;
    }
  }
//processes and returns contents of each newsletter in diff formats
  /*async processBatchedEmails(token, messageIds, syncType) {
    const { blockedProviders = [] } = await chrome.storage.local.get('blockedProviders');
    const blockedEmails = new Set(blockedProviders.map(p => p.value));
    
    let successful = 0;
    let failed = 0;
    const errors = [];
    const processedNewsletters = [];

    console.log(`Processing ${messageIds.length} emails in batches for ${syncType}`);

    // Process in smaller batches to avoid overwhelming the API
    const batchSize = 10;
    for (let i = 0; i < messageIds.length; i += batchSize) {
      const batch = messageIds.slice(i, i + batchSize);
      
      try {
        const batchResults = await batchFetchEmailContents(
          token, 
          batch, 
          (processed, total) => {
            console.log(`Batch ${Math.floor(i/batchSize) + 1}: ${processed}/${total} processed`);
          }
        );

        // Process successful results
        for (const result of batchResults.results) {
          try {
            const newsletterData = this.parseEmailToNewsletter(result.data, result.parsed);
            
            // Check if sender is blocked
            if (this.isSenderBlocked(newsletterData.from, blockedEmails)) {
              console.log(`Skipping blocked sender: ${newsletterData.from}`);
              continue;
            }

            processedNewsletters.push(newsletterData);
            successful++;
          } catch (parseError) {
            console.error(`Failed to parse email ${result.id}:`, parseError);
            errors.push({ id: result.id, error: parseError.message });
            failed++;
          }
        }

        // Handle failed results
        for (const error of batchResults.errors) {
          errors.push(error);
          failed++;
        }

        // Mark successful IDs as processed
        const successfulIds = batchResults.results.map(r => r.id);
        if (successfulIds.length > 0) {
          await addProcessedMessageIds(successfulIds);
        }

        // Add failed IDs to retry list
        if (batchResults.errors.length > 0) {
          await addFailedMessageIds(batchResults.errors);
        }

        // Small delay between batches
        if (i + batchSize < messageIds.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

      } catch (batchError) {
        console.error(`Batch processing failed:`, batchError);
        
        // Mark entire batch as failed
        const batchErrors = batch.map(id => ({ id, error: batchError.message }));
        errors.push(...batchErrors);
        failed += batch.length;
        
        await addFailedMessageIds(batchErrors);
      }
    }

    // Store processed newsletters
    if (processedNewsletters.length > 0) {
      await this.storeNewsletters(processedNewsletters);
      await this.updateUniqueProviders(processedNewsletters);
    }

    return { successful, failed, errors };
  }*/

/*parseEmailToNewsletter(emailData, parsedContent) {
    const headers = emailData.payload?.headers || [];
    const dateHeader = headers.find(h => h.name === 'Date')?.value;
    const fromHeader = headers.find(h => h.name === 'From')?.value;
    const subjectHeader = headers.find(h => h.name === 'Subject')?.value;

    return {
      id: emailData.id,
      threadId: emailData.threadId,
      date: dateHeader,
      from: fromHeader,
      subject: subjectHeader,
      htmlContent: parsedContent.html,
      textContent: parsedContent.text,
      attachments: parsedContent.attachments,
      headers: parsedContent.headers,
      read: !emailData.labelIds?.includes('UNREAD'),
      bookmark: false,
      readLater: false,
      incomplete: false,
      scrollPosition: null,
      userModifiedRead: false,
      fetchedAt: Date.now()
    };
  }*/

isSenderBlocked(fromHeader, blockedEmails) {
    if (!fromHeader || blockedEmails.size === 0) return false;
    
    // Extract email from "Name <email@domain.com>" format
    const emailMatch = fromHeader.match(/<(.+?)>/);
    const email = emailMatch ? emailMatch[1] : fromHeader;
    
    return blockedEmails.has(email);
  }

async storeNewsletters(newNewsletters) {
    try {
      const { newsletters: existingNewsletters = [] } = await chrome.storage.local.get('newsletters');
      const mergedNewsletters = mergeNewsletterData(existingNewsletters, newNewsletters);
      
      await chrome.storage.local.set({ newsletters: mergedNewsletters });
      console.log(`Stored ${newNewsletters.length} newsletters, total: ${mergedNewsletters.length}`);
    } catch (error) {
      console.error('Failed to store newsletters:', error);
      throw error;
    }
  }


async updateUniqueProviders(newsletters) {
  try {
    const { allProviders = [] } = await chrome.storage.local.get('allProviders');
    
    // Extract providers from newsletters
    const extractProviderInfo = (from) => {
      const matches = from.match(/(.*?)\s*<(.+?)>/);
      if (matches) {
        const [, label, email] = matches;
        return {
          value: email,
          label: label.trim() || email
        };
      }
      return { value: from, label: from };
    };
    
    const newProviders = [];
    const existingValues = new Set(allProviders.map(p => p.value));
    
    newsletters.forEach(newsletter => {
      if (newsletter.from) {
        const providerInfo = extractProviderInfo(newsletter.from);
        if (!existingValues.has(providerInfo.value)) {
          newProviders.push(providerInfo);
          existingValues.add(providerInfo.value);
        }
      }
    });
    
    if (newProviders.length > 0) {
      const updatedProviders = [...allProviders, ...newProviders];
      await chrome.storage.local.set({ allProviders: updatedProviders });
      console.log('Added new providers:', newProviders.length);
    }
  } catch (error) {
    console.error('Error updating unique providers:', error);
  }
}

async retryFailedMessages(token) {
    try {
      const failedMessages = await getFailedMessageIds();
      const retryableMessages = failedMessages.filter(msg => 
        msg.retryCount < 3 && 
        (Date.now() - msg.timestamp) > 300000 // Wait 5 minutes before retry
      );

      if (retryableMessages.length === 0) {
        console.log('No messages to retry');
        return { success: true, retried: 0 };
      }

      console.log(`Retrying ${retryableMessages.length} failed messages`);

      const messageIds = retryableMessages.map(msg => msg.id);
      const results = await this.processBatchedEmails(token, messageIds, 'retry');

      // Update retry counts for still-failed messages
      const stillFailed = failedMessages.map(msg => {
        if (retryableMessages.some(retry => retry.id === msg.id)) {
          return { ...msg, retryCount: msg.retryCount + 1 };
        }
        return msg;
      });

      await chrome.storage.local.set({ failedMessageIds: stillFailed });

      return {
        success: true,
        retried: results.successful,
        stillFailed: results.failed
      };

    } catch (error) {
      console.error('Failed to retry messages:', error);
      return { success: false, error: error.message };
    }
  }

async handleAuthError() {
    console.log('Handling auth error - clearing tokens and stopping sync');
    await removeAuthToken();
    chrome.alarms.clear(GMAIL_FETCH_ALARM);
    chrome.alarms.clear(RETRY_FAILED_ALARM);
  }
}


// Global sync manager instance
const syncManager = new NewsletterSyncManager();


async function fetchNewsletters(token) {
  try {
    const syncStatus = await getSyncStatus();
    
    if (!syncStatus.isInitialSyncComplete) {
      console.log('Performing initial full sync...');
      const result = await syncManager.performInitialFullSync(token);
      
      if (result.success) {
        // Schedule regular delta syncs
        chrome.alarms.create(GMAIL_FETCH_ALARM, { periodInMinutes: GMAIL_FETCH_ALARM_PERIOD });
        chrome.alarms.create(RETRY_FAILED_ALARM, { periodInMinutes: RETRY_FAILED_ALARM_PERIOD });
      }
      
      return result;
    } else {
      console.log('Performing delta sync...');
      return await syncManager.performDeltaSync(token);
    }
    
  } catch (error) {
    console.error('Error during newsletter fetch:', error);
    
    if (error.message?.includes('401') || error.status === 401) {
      console.log('Auth error during API call, attempting to clear token and sign out state.');
      await syncManager.handleAuthError();
    }
    
    throw error;
  }
}

async function updateUniqueProviders(newsletters) {   //for backward compatibility
  return await syncManager.updateUniqueProviders(newsletters);
}



// Authentication and State Management
async function handleLogin() {
  try {
    const {accessToken,expiresIn} = await getAuthToken(true);
    if (accessToken && expiresIn) {
      const tokenExpiry = Date.now() + (parseInt(expiresIn) * 1000);
      await chrome.storage.local.set({ isAuthenticated: true, authToken: accessToken,tokenExpiry:tokenExpiry });
      const userInfo = await getUserInfo(accessToken);
      await chrome.storage.local.set({ userInfo });
       // Start the sync process
      const syncResult = await fetchNewsletters(accessToken);
      if (syncResult.success) {
        // Schedule periodic syncs
        chrome.alarms.create(GMAIL_FETCH_ALARM, { periodInMinutes: GMAIL_FETCH_ALARM_PERIOD });
        chrome.alarms.create(RETRY_FAILED_ALARM, { periodInMinutes: RETRY_FAILED_ALARM_PERIOD });
      }
      
      return { success: true, userInfo, syncResult };
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
    let { authToken } = await chrome.storage.local.get('authToken');
    await removeAuthToken()
    authToken = await chrome.storage.local.get('authToken');
    success = true;
  } catch (error) {
    console.error('Error removing auth token during logout:', error);
    success = false;
  } finally {
    chrome.alarms.clear(GMAIL_FETCH_ALARM);
    chrome.alarms.clear(RETRY_FAILED_ALARM);
    console.log('User signed out and alarm cleared. Logout success:', success);
  }
  return { success };
}

async function getAuthStatus() {
  console.log("I am the new auth status")
  try {
    const { isAuthenticated, userInfo } = await chrome.storage.local.get(['isAuthenticated', 'userInfo']);
    const { authToken, tokenExpiry } = await chrome.storage.local.get(['authToken', 'tokenExpiry']);
    const now = Date.now();
    const EXPIRE_BUFFER_MS = 5 * 60 * 1000;
    
    if (isAuthenticated) {
      try {
        if (authToken && tokenExpiry && (tokenExpiry > (now + EXPIRE_BUFFER_MS))) {
          return { isAuthenticated: true, userInfo };
        }
        
        // Token expired, try to refresh
        await handleLogout();
        const token = await getAuthToken(true);
        if (token) {
          console.log("Token refreshed, logging in again");
          const loginResult = await handleLogin();
          return { 
            isAuthenticated: loginResult.success, 
            userInfo: loginResult.userInfo 
          };
        }
        
        console.log("getAuthStatus failed. Logging out.");
        return { isAuthenticated: false };
      } catch (error) {
        console.error("Error during token validation, logging out:", error);
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



// info : Event Listeners
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('Extension installed or updated:', details);
  
  // Initialize storage structure
  const defaultStorage = {
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
  };
  
  // Only set defaults if they don't exist
  const existingData = await chrome.storage.local.get(Object.keys(defaultStorage));
  const toSet = {};
  
  Object.keys(defaultStorage).forEach(key => {
    if (existingData[key] === undefined) {
      toSet[key] = defaultStorage[key];
    }
  });
  
  if (Object.keys(toSet).length > 0) {
    await chrome.storage.local.set(toSet);
  }
  const status = await getAuthStatus();
 if (status.isAuthenticated) {
    const { authToken } = await chrome.storage.local.get('authToken');
    if (authToken) {
      console.log("onInstalled: Starting sync");
      try {
        await fetchNewsletters(authToken);
        chrome.alarms.create(GMAIL_FETCH_ALARM, { periodInMinutes: GMAIL_FETCH_ALARM_PERIOD });
        chrome.alarms.create(RETRY_FAILED_ALARM, { periodInMinutes: RETRY_FAILED_ALARM_PERIOD });
      } catch (error) {
        console.error('Failed to sync on install:', error);
      }
    }
  } else {
    chrome.alarms.clear(GMAIL_FETCH_ALARM);
    chrome.alarms.clear(RETRY_FAILED_ALARM);
  }
});

chrome.runtime.onStartup.addListener(async () => {
  console.log('Extension started.');
  const status = await getAuthStatus();
  if (status.isAuthenticated) {
    const { authToken } = await chrome.storage.local.get('authToken');
    if (authToken) {
      console.log("onStartup: Starting sync");
      try {
        await fetchNewsletters(authToken);
        chrome.alarms.create(GMAIL_FETCH_ALARM, { periodInMinutes: GMAIL_FETCH_ALARM_PERIOD });
        chrome.alarms.create(RETRY_FAILED_ALARM, { periodInMinutes: RETRY_FAILED_ALARM_PERIOD });
      } catch (error) {
        console.error('Failed to sync on startup:', error);
      }
    }
  } else {
    chrome.alarms.clear(GMAIL_FETCH_ALARM);
    chrome.alarms.clear(RETRY_FAILED_ALARM);
  }
});

//listens for events within extension scope
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === GMAIL_FETCH_ALARM) {
    console.log('Alarm triggered for fetching Gmail data : ',new Date().toLocaleTimeString());
    const { isAuthenticated, authToken } = await chrome.storage.local.get(['isAuthenticated', 'authToken']);
    
    if (isAuthenticated && authToken) {
      console.log("Alarm: Starting  delta sync");
      try {
        await syncManager.performDeltaSync(authToken);
      } catch (error) {
        console.error('Alarm sync failed:', error);
        if (error.message?.includes('401')) {
          await syncManager.handleAuthError();
        }
      }
    } else {
      console.log('Not authenticated or no token, clearing alarms.');
      chrome.alarms.clear(GMAIL_FETCH_ALARM);
      chrome.alarms.clear(RETRY_FAILED_ALARM);
      await chrome.storage.local.set({ 
        isAuthenticated: false, 
        authToken: null, 
        userInfo: null 
      });
    }
  } else if (alarm.name === RETRY_FAILED_ALARM) {
    console.log('Retry alarm triggered.');
    const { isAuthenticated, authToken } = await chrome.storage.local.get(['isAuthenticated', 'authToken']);
    
    if (isAuthenticated && authToken) {
      try {
        await syncManager.retryFailedMessages(authToken);
      } catch (error) {
        console.error('Retry failed messages error:', error);
      }
    }
  }
});


//function to ping "fetchEmailContent"
async function handleGetEmailContent(messageId) {
  try {
    const { authToken } = await chrome.storage.local.get('authToken');
    if (!authToken) {
      throw new Error('No auth token available');
    }

    const emailData = await fetchEmailContent(authToken, messageId);
    const parsedContent = parseEmailContent(emailData);
    
    return { success: true, content: parsedContent, rawData: emailData };
  } catch (error) {
    console.error('Error fetching email content:', error);
    
    if (error.message?.includes('401')) {
      await syncManager.handleAuthError();
    }
    
    return { success: false, error: error.message };
  }
}

// info : message based event listeners
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
   else if (request.action === 'getEmailContent') {
    handleGetEmailContent(request.messageId).then(sendResponse);
    return true;
  } else if (request.action === 'markAsRead') {
    handleMarkAsRead(request.messageId).then(sendResponse);
    return true;
  } else if (request.action === 'updateNewsletterStatus') {
    handleUpdateNewsletterStatus(request.messageId, request.updates).then(sendResponse);
    return true;
  } else if (request.action === 'saveScrollPosition') {
    handleSaveScrollPosition(request.messageId, request.scrollPosition).then(sendResponse);
    return true;
  } else if (request.action === 'forceSyncNewsletters') {
    handleForceSyncNewsletters().then(sendResponse);
    return true;
  } else if (request.action === 'getSyncStatus') {
    getSyncStatus().then(sendResponse);
    return true;
  } else if (request.action === 'retryFailedMessages') {
    handleRetryFailedMessages().then(sendResponse);
    return true;
  } else if (request.action === 'clearFailedMessages') {
    handleClearFailedMessages().then(sendResponse);
    return true;
  }
  return false;
});


//function to mark email as READ
async function handleMarkAsRead(messageId) {
  try {
    const { authToken } = await chrome.storage.local.get('authToken');
    if (!authToken) {
      throw new Error('No auth token available');
    }

    await markMessageAsRead(authToken, messageId);
    
    // Update local storage
    const { newsletters } = await chrome.storage.local.get('newsletters');
    const updatedNewsletters = newsletters.map(nl => 
      nl.id === messageId ? { ...nl, read: true, userModifiedRead: true } : nl
    );
    await chrome.storage.local.set({ newsletters: updatedNewsletters });
    
    return { success: true };
  } catch (error) {
    console.error('Error marking message as read:', error);
    
    if (error.message?.includes('401')) {
      await syncManager.handleAuthError();
    }
    
    return { success: false, error: error.message };
  }
}

//update newsletter status in newsletter list
async function handleUpdateNewsletterStatus(messageId, updates) {
  try {
    const { newsletters } = await chrome.storage.local.get('newsletters');
    const updatedNewsletters = newsletters.map(nl => 
      nl.id === messageId ? { ...nl, ...updates } : nl
    );
    await chrome.storage.local.set({ newsletters: updatedNewsletters });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating newsletter status:', error);
    return { success: false, error: error.message };
  }
}

//save scroll position
async function handleSaveScrollPosition(messageId, scrollPosition) {
  try {
    const { newsletters } = await chrome.storage.local.get('newsletters');
    const updatedNewsletters = newsletters.map(nl => {
      if (nl.id === messageId) {
        return {
          ...nl,
          scrollPosition,
          incomplete: scrollPosition !== null && scrollPosition > 0,
          lastReadTime: Date.now(),
          readProgress: scrollPosition ? calculateReadProgress(scrollPosition, nl) : 100
        };
      }
      return nl;
    });
    
    await chrome.storage.local.set({ newsletters: updatedNewsletters });
    
    return { success: true };
  } catch (error) {
    console.error('Error saving scroll position:', error);
    return { success: false, error: error.message };
  }
}


function calculateReadProgress(scrollPosition, newsletter) {
  // Estimate read progress based on scroll position
  // This is a simple estimation - can be enhanced with reading time, etc.
  const estimatedHeight = 5000; // Average newsletter height
  return Math.min((scrollPosition / estimatedHeight) * 100, 100);
}


async function handleForceSyncNewsletters() {
  try {
    const { authToken } = await chrome.storage.local.get('authToken');
    if (!authToken) {
      throw new Error('No auth token available');
    }

    console.log('Manual sync triggered');
    
    // Reset sync status to force full sync
    await updateSyncStatus({
      isInitialSyncComplete: false,
      lastSyncErrors: []
    });
    
    const result = await syncManager.performInitialFullSync(authToken);
    
    return {
      success: result.success,
      message: result.message || `Processed ${result.processed || 0} newsletters`,
      processed: result.processed || 0,
      failed: result.failed || 0
    };
  } catch (error) {
    console.error('Error during manual sync:', error);
    
    if (error.message?.includes('401')) {
      await syncManager.handleAuthError();
    }
    
    return { success: false, error: error.message };
  }
}

async function handleRetryFailedMessages() {
  try {
    const { authToken } = await chrome.storage.local.get('authToken');
    if (!authToken) {
      throw new Error('No auth token available');
    }

    const result = await syncManager.retryFailedMessages(authToken);
    
    return {
      success: result.success,
      retried: result.retried || 0,
      stillFailed: result.stillFailed || 0,
      message: `Retried ${result.retried || 0} messages, ${result.stillFailed || 0} still failed`
    };
  } catch (error) {
    console.error('Error retrying failed messages:', error);
    return { success: false, error: error.message };
  }
}

async function handleClearFailedMessages() {
  try {
    await chrome.storage.local.set({ failedMessageIds: [] });
    return { success: true, message: 'Failed messages list cleared' };
  } catch (error) {
    console.error('Error clearing failed messages:', error);
    return { success: false, error: error.message };
  }
}

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