export async function getNewsletters() {
  const { newsletters } = await chrome.storage.local.get('newsletters');
  return newsletters || [];
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
