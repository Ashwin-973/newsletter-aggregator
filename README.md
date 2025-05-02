Newsletter Aggregator Extension

Newsletter Aggregator is a Chrome browser extension designed to declutter your Gmail inbox by intelligently managing newsletters. Say goodbye to newsletter overload with powerful filtering, prioritization, and AI-driven insights. This MVP helps you focus on what matters by organizing newsletters, tracking reading progress, and providing LLM-powered summaries and topic analysis.
Table of Contents

About
Features
Installation
Usage
Configuration
Contributing
License
Contact
Acknowledgments

About
Overwhelmed by newsletters flooding your Gmail inbox? Newsletter Aggregator solves this by offering a seamless, in-browser solution to filter, prioritize, and summarize newsletters. Unlike standalone apps, this extension integrates directly with Gmail, leveraging the Gmail API for real-time email management and Hugging Face’s Inference API for AI-powered features like topic extraction and summaries. Whether you’re a busy professional, a curious learner, or a newsletter enthusiast, this tool helps you reclaim control of your inbox.
Why Use Newsletter Aggregator?

Declutter Your Inbox: Filter newsletters by date, provider, or read status to focus on what’s relevant.
Stay Organized: Bookmark newsletters, mark them for later, or track incomplete reads.
Gain Insights: Get AI-generated summaries, topics, and contextual Q&A to decide what’s worth reading.
Prioritize Efficiently: Set preferred providers to ensure your favorite newsletters rise to the top.

Features

Advanced Filtering:
Filter by date (e.g., past day, past week, specific date).
Filter by newsletter provider (e.g., Substack, Mailchimp).
View read, unread, or incomplete newsletters.


Bookmark & Read Later: Save newsletters for future reading with a single click.
Priority Mode: Highlight newsletters from preferred providers at the top of your list.
Incomplete Tracking: Get prompted to save half-read newsletters, preserving your reading progress.
AI-Powered Enhancements (MVP):
Generate topics and brief descriptions for each newsletter to avoid clickbait.
Summarize newsletters or explain key points as you read.
Ask questions about newsletter content with contextual understanding.
Search newsletters by topic (e.g., “blockchain,” “payment solutions”) using semantic analysis.



Future features include daily digest mode, topic cloud visualization, and smart declutter rules.
Installation
Prerequisites

Google Chrome (version 120 or later).
A Gmail account.
Node.js (version 18 or later) for local development.
A Hugging Face account for AI features (free tier).

Steps

Clone the Repository:
git clone https://github.com/your-username/newsletter-aggregator-extension.git
cd newsletter-aggregator-extension


Install Dependencies:
npm install


Build the Extension:
npm run build


Load the Extension in Chrome:

Open Chrome and navigate to chrome://extensions/.
Enable Developer mode (top-right toggle).
Click Load unpacked and select the dist folder from the project directory.


Authenticate with Gmail:

The extension will prompt you to sign in with your Google account to access the Gmail API.
Grant the necessary permissions (read-only access to emails).


Set Up Hugging Face API (Optional for AI Features):

Create a free Hugging Face account at huggingface.co.
Generate an API token and add it to the extension’s settings (see Configuration).



Usage

Open the Extension:

Click the Newsletter Aggregator icon in Chrome’s toolbar to open the popup.
Alternatively, access it via the sidebar in Gmail (if enabled).


Filter Newsletters:

Use dropdowns to filter by date, provider, or status (read/unread/incomplete).
Example: Select “Past 7 days” and “Substack” to view recent Substack newsletters.


Prioritize Providers:

Go to the settings panel and add preferred providers (e.g., “newsletter@substack.com”).
Enable Priority Mode to sort these newsletters at the top.


Read and Track:

Click a newsletter to open it in a new tab.
If you close it mid-read, a prompt will ask to save it as incomplete.
Use the “Bookmark” or “Read Later” buttons to save newsletters.


AI Features (If Configured):

View AI-generated topics and descriptions in the newsletter list.
Click “Summarize” to get a concise overview of the current newsletter.
Use the Q&A panel to ask questions (e.g., “What does this say about blockchain?”).
Search for newsletters by topic via the search bar (e.g., “payment solutions”).



See screenshots for visual examples (coming soon).
Configuration
To enable AI-powered features, configure the Hugging Face API:

Create a .env file in the project root:HUGGING_FACE_API_TOKEN=your-api-token-here


Rebuild the extension:npm run build


Alternatively, enter the API token in the extension’s settings panel after loading it in Chrome.

For Gmail API authentication:

The extension uses OAuth 2.0 via Google’s client library. No manual configuration is needed beyond signing in.

Contributing
We welcome contributions to make Newsletter Aggregator even better! To contribute:

Fork the repository.
Create a new branch (git checkout -b feature/your-feature).
Commit your changes (git commit -m "Add your feature").
Push to the branch (git push origin feature/your-feature).
Open a pull request.

Please read our Contributing Guidelines for details on code style, testing, and issue reporting.
License
This project is licensed under the MIT License. Feel free to use, modify, and distribute it as per the license terms.
Contact

Issues: Report bugs or suggest features on the GitHub Issues page.
Email: Reach out to your-email@example.com for inquiries.
Community: Join our Discord server (coming soon).

Acknowledgments

Inspired by tools like Stoop and Meco, but built for the browser.
Powered by Gmail API and Hugging Face Inference API.
Thanks to the open-source community for tools like React, Vite, and Tailwind CSS.

This project is in active development as an MVP. Expect regular updates and new features. Star the repo to stay updated!
