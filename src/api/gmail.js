// import parser
// import storage
//use window.gapi to resolve scope errors

let from=[]
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
    const { maxResults = 100, startDate, endDate, providers = [] } = options;
    
    try {
      // Construct a search query to find newsletters
      // This is a critical part - Gmail doesn't have "newsletter" type
      // so we need to use heuristics
      let query = 'category:promotions OR category:updates OR category:forums';
      
      // Common newsletter footers/headers patterns
      query += ' OR "unsubscribe" OR "view in browser" OR "email preferences"';
      
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
        if (fromHeader) from.push(fromHeader);
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
  /*function isLikelyNewsletter(message) {
    // Implement heuristics to identify newsletters
    // This is a simplified version - you'll want more robust detection
    
    // Check headers
    const headers = message.payload.headers || [];
    const from = headers.find(h => h.name.toLowerCase() === 'from')?.value || '';
    const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || '';
    const listUnsubscribe = headers.find(h => h.name.toLowerCase() === 'list-unsubscribe');
    
    // Check for common newsletter patterns
    const hasListUnsubscribe = !!listUnsubscribe;
    const fromContainsSender = /news|newsletter|weekly|daily|digest|updates/i.test(from);
    const subjectPatterns = /issue|newsletter|weekly|digest|edition|update|roundup/i.test(subject);
    
    // Check for common newsletter sender domains
    const senderDomains = [
      'newsletter',
      'updates',
      'noreply',
      'mail',
      'info',
      'hello',
      'news',
    ];
    
    const matchesSenderPattern = senderDomains.some(domain => from.includes(domain));
    
    // If it has list-unsubscribe header, it's very likely a newsletter
    if (hasListUnsubscribe) return true;
    
    // Otherwise use other heuristics
    return (fromContainsSender || subjectPatterns || matchesSenderPattern);
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



