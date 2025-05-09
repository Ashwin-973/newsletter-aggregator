import { useState, useMemo } from "react"
import { Button } from "./ui/button";
import { BadgePlus } from 'lucide-react'
import { BadgeMinus } from 'lucide-react'
import { X } from "lucide-react";

// All providers - would come from props in real implementation
const allProvidersArray = [
  "The New Stack <tns@thenewstack.io>",
  "Team Unstop <noreply@dare2compete.news>",
  "\"Heikki @ Neon\" <feedback@neon.tech>",
  "\"Eric at Bolt.new\" <ericsimons@stackblitz.com>",
  "Internshala <student@updates.internshala.com>",
  "Pinterest <recommendations@discover.pinterest.com>",
  "Oracle Talent Acquisition <ota@career.oracle.com>",
  "Internshala Trainings <trainings@updates.internshala.com>",
  "Glassdoor Jobs <noreply@glassdoor.com>",
  "Motiff <service@service.motiff.com>",
  "GDG on Campus Solution Challenge <admin@no-reply.hack2skill.com>",
  "Spline Tutorials <hello@mail.spline.design>",
  "Adobe Creative Cloud <mail@email.adobe.com>",
  "Mobbin <newsletter@mobbin.com>",
  "Pinterest <recommendations@inspire.pinterest.com>",
  "Oracle Talent Acquisition <noreply@oracle.com>",
  "Letterboxd <news@letterboxd.com>",
  "Changelog News <news@changelog.com>",
];

// Initial filtered providers from heuristics - in real code would come from props
const initialFiltered = [
  "The New Stack <tns@thenewstack.io>",
  "\"Heikki @ Neon\" <feedback@neon.tech>",
  "\"Eric at Bolt.new\" <ericsimons@stackblitz.com>",
  "Mobbin <newsletter@mobbin.com>",
  "Changelog News <news@changelog.com>",
];

export const SelectProviders = () => {
  // State for selected/filtered providers
  const [selectedProviders, setSelectedProviders] = useState(initialFiltered);
  
  // Calculate remaining providers using useMemo for performance
  const remainingProviders = useMemo(() => {
    return allProvidersArray.filter(
      provider => !selectedProviders.includes(provider)
    );
  }, [selectedProviders]);

  // Handle adding a provider from remaining to selected
  function handleAddProvider(providerToAdd) {
    setSelectedProviders(prev => [...prev, providerToAdd]);
  }

  // Handle removing a provider from selected to remaining
  function handleRemoveProvider(providerToRemove) {
    setSelectedProviders(prev => 
      prev.filter(provider => provider !== providerToRemove)
    );
  }

  // Close the overlay - would need to be connected to parent component
  function handleClose() {
    // In real implementation: setIsOpen(false) or similar
    console.log("Close overlay");
  }

  // Save selected providers - would need to be connected to parent component
  function handleSave() {
    // In real implementation: save to parent state or API
    console.log("Save providers:", selectedProviders);
    handleClose();
  }

  return (
    // Overlay container
    <div className="fixed inset-0 bg-black/80  flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-4/5 max-w-7xl relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Manage Newsletter Providers</h2>
          <button 
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />  {/*disable this during the first time */}
          </button>
        </div>

        {/* Lists container */}
        <div className="flex flex-col md:flex-row gap-4 ">
          {/* Selected providers */}
          <div className="flex-1 max-w-1/2">
            <h3 className="font-medium mb-2">Selected Providers</h3>
            <div className="max-h-96 p-4 bg-gray-200 border-1 border-gray-100 rounded-md flex flex-col items-center gap-2 overflow-y-auto">
              {selectedProviders.length === 0 ? (
                <div className="text-gray-500 italic p-4">No providers selected</div>
              ) : (
                selectedProviders.map((provider, idx) => (
                  <div key={`selected-${idx}`} className="w-full max-h-44 p-2 bg-white font-medium flex justify-between items-center rounded shadow-sm">
                    <span className="truncate mr-2">{provider}</span>
                    <button 
                      className="flex-shrink-0" 
                      onClick={() => handleRemoveProvider(provider)}
                      title="Remove from selected"
                    >
                      <BadgeMinus color="red" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Available providers */}
          <div className="flex-1 max-w-1/2">
            <h3 className="font-medium mb-2">Available Providers</h3>
            <div className="max-h-96 p-4 bg-gray-200 border-1 border-gray-100 rounded-md flex flex-col items-center gap-2 overflow-y-auto">
              {remainingProviders.length === 0 ? (
                <div className="text-gray-500 italic p-4">All providers selected</div>
              ) : (
                remainingProviders.map((provider, idx) => (
                  <div key={`remaining-${idx}`} className="w-full max-h-44 p-2 bg-white font-medium flex justify-between items-center rounded shadow-sm">
                    <span className="truncate mr-2">{provider}</span>
                    <button 
                      className="flex-shrink-0" 
                      onClick={() => handleAddProvider(provider)}
                      title="Add to selected"
                    >
                      <BadgePlus color="green" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={handleClose}
            className="px-4"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="px-4"
          >
            Save Changes
          </Button>
        </div>
      </div>
     </div>
  )
}