// import parser
// import {setNewsletters} from "../lib/storage"
//use window.gapi to resolve scope errors

// let from=[]
// let from=new Set() //all unique sender names
// let sentAt=[]
// let subject=[]
// let read=[]

// let gapiClientInitialized = false;

// async function initializeGapiClient() {
//   if (typeof gapi === 'undefined' || typeof gapi.client === 'undefined') {
//     return new Promise((resolve, reject) => {
//       const intervalId = setInterval(() => {
//         if (typeof gapi !== 'undefined' && typeof gapi.client !== 'undefined') {
//           clearInterval(intervalId);
//           gapi.load('client', async () => {
//             try {
//               await gapi.client.init({ /* API Key might be needed for some APIs, but not typically for Gmail with OAuth */ });
//               // Load the Gmail API discovery document
//               await gapi.client.load('gmail', 'v1');
//               gapiClientInitialized = true;
//               console.log('GAPI client and Gmail API initialized.');
//               resolve();
//             } catch (error) {
//               console.error('Error initializing GAPI client or loading Gmail API:', error);
//               reject(error);
//             }
//           });
//         }
//       }, 100); // Check every 100ms for GAPI
//     });
//   } else if (!gapiClientInitialized) {
//      // GAPI script is loaded, but client might not be initialized or Gmail API not loaded
//     try {
//       await gapi.client.init({ }); 
//       await gapi.client.load('gmail', 'v1');
//       gapiClientInitialized = true;
//       console.log('GAPI client and Gmail API re-initialized.');
//     } catch (error) {
//       console.error('Error re-initializing GAPI client or loading Gmail API:', error);
//       throw error;
//     }
//   }
// }

// export function setGapiToken(token) {
//   if (!gapiClientInitialized || !gapi || !gapi.client) {
//     console.error('GAPI client not initialized before setting token.');
//     throw new Error('GAPI client not initialized.');
//   }
//   gapi.client.setToken({ access_token: token });
//   console.log('GAPI token set.');
// }

const GMAIL_API_BASE_URL = 'https://gmail.googleapis.com/gmail/v1/users/me';

/*RATE LIMITER CONFIG */

const RATE_LIMIT_CONFIG = {
  maxConcurrentRequests: 5,
  requestsPerSecond: 10,
  maxRetries: 5,
  baseDelayMs: 1000,
  maxDelayMs: 60000,
  jitterMs: 500
};

// Rate limiter class
class RateLimiter {
  constructor(config = RATE_LIMIT_CONFIG) {
    this.config = config;
    this.activeRequests = 0;
    this.requestQueue = [];
    this.lastRequestTime = 0;
    this.requestTimes = [];
}

async executeRequest(requestFn, context = '') {
  return new Promise((resolve, reject) => {
    this.requestQueue.push({
      execute: requestFn,
      resolve,
      reject,
      context,
      retries: 0
      });
    this.processQueue();
    });
}

async processQueue() {
  if (this.activeRequests >= this.config.maxConcurrentRequests || this.requestQueue.length === 0) {
    return;
  }

//check rate limit per second
const now = Date.now();
  this.requestTimes = this.requestTimes.filter(time => now - time < 1000);
    
if (this.requestTimes.length >= this.config.requestsPerSecond) {
    setTimeout(() => this.processQueue(), 100);
    return;
  }

const request = this.requestQueue.shift();
  this.activeRequests++;
  this.requestTimes.push(now);

  try {
    const result = await this.executeWithRetry(request);
    request.resolve(result);
  } catch (error) {
    request.reject(error);
  } finally {
    this.activeRequests--;
    // process next request after a small delay
      setTimeout(() => this.processQueue(), 50);
    }
  }

async executeWithRetry(request) {
    const { execute, context, retries } = request;
    
    try {
      return await execute();
    } catch (error) {
      if (this.shouldRetry(error, retries)) {
        const delay = this.calculateBackoffDelay(retries);
        console.log(`Retrying ${context} after ${delay}ms (attempt ${retries + 1})`);
        
        await this.sleep(delay);
        request.retries++;
        return this.executeWithRetry(request);
      }
      throw error;
    }
  }

shouldRetry(error, retries) {
    if (retries >= this.config.maxRetries) return false;

// Retry on rate limit, server errors, or network issues
const retryableStatuses = [429, 500, 502, 503, 504];
const status = error.status || (error.message && error.message.includes('429') ? 429 : 0);
    
return retryableStatuses.includes(status) || 
    error.message?.includes('network') ||
    error.message?.includes('timeout');
  }

calculateBackoffDelay(retries) {
    const exponentialDelay = Math.min(
      this.config.baseDelayMs * Math.pow(2, retries),
      this.config.maxDelayMs
    );
    
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * this.config.jitterMs;
    return exponentialDelay + jitter;
  }

sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}


//global rate limiter class
const rateLimiter = new RateLimiter();


export async function fetchNewslettersFromGmail(token, queryOptions = {}) {
  if (!token) {
    console.error('No auth token provided for fetching newsletters.');
    throw new Error('Authentication token is required.');
  }

  // A more refined query to catch newsletters might include specific sender patterns
  // or more nuanced keyword combinations if the basic ones are too broad or too narrow.
  const {
    query = 'category:primary OR category:promotions OR category:updates OR category:forums (label:^smartlabel_newsletter OR subject:newsletter OR subject:digest OR "view this email in your browser" OR "unsubscribe from this list") OR "unsubscribe" OR "view in browser" OR "email preferences"',
    maxResults = 100,
    pageToken = null,
    includeSpamTrash = false
  } = queryOptions;


//construct query params
const params = new URLSearchParams({
    q: query,
    maxResults: maxResults.toString(),
    includeSpamTrash: includeSpamTrash.toString()
  });

if (pageToken) {
    params.set('pageToken', pageToken);
  }

const listUrl = `${GMAIL_API_BASE_URL}/messages?${params.toString()}`;

  try {
    console.log(`Fetching newsletters with query: "${query}"`);
    const listResponse = await fetch(listUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!listResponse.ok) {
      const errorBody = await listResponse.text();
      console.error('Failed to list messages:', listResponse.status, errorBody);
      if (listResponse.status === 401) {
         throw new Error('Token has been expired or revoked (401)');
      }
      throw new Error(`Failed to list messages: ${listResponse.status} ${errorBody}`);
    }

    const listResult = await listResponse.json();

    console.log("Newsletters : ",listResult)
    const messages = listResult.messages || [];

    if (messages.length === 0) {
      console.log('No newsletters found matching the query.');
      return [];
    }

    const newsletterDetailsPromises = messages.map(async (message) => {
      // Request specific metadata headers
      const messageUrl = `${GMAIL_API_BASE_URL}/messages/${message.id}?format=full&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`;
      try {
        const msgResponse = await fetch(messageUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!msgResponse.ok) {
          const errorBody = await msgResponse.text();
          console.error(`Error fetching details for message ID ${message.id}:`, msgResponse.status, errorBody);
          if (msgResponse.status === 401) {
            throw new Error('Token has been expired or revoked during message fetch (401)');
          }
          return null; 
        }
        return await msgResponse.json();
      } catch (err) {
        console.error(`Network or critical error fetching message ID ${message.id}:`, err);
        if (err.message?.includes('(401)')) throw err; 
        return null; 
      }
    });

    const resolvedDetails = await Promise.all(newsletterDetailsPromises);
    // Filter out any null results from failed individual fetches (that weren't critical auth errors)
    const validNewsletterDetails = resolvedDetails.filter(detail => detail !== null);
    
    console.log('Fetched newsletter details:', validNewsletterDetails);

    // const newsletters = validNewsletterDetails.map(resp => resp.result);
    // Store in chrome.storage.local
    const newsletterData = validNewsletterDetails.map(letter => {
      const dateHeader = letter.payload.headers.find(meta => meta.name === 'Date')?.value;
      const fromHeader = letter.payload.headers.find(meta => meta.name === 'From')?.value;
      const subjectHeader = letter.payload.headers.find(meta => meta.name === 'Subject')?.value;
      return {
        id: letter.id,
        date: dateHeader,
        from: fromHeader,
        subject: subjectHeader,
        read: !letter.labelIds.includes('UNREAD'),
        bookmark: false, 
        readLater: false, 
        incomplete: false, 
        scrollPosition: null 
      };
    });

    return newsletterData;

  } catch (error) { // Catches errors from listMessages or critical errors from messageDetails
    console.error('Error in fetchNewslettersFromGmail main try block:', error);
    throw error; // Re-throw the error for the background script to handle
  }
}


// fetch email content on list-click
export async function fetchEmailContent(token, messageId) {
  if (!token || !messageId) {
    throw new Error('Token and messageId are required');
  }

  const messageUrl = `${GMAIL_API_BASE_URL}/messages/${messageId}?format=full`;

  try {
    const response = await fetch(messageUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token has been expired or revoked (401)');
      }
      throw new Error(`Failed to fetch email content: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching email content:', error);
    throw error;
  }
}

//decode base64URL
export function decodeBase64Url(str) {
  if (!str) return '';
  
  // Replace URL-safe characters
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  
  // Add padding if needed
  while (str.length % 4) {
    str += '=';
  }
  
  try {
    return atob(str);
  } catch (e) {
    console.error('Failed to decode base64:', e);
    return '';
  }
}

//parse email content
export function parseEmailContent(message) {
  const result = {
    html: '',
    text: '',
    attachments: [],
    headers: {}
  };

  // Extract headers
if (message.payload?.headers) {
    message.payload.headers.forEach(header => {
      result.headers[header.name.toLowerCase()] = header.value;
    });
  }

  // Parse the message parts
function parseParts(part) {
  if (!part) return;

    const mimeType = part.mimeType;
    const body = part.body;

    if (mimeType === 'text/html' && body?.data) {
      result.html = decodeBase64Url(body.data);
    } else if (mimeType === 'text/plain' && body?.data) {
      result.text = decodeBase64Url(body.data);
    } else if (mimeType?.startsWith('multipart/')) {
      // Handle multipart content
      if (part.parts) {
        part.parts.forEach(parseParts);
      }
    } else if (part.filename && body?.attachmentId) {
      // Handle attachments
      result.attachments.push({
        filename: part.filename,
        mimeType: mimeType,
        attachmentId: body.attachmentId,
        size: body.size
      });
    }

    // Recursively parse nested parts
    if (part.parts) {
      part.parts.forEach(parseParts);
    }
  }

  parseParts(message.payload);

  return result;
}

// handle emails as READ via gmail API
export async function markMessageAsRead(token, messageId) {
  if (!token || !messageId) {
    throw new Error('Token and messageId are required');
  }

  /*const modifyUrl = `${GMAIL_API_BASE_URL}/messages/${messageId}/modify`;

  try {
    const response = await fetch(modifyUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        removeLabelIds: ['UNREAD']
      })
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token has been expired or revoked (401)');
      }
      throw new Error(`Failed to mark message as read: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }*/
 console.log("fake Read status modified ")
}





/* 
  All GAPI client related code has been removed or commented out below 
  as we are using direct fetch calls with an OAuth token. 
  If GAPI client features are needed later, they would require a different loading strategy
  or the service worker would have to not be of type: "module".
*/

// Commented out old variable declarations that were related to the old gapi-based fetchNewsletters
// let from = new Set(); 
// let sentAt = [];
// let subject = [];
// let read = []; // This was unused

// Commented out old gapi client initialization and GAPI-based functions
/*
let gapiClientInitialized = false;
async function initializeGapiClient() { ... }
export function setGapiToken(token) { ... }
const fetchNewsletters = async (options = {}) => { ... }; // Old GAPI based
function formatDateForGmail(date) { ... }
const markMessageReadStatus = async (messageId, read = true) => { ... }; // Old GAPI based
export { initializeGapiClient, fetchNewsletters,markMessageReadStatus }; // Old exports
*/

// /**
//  * Determines if an email is likely a newsletter based on content/headers
//  */
// //these are hoisted

/*function parseFromHeader(fromHeader) {
  if (!fromHeader) return { name: '', email: '' };
  const match = fromHeader.match(/(.*)<(.*)>/);
  if (match) {
      return { name: match[1].trim(), email: match[2].trim().toLowerCase() };
  }
  if (fromHeader.includes('@')) {
      return { name: '', email: fromHeader.trim().toLowerCase() };
  }
  return { name: fromHeader.trim(), email: '' };
}*/
/*function isLikelyNewsletter(message) {
    let score = 0;
    const NEWSLETTER_THRESHOLD = 4; // Define a threshold for classifying as newsletter

    const headers = message.payload.headers || [];
    const subject = (headers.find(h => h.name.toLowerCase() === 'subject')?.value || '').toLowerCase();
    const fromHeaderValue = headers.find(h => h.name.toLowerCase() === 'from')?.value || '';
    const listUnsubscribeHeader = headers.find(h => h.name.toLowerCase() === 'list-unsubscribe');
    const listPostHeader = headers.find(h => h.name.toLowerCase() === 'list-post'); // Common in mailing lists, not typically curated newsletters
    const precedenceHeader = headers.find(h => h.name.toLowerCase() === 'precedence')?.value?.toLowerCase();
    const xCampaignIdHeader = headers.find(h => h.name.toLowerCase().startsWith('x-campaign') || h.name.toLowerCase().startsWith('x-mailer')); // Indicates bulk mailer

    const { name: senderName, email: senderEmail } = parseFromHeader(fromHeaderValue);
    const senderDomain = senderEmail.substring(senderEmail.lastIndexOf('@') + 1);

    // --- POSITIVE SIGNALS ---

    // 1. Strong Newsletter Keywords in Subject
    if (/\b(newsletter|digest|weekly|monthly|daily edition|roundup|bulletin|issue\s*#\d*|edition)\b/i.test(subject)) {
        score += 3;
        // Why: These are very specific to newsletters.
    }

    // 2. Presence of List-Unsubscribe Header
    if (listUnsubscribeHeader) {
        score += 2;
        // Why: Common in newsletters, but also other bulk mail. Significant, but not definitive.
    }

    // 3. Precedence Header indicating 'bulk' or 'list'
    if (precedenceHeader && (precedenceHeader === 'bulk' || precedenceHeader === 'list')) {
        score += 2;
        // Why: Explicit indication of bulk email.
    }

    // 4. Sender Name/Email Patterns
    if (/\b(newsletter|digest|weekly|updates|alerts|bulletin)\b/i.test(senderName.toLowerCase())) {
        score += 1;
        // Why: Senders sometimes identify the nature in their name.
    }
    if (/^(news|newsletter|updates|digest|hello@|info@|contact@|team@|no-reply@|noreply@)/i.test(senderEmail)) {
        // Check common newsletter-y usernames or generic sender usernames often used for bulk
        score += 1;
    }
    if (/\b(news|mailer|email|campaign|marketing)\b/i.test(senderDomain)) { // e.g., news.example.com, example.campaigns.com
        score += 1;
    }


    // 5. Common Newsletter Phrases in Snippet (if available, otherwise use subject as proxy)
    // Gmail API's `message.snippet` can be useful here.
    const contentIndicator = message.snippet ? message.snippet.toLowerCase() : subject;
    if (/\b(view this email in your browser|view as a web page|email preferences|manage preferences)\b/i.test(contentIndicator)) {
        score += 2;
        // Why: Classic newsletter footer links.
    }

    // 6. X-Campaign ID / X-Mailer Headers
    if (xCampaignIdHeader) {
        score += 1;
        // Why: Often present in emails sent via Email Service Providers (ESPs).
    }

    // --- NEGATIVE SIGNALS ---
    // To reduce false positives from sites like Glassdoor, Pinterest, transactional emails

    // 1. Keywords for Transactional/Notification Emails in Subject
    const transactionalSubjectKeywords = /\b(job alert|application status|password reset|verify your email|order confirmation|shipping update|invoice|your account|security alert|invitation|mentioned you|commented on|friend request|new login|payment processed|appointment reminder|new message|your request|ticket #|case #|thank you for your order)\b/i;
    if (transactionalSubjectKeywords.test(subject)) {
        score -= 3;
        // Why: These strongly suggest non-newsletter operational emails.
    }

    // 2. Keywords in Sender Name/Email for known non-newsletter types
    if (/\b(support|billing|jobs|careers|notifications|accounts|service|customer care|admin|alert|notification)\b/i.test(senderName.toLowerCase()) && !(/\b(newsletter|digest)\b/i.test(senderName.toLowerCase()))) {
        // Penalize if "notifications" etc. is present AND strong newsletter words are ABSENT from sender name
        score -= 2;
    }
    if (/^(support@|billing@|jobs@|careers@|notifications@|alerts@|no-reply@|noreply@|admin@|service@|account@)/i.test(senderEmail) && !(/^(newsletter@|updates@|digest@)/i.test(senderEmail))) {
        // Penalize if sender email starts with typical transactional prefixes AND NOT newsletter prefixes
        score -=2;
    }


    // 3. List-Post Header (often indicates a mailing list, not a curated newsletter)
    if (listPostHeader) {
        score -= 2;
        // Why: Users can post to these lists, differentiating them from publisher-driven newsletters.
    }

    // 4. Specific Domains known for high volume of non-newsletter bulk mail (can be user-customizable)
    // These are the ones you mentioned as problematic.
    const problematicDomains = ['pinterest.com', 'glassdoor.com', 'internshala.com', 'unstop.com', 'linkedin.com', 'facebookmail.com', 'twitter.com', 'quora.com', 'amazon.com', 'ebay.com'];
    // You can add more e-commerce, social media, job sites here.
    if (problematicDomains.some(domain => senderDomain.endsWith(domain))) {
        // If it has strong newsletter signals otherwise, don't penalize too harshly.
        // If not, it's likely a notification from these platforms.
        if (score < NEWSLETTER_THRESHOLD -1 && !(/\b(newsletter|digest|weekly|monthly)\b/i.test(subject))) { // If not already strongly looking like a newsletter
             score -= 3; // Strong penalty
        } else {
             score -= 1; // Slight penalty as some of these *can* have newsletters
        }
    }

    // --- Final Decision ---
    // console.log(`Subject: "${subject.substring(0,50)}...", From: ${senderEmail}, Score: ${score}`);
    return score >= NEWSLETTER_THRESHOLD;
}*/
// /**
//  * Formats a JS date for Gmail's query format
//  */
// function formatDateForGmail(date) {
//   const d = new Date(date);
//   return d.toISOString().split('T')[0].replace(/-/g, '/');
// }
// 
// /**
//  * Gets sender avatar/logo if available
//  */
// /*export const getSenderAvatar = async (email) => {
//   try {
//     // Extract domain from email
//     const domain = email.split('@')[1];
//     
//     // Try to get favicon from domain
//     const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
//     
//     // You could validate if this returns a valid image
//     // by making a HEAD request
//     
//     return faviconUrl;
//   } catch {
//     return null;
//   }
// };*/
// 
// /**
//  * Mark message as read/unread in Gmail
//  */
// const markMessageReadStatus = async (messageId, read = true) => {
//     try {
//       // To mark as read, we remove the UNREAD label
//       // To mark as unread, we add the UNREAD label
//       const requestBody = {
//         removeLabelIds: read ? ['UNREAD'] : [],
//         addLabelIds: read ? [] : ['UNREAD'],
//       };
//       
//       await gapi.client?.gmail.users.messages.modify({
//         userId: 'me',
//         id: messageId,
//         resource: requestBody,
//       });
//       
//       return true;
//     } catch (error) {
//       console.error('Error changing read status:', error);
//       throw error;
//     }
//   };
//   
//   /**
//    * Get all newsletter providers (senders)
//    */
//  /* export const getNewsletterProviders = async () => {
//     try {
//       const newsletters = await fetchNewsletters({ maxResults: 500 });
//       
//       // Extract unique providers
//       const providers = [...new Set(newsletters.map(n => n.provider))];
//       
//       return providers.map(provider => ({
//         id: provider,
//         name: provider,
//         email: provider, // This would be the email address
//         // avatar: getSenderAvatar(provider),
//       }));
//     } catch (error) {
//       console.error('Error fetching newsletter providers:', error);
//       throw error;
//     }
//   };*/


// export { initializeGapiClient, fetchNewsletters,markMessageReadStatus };