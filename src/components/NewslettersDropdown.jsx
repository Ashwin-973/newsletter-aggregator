import { useId } from "react"

import { Label } from "@/components/ui/label"
import MultipleSelector from "@/components/ui/multiselect";

const newslettes=[
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

export function NewslettersDropdown() {
  const id = useId()
  return (
    <div className="*:not-first:mt-2">
      {/* <Label>Multiselect</Label> */}
      <MultipleSelector
        commandProps={{
          label: "Select frameworks",
        }}
        value={newslettes.slice(0, 2)}
        defaultOptions={newslettes}
        placeholder="Select frameworks"
        hideClearAllButton
        hidePlaceholderWhenSelected
        emptyIndicator={<p className="text-center text-sm">No results found</p>} />
    </div>
  );
}
