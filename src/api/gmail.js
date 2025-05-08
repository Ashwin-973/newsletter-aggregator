// import parser
// import storage
//use window.gapi to resolve scope errors

// let from=[]
let from=new Set() //all unique sender names
let sentAt=[]
let subject=[]
let read=[]

export const initializeGapiClient = async () => {
    try {
       await window.gapi.client.init({
           apiKey: import.meta.VITE_API_KEY,
           // discoveryDocs are often needed for APIs like Gmail
           discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"],
       });
       console.log("GAPI client initialized");
       console.log(window.gapi)
       // Note: Client is initialized, but not yet authorized for API calls
    } catch (error) {
       console.error("Error initializing GAPI client:", error);
    }
 }


export const fetchNewsletters = async (options = {}) => {
    const { maxResults = 10000, startDate, endDate, providers = [] } = options;
    
    try {
      // Construct a search query to find newsletters
      // This is a critical part - Gmail doesn't have "newsletter" type
      // so we need to use heuristics
      let query = 'category:promotions OR category:updates OR category:forums';
      
      // Common newsletter footers/headers patterns
      query += ' OR "unsubscribe" OR "view in browser" OR "email preferences" OR header.precedence:bulk OR header.precedence:list'
      
      // Add date constraints if provided
      if (startDate) {
        query += ` after:${formatDateForGmail(startDate)}`;
      }
      
      if (endDate) {
        query += ` before:${formatDateForGmail(endDate)}`;
      }
      
      // Add specific providers if requested
      if (providers.length > 0) {
        const providersQuery = providers.map(p => `from:${p}`).join(' OR ');
        query += ` AND (${providersQuery})`;
      }
      
      // Execute the search
      const response = await window.gapi?.client?.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults,
      });
      
      if (!response?.result.messages || response?.result.messages.length === 0) {
        return [];
      }
      
      // Fetch full message details for each message
      // Use batch requests to optimize API usage
      const messagePromises = response.result.messages.map(message => 
        gapi.client?.gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'full', // Get full message content
        })
      );
      
      const messageResponses = await Promise.all(messagePromises);

    
      // Process and extract relevant newsletter data
      const newsletters = messageResponses
        .map(resp => resp.result)
        // .filter(message => isLikelyNewsletter(message)) // Filter out non-newsletters
        // .map(message => parseNewsletterEmail(message));
      
      // Store the newsletters in local storage
    //   await storeNewsletters(newsletters);
      console.log("Newsletters : ",newsletters)
      newsletters.forEach((letter) => {
        const dateHeader = letter.payload.headers.find(meta => meta.name === 'Date');
        const fromHeader = letter.payload.headers.find(meta => meta.name === 'From');
        const subjectHeader=letter.payload.headers.find(meta=>meta.name === 'Subject')
        if (dateHeader) sentAt.push(dateHeader);
        if (fromHeader) from.add(fromHeader.value);
        if(subjectHeader) subject.push(subjectHeader)
      });

    console.log("Date : ",sentAt)
    console.log("From : ",from)
    console.log("Subject : ",subject)
      return newsletters;
    } catch (error) {
      console.error('Error fetching newsletters:', error);
      throw error;
    }
  };
  
  /**
   * Determines if an email is likely a newsletter based on content/headers
   */
  //these are hoisted

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
  /**
   * Formats a JS date for Gmail's query format
   */
  function formatDateForGmail(date) {
    const d = new Date(date);
    return d.toISOString().split('T')[0].replace(/-/g, '/');
  }
  
  /**
   * Gets sender avatar/logo if available
   */
  /*export const getSenderAvatar = async (email) => {
    try {
      // Extract domain from email
      const domain = email.split('@')[1];
      
      // Try to get favicon from domain
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      
      // You could validate if this returns a valid image
      // by making a HEAD request
      
      return faviconUrl;
    } catch {
      return null;
    }
  };*/
  
  /**
   * Mark message as read/unread in Gmail
   */
  export const markMessageReadStatus = async (messageId, read = true) => {
    try {
      // To mark as read, we remove the UNREAD label
      // To mark as unread, we add the UNREAD label
      const requestBody = {
        removeLabelIds: read ? ['UNREAD'] : [],
        addLabelIds: read ? [] : ['UNREAD'],
      };
      
      await gapi.client?.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        resource: requestBody,
      });
      
      return true;
    } catch (error) {
      console.error('Error changing read status:', error);
      throw error;
    }
  };
  
  /**
   * Get all newsletter providers (senders)
   */
 /* export const getNewsletterProviders = async () => {
    try {
      const newsletters = await fetchNewsletters({ maxResults: 500 });
      
      // Extract unique providers
      const providers = [...new Set(newsletters.map(n => n.provider))];
      
      return providers.map(provider => ({
        id: provider,
        name: provider,
        email: provider, // This would be the email address
        // avatar: getSenderAvatar(provider),
      }));
    } catch (error) {
      console.error('Error fetching newsletter providers:', error);
      throw error;
    }
  };*/



