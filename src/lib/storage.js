export async function getNewsletters() {
  try{
      const { newsletters } = await chrome.storage.local.get('newsletters');
      return newsletters;
  }
  catch(error){
     console.error('Error getting newsletter from storage:', error);
     return [];
  }
}

export async function setNewsletters(newsletters) {
  await chrome.storage.local.set({ newsletters });
}

export async function getAuthState() {
  const { isAuthorize } = await chrome.storage.local.get('isAuthorize');
  return !!isAuthorize;
}

export async function setAuthState(isAuthorize) {
  await chrome.storage.local.set({ isAuthorize });
}


export async function updateNewsletterInStorage(messageId, updates) {
  try {
    const { newsletters } = await chrome.storage.local.get('newsletters');
    const updatedNewsletters = newsletters.map(nl => 
      nl.id === messageId ? { ...nl, ...updates } : nl
    );
    await chrome.storage.local.set({ newsletters: updatedNewsletters });
    return { success: true };
  } catch (error) {
    console.error('Error updating newsletter in storage:', error);
    return { success: false, error: error.message };
  }
}

export async function getNewslettersByStatus(status) {
  try {
    const { newsletters } = await chrome.storage.local.get('newsletters');
    switch (status) {
      case 'bookmarked':
        return newsletters.filter(nl => nl.bookmark);
      case 'readLater':
        return newsletters.filter(nl => nl.readLater);
      case 'incomplete':
        return newsletters.filter(nl => nl.incomplete);
      case 'saved':
        return newsletters.filter(nl => nl.readLater || nl.incomplete);
      default:
        return newsletters;
    }
  } catch (error) {
    console.error('Error getting newsletters by status:', error);
    return [];
  }
}

export function mergeNewsletterData(existingNewsletters, newNewsletters) {
  const existingMap = new Map(existingNewsletters.map(nl => [nl.id, nl]));
  
  return newNewsletters.map(newNl => {
    const existing = existingMap.get(newNl.id);
    if (existing) {
      // Preserve user-set properties
      return {
        ...newNl,
        bookmark: existing.bookmark || false,
        readLater: existing.readLater || false,
        incomplete: existing.incomplete || false,
        scrollPosition: existing.scrollPosition || null
      };
    }
    return {
      ...newNl,
      bookmark: false,
      readLater: false,
      incomplete: false,
      scrollPosition: null
    };
  });
}