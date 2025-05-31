import { isAfter, isSameDay, subDays, parseISO,parse,format } from 'date-fns';

const newsletters=[
    {
        "date": "Thu, 15 May 2025 23:58:43 +0000",
        "from": "LeetCode <no-reply@leetcode.com>",
        "id": "196d662d68059463",
        "read": false,
        "subject": "LeetCode Weekly Digest"
    },
    {
        "date": "Thu, 15 May 2025 15:00:35 +0000",
        "from": "Web Tools Weekly <submissions@webtoolsweekly.com>",
        "id": "196d485ecfd752cd",
        "read": false,
        "subject": "Web Tools #617 - Frameworks, SVG Tools, Git/CLI"
    },
    {
        "date": "Wed, 14 May 2025 16:29:51 +0000", //in GMT format
        "from": "\"VSCode.Email\" <submissions@vscode.email>",
        "id": "196cfa2329d1e712",
        "read": false,
        "subject": "VSCode #160 - The Ultimate VS Code Setup for 2025"
    },
    {
        "date": "Thu, 14 May 2025 15:05:38 +0000",
        "from": "Web Tools Weekly <submissions@webtoolsweekly.com>",
        "id": "196b07392dc6b1e1",
        "read": false,
        "subject": "Web Tools #616 - CSS Tools, JSON, Databases, Uncats"
    },
    {
        "date": "Wed, 14 May 2025 16:15:48 +0000",
        "from": "\"VSCode.Email\" <submissions@vscode.email>",
        "id": "196ab8e2ba877ae3",
        "read": false,
        "subject": "VSCode #159 - VS Code Extension Drama"
    },
    {
        "date": "Wed, 14 May 2025 14:02:56 +0000 (UTC)",
        "from": "Money Growth Newsletter <moneygrowthnewsletter@mail.beehiiv.com>",
        "id": "196ab0e86e282b05",
        "read": false,
        "subject": "How I’m Building Wealth with ISAs, BTL Property, & a Newsletter"
    },
    {
        "date": "Fri, 02 May 2025 03:59:06 +0000 (UTC)",
        "from": "\"The AI Report Free Community (Skool)\" <noreply@skool.com>",
        "id": "1968f25e6ae4a5ad",
        "read": false,
        "subject": "Weekly digest for Fri, Apr 25 2025"
    },
    {
        "date": "Thu,  1 May 2025 15:05:03 +0000",
        "from": "Web Tools Weekly <submissions@webtoolsweekly.com>",
        "id": "1968c6272c9b8785",
        "read": false,
        "subject": "Web Tools #615 - Testing Tools, JS Lib Plugins, React Native"
    },
    {
        "date": "Wed, 30 Apr 2025 16:32:06 +0000",
        "from": "\"VSCode.Email\" <submissions@vscode.email>",
        "id": "196878b9352317fc",
        "read": false,
        "subject": "VSCode #158 - Agent Mode Day Videos"
    },
    {
        "date": "Tue, 29 Apr 2025 15:22:02 -0700",
        "from": "TechCrunch <newsletters@techcrunch.com>",
        "id": "19683a4c8b0c6009",
        "read": false,
        "subject": "Update for TechCrunch newsletter subscribers"
    },
    {
        "date": "Fri, 25 Apr 2025 03:58:03 +0000 (UTC)",
        "from": "\"The AI Report Free Community (Skool)\" <noreply@skool.com>",
        "id": "1966b18689268d66",
        "read": false,
        "subject": "Weekly digest for Fri, Apr 18 2025"
    },
    {
        "date": "Thu, 24 Apr 2025 23:08:41 +0000",
        "from": "LeetCode <no-reply@leetcode.com>",
        "id": "1966a0f7adf2217d",
        "read": false,
        "subject": "LeetCode Weekly Digest"
    },
    {
        "date": "Thu, 24 Apr 2025 15:02:46 +0000",
        "from": "Web Tools Weekly <submissions@webtoolsweekly.com>",
        "id": "1966853fb057119d",
        "read": false,
        "subject": "Web Tools #614 - CSS Tools, AI Tools, Build/Bundle"
    }
]


/*const applyFilters = (newsletters, { duration}) => {
  return newsletters.filter(nl => {
    const now = new Date();  //gives date in GMT
    const inputFormat = 'E, dd MMM yyyy HH:mm:ss xx';
      // Clean up the date string first
    const cleanDate = nl.date
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\([^)]*\)/g, '') // Remove anything in parentheses like (UTC)
      .trim(); // Remove leading/trailing spaces
    const dateObject = parse(cleanDate, inputFormat, now);
    const isoStringGMT = dateObject.toISOString();


    // Duration filter
    const passesDateFilter = () => {
      if (!duration) return true;
      if (Array.isArray(duration)) {
        const [customDate, customTime] = duration;
        // if(!customTime) customTime='00:00:00'
        const filterDate = new Date(`${customDate}T${customTime}`);  //convert from date/time to GMT
        console.log(filterDate)
        console.log(isAfter(isoStringGMT, filterDate))
        return isAfter(isoStringGMT, filterDate); 
      }
      
      switch(duration) {
        case "1": 
          return true;
        case "2": // Today
          return isSameDay(isoStringGMT, now);
        case "3": // Last 7 days
          console.log(isAfter(isoStringGMT,now))
          return isAfter(isoStringGMT, subDays(now, 7));   //subtract 7 days from now
        default:
          return true;
      }
    };

    return passesDateFilter()
  }).sort((a, b) => new Date(b.date) - new Date(a.date)); // Always newest first
};

const custom=['2025-05-14', '21:51']
const params={duration:custom}
console.log(applyFilters(newsletters,params))



// Your input date string
// const inputDateString = 'Wed, 14 May 2025 16:29:51 +0000';

// The format string that matches your input date format
// E: Day of week (Thu)
// dd: Day of month (15)
// MMM: Month (May)
// yyyy: Year (2025)
// HH: Hour (23)
// mm: Minute (58)
// ss: Second (43)
// xx: Timezone offset (+0000)
/*const inputFormat = 'E, dd MMM yyyy HH:mm:ss xx';

// Parse the input string into a Date object
// The third argument (new Date()) is a reference date, often needed for parsing
const dateObject = parse('Thu,  1 May 2025 15:05:03 +0000', inputFormat, new Date());

// The resulting Date object represents the exact moment in time in UTC because
// the input had a +0000 offset. The simplest way to get the desired ISO 8601
// format is using the native toISOString() method.
const isoStringGMT = dateObject.toISOString();

console.log(isoStringGMT); // Output will be in the format 2025-05-15T23:58:43.000Z

console.log(isAfter(isoStringGMT,new Date()))
*/



const originalData = [
  {value: 'all', label: 'All'},
  {value: 'noreply@skool.com', label: '"Wifi Life (Skool)"'},
  {value: 'noreply@skool.com', label: '"AI For Professionals (Free) (Skool)"'},
  {value: 'no-reply@leetcode.com', label: 'LeetCode'},
  {value: 'submissions@vscode.email', label: '"VSCode.Email"'},
  {value: 'noreply@skool.com', label: '"The AI Report Free Community (Skool)"'},
  {value: 'hi@frontendmentor.io', label: 'Matt from Frontend Mentor'},
  {value: 'submissions@webtoolsweekly.com', label: 'Web Tools Weekly'},
  {value: 'moneygrowthnewsletter@mail.beehiiv.com', label: 'Money Growth Newsletter'},
  {value: 'newsletters@techcrunch.com', label: 'TechCrunch'},
  {value: 'hi@deeperlearning.producthunt.com', label: 'The Frontier by Product Hunt'},
  {value: 'theaireport@mail.beehiiv.com', label: 'The AI Report'},
  {value: 'bytebytego@substack.com', label: 'ByteByteGo'},
  {value: 'noreply@sourcegraph.com', label: 'Sourcegraph'},
  {value: 'pragmaticengineer@substack.com', label: 'The Pragmatic Engineer'},
  {value: 'yo@dev.to', label: 'DEV Community Digest'}
];

console.log(originalData[0].label); // Outputs: All
console.log(originalData.length);   // Outputs: 16
function cleanLabels(dataArray) {
  return dataArray.map(item => {
    if (typeof item.label === 'string') {
      // Use replace() with a regex to remove leading/trailing double quotes
      // The regex /^"|"$/g matches " at the start (^) or at the end ($) of the string.
      return { ...item, label: item.label.replace(/^"|"$/g, '') };
    }
    return item; // Return item as is if label is not a string
  });
}


console.log(cleanLabels(originalData))