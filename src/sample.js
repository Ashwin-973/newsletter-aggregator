const allProviders=[//this mock data when passed directly works well 
{value: 'no-reply@leetcode.com', label: 'LeetCode'},
{value: 'submissions@webtoolsweekly.com', label: 'Web Tools Weekly'},
{value: 'submissions@vscode.email', label: 'VSCode.Email'},
{value: 'moneygrowthnewsletter@mail.beehiiv.com', label: 'Money Growth Newsletter'},
{value: 'noreply@skool.com', label: 'The AI Report Free Community (Skool)'},
{value: 'newsletters@techcrunch.com', label: 'TechCrunch'},
{value: 'hi@deeperlearning.producthunt.com', label: 'The Frontier by Product Hunt'},
{value: 'theaireport@mail.beehiiv.com', label: 'The AI Report'},
{value: 'bytebytego@substack.com', label: 'ByteByteGo'},
{value: 'noreply@sourcegraph.com', label: 'Sourcegraph'},
{value: 'pragmaticengineer@substack.com', label: 'The Pragmatic Engineer'},
{value: 'yo@dev.to', label: 'DEV Community Digest'}]

const selectedProviders=[
  {value: 'noreply@skool.com', label: 'The AI Report Free Community (Skool)'},
{value: 'newsletters@techcrunch.com', label: 'TechCrunch'},
{value: 'hi@deeperlearning.producthunt.com', label: 'The Frontier by Product Hunt'},
{value: 'theaireport@mail.beehiiv.com', label: 'The AI Report'},
{value: 'bytebytego@substack.com', label: 'ByteByteGo'},
]

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

const extractProviderInfo = (from) => {
  const matches = from.match(/(.*?)\s*<(.+?)>/);
  if (matches) {
    const [, label, email] = matches; //first element contains full match
    return {
            value: email,
            label: label.trim() || email
          }
  }
  return { value: from, label: from };
};

const getUniqueProviders = (newsletters) => {
   if (!Array.isArray(newsletters) || newsletters.length === 0) {
    // return [{ value: "all", label: "All" }];
    return [];
  }
  const providers = new Map();
  // providers.set("all", { value: "all", label: "All" });

  newsletters.forEach(nl => {
    if (nl?.from) {
        const providerInfo=extractProviderInfo(nl.from)
        if (!providers.has(providerInfo.value)) {
          providers.set(providerInfo.value,providerInfo );
        }
      }
    }
  );

  return Array.from(providers.values())
};


console.log(getUniqueProviders(newsletters))
