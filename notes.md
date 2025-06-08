1. Popup.jsx 
sets newsletters and useInfo state to null when auth status in local storage changes
2. gmail.js
one-batch of listmessage takes 1 second to fetch
one-full message takes 1 second to fetch
3. background js



DATA FLOW
OnBoardingContext -> extracts from local storage
Popup -> uses OnBoardingContext ->updates allProviders in local storage(via OnBoardCon)
background -> login -> fetchNewsletters ; initialFullSync✅ -> alarm every 15 mins for delta sync