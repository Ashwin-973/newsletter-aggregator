import { useId,useEffect,useState } from "react"

import { Label } from "@/components/ui/label"
import MultipleSelector from "@/components/ui/multiselect";



const newsletters=[
  {
    value:"all",
    label:"All"
  },
  {
    value: "bytebytego",
    label: "ByteByteGo",
  },
  {
    value: "instabyte",
    label: "Instabyte",
  },
  {
    value: "backendweekly",
    label: "Backend Weekly",
  },
  {
    value: "superhuman",
    label: "Superhuman",
  },
  {
    value: "sunrisestat",
    label: "Sunrise Stat",
  },
  {
    value: "theaireport",
    label: "The AI report",
  },
  {
    value: "promptsdaily",
    label: "Prompts Daily",
  },
  {
    // Note: Removed the description part for cleaner label/value
    value: "adamwathantailwind",
    label: "Adam Wathan @tailwind",
  },
  {
    value: "httpster",
    label: "Httpster",
  },
  {
    value: "webtoolsweekly",
    label: "WebToolsWeekly",
  },
  {
    value: "changelognightly", // Removed '+'
    label: "Changelog + Nightly",
  },
  {
    value: "devdaily", // Removed '.'
    label: "Dev.daily",
  },
  {
    value: "mediumdailydigest",
    label: "Medium Daily digest",
  },
  {
    value: "kevinpowell",
    label: "Kevin Powell",
  },
  {
    value: "horizonai",
    label: "Horizon AI",
  },
  {
    value: "alexkantrowitz",
    label: "Alex Kantrowitz",
  },
  {
    value: "romanlbinder",
    label: "Roman L Binder",
  },
  {
    value: "techcrunch",
    label: "Tech Crunch",
  },
  {
    value: "pragmaticengineer",
    label: "Pragmatic Engineer",
  },
  {
    value: "thenewstack",
    label: "The New Stack",
  },
  {
    value: "nicenews",
    label: "Nice News",
  },
  {
    value: "moviebrief",
    label: "Movie Brief",
  },
  {
    value: "raremints",
    label: "RareMints",
  },
  {
    value: "dailydev",
    label: "Daily dev",
  },
  {
    // Note: Removed the description part for cleaner label/value
    value: "carthustleweekly",
    label: "Carthustle weekly",
  }
]
const Providers=[{value: 'all', label: 'All'}, //this mock data when passed directly works well 
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

function cleanLabels(dataArray) {
  return dataArray.map(item => {
    if (typeof item?.label === 'string') {
      // Use replace() with a regex to remove leading/trailing double quotes
      // The regex /^"|"$/g matches " at the start (^) or at the end ($) of the string.
      return { ...item, label: item.label.replace(/^"|"$/g, '') };
    }
    return item; // Return item as is if label is not a string
  });
}

// Type guard function
 /* const normalizeProviders = (data) => {
    if (!data) return [];
    if (typeof data === 'string') return [];
    return Array.isArray(data) ? data : [];
  };*/




export function NewslettersDropdown({onChange,providers=[],value}) {
  const id = useId()
  const [processedProviders, setProcessedProviders] = useState([]);

  useEffect(() => {
    if (!Array.isArray(providers)) {
      console.warn('Providers is not an array:', providers);
      setProcessedProviders([]);
      return;
    }

    // Ensure we always have the "All" option
    const normalized = [
      { value: 'all', label: 'All' },
      ...providers.filter(p => p.value !== 'all').map(provider => ({
        value: provider.value,
        label: provider.label?.trim() || provider.value
      }))
    ].filter(p => p.value && p.label);

    console.log('Normalized providers:', normalized);
    setProcessedProviders(normalized);
  }, [providers]);

  console.log("Providers in dropdown : ",processedProviders)
  console.log(typeof processedProviders)
  console.log("entered newsletter dropdowm")
  return (
    <div className="*:not-first:mt-2">
      <MultipleSelector
        onChange={onChange}
        commandProps={{
          label: "Select frameworks",
        }}
        value={value}
        options={processedProviders} 
        defaultOptions={processedProviders}
        placeholder="Select Newsletters"
        hideClearAllButton
        hidePlaceholderWhenSelected
        emptyIndicator={<p className="text-center text-sm">
            {!processedProviders.length ? "Loading..." : "No results found"}
          </p>} />
    </div>
  );
}
