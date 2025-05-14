// Add buttons to Gmail UI
//to send message to content script use tabs.sendMessage
/*document.addEventListener('DOMContentLoaded', () => {
  // Example: Add "Mark Incomplete" button to email rows
  const emailRows = document.querySelectorAll('.zA'); 
  emailRows.forEach(row => {
    const btn = document.createElement('button');
    btn.textContent = 'Mark Incomplete';
    btn.onclick = () => chrome.runtime.sendMessage({ action: 'markIncomplete', messageId: row.dataset.messageId });
    row.appendChild(btn);
  });
});*/





// Call markMessageReadStatus on user action
async function markRead(messageId, read) {
  const { markMessageReadStatus } = await import('./lib/gmailApi.js');
  await markMessageReadStatus(messageId, read);
}




//wtf is this ?
/*document.addEventListener('DOMContentLoaded', () => {
  // Add buttons to Gmail UI
  const observer = new MutationObserver((mutations) => {
    const emailRows = document.querySelectorAll('.zA:not(.newsletter-processed)');
    if (emailRows.length > 0) {
      emailRows.forEach(row => {
        // Mark as processed
        row.classList.add('newsletter-processed');
        
        // Add newsletter controls
        const controls = document.createElement('div');
        controls.className = 'newsletter-controls';
        
        const bookmarkBtn = document.createElement('button');
        bookmarkBtn.textContent = 'Bookmark';
        bookmarkBtn.onclick = (e) => {
          e.stopPropagation();
          const messageId = row.dataset.messageId || extractMessageId(row);
          chrome.runtime.sendMessage({ 
            action: 'bookmarkNewsletter', 
            messageId: messageId 
          });
        };
        
        controls.appendChild(bookmarkBtn);
        row.appendChild(controls);
      });
    }
  });
  
  // Start observing Gmail inbox
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});*/

// Helper to extract message ID from row if not in dataset
function extractMessageId(row) {
  // Extract from URL or element attributes
  const link = row.querySelector('a[href*="/#inbox/"]');
  if (link) {
    const href = link.getAttribute('href');
    const match = href.match(/\/#inbox\/([^\/]+)/);
    return match ? match[1] : null;
  }
  return null;
}

/*// Call markMessageReadStatus on user action
async function markRead(messageId, read) {
  chrome.runtime.sendMessage({ 
    action: 'markReadStatus', 
    messageId: messageId,
    read: read 
  });
}*/