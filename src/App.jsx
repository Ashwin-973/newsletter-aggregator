// import { useAuthState } from "./context/authContext"
import { ReaderView } from "./components/ReaderView"
import { SelectProviders } from "./components/SelectProviders"
import { NewsletterList } from "./components/NewslettersList"
import { SignIn } from "./auth/SignIn"
import { Popup } from "@/components/PopUp"


// const isPopup = chrome.extension && chrome.extension.getViews({ type: 'popup' }).includes(window);
  

function App() {

  return (

    <div className="min-h-screen flex justify-center items-center">
      <Popup/>
    </div>
  )
}

export default App
