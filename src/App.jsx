import { OnboardingProvider } from "./context/OnBoardingContext"
import { SettingsProvider } from "./context/SettingsContext"
import { Popup } from "@/components/PopUp"

  

function App() {

  return (
    <OnboardingProvider>
      <SettingsProvider>
          <Popup/>
      </SettingsProvider>
    </OnboardingProvider>
  )
}

export default App
