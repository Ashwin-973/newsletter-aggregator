import { useId,useEffect,useState } from "react"

import { Label } from "@/components/ui/label"
import MultipleSelector from "@/components/ui/multiselect";






/*ADD TYPE GUARD FUNCTION FOR PROVIDERS */




export function NewslettersDropdown({onChange,providers=[],value}) {
  const id = useId()
  const [processedProviders, setProcessedProviders] = useState([]);

  useEffect(() => {
    if (!Array.isArray(providers)) {
      console.warn('Providers is not an array:', providers);
      setProcessedProviders([]);
      return;
    }
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

    // Ensure we always have the "All" option
    const normalized = [
      { value: 'all', label: 'All' },
      ...providers.filter(p => p.value !== 'all').map(provider => ({
        value: provider.value,
        label: provider.label?.trim() || provider.value
      }))
    ].filter(p => p.value && p.label);

    setProcessedProviders(cleanLabels(normalized));
  }, [providers]);

  return (
    <div className="*:not-first:mt-2">
      <MultipleSelector
        onChange={onChange}
        commandProps={{
          label: "Select Newsletters",
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
