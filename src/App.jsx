import { useAuthState } from "./context/authContext"
import { ReaderView } from "./components/ReaderView"
import { SelectProviders } from "./components/SelectProviders"
import { NewsletterList } from "./components/NewslettersList"
import { SignIn } from "./auth/SignIn"
import { Popup } from "@/components/PopUp"

function App() {
  const {isAuthorize}=useAuthState()
  return (

    <div className="min-h-screen flex justify-center items-center">
        {/* {isAuthorize?<ReaderView/>:<SignIn/>} */}
        {isAuthorize?<NewsletterList/>:<SignIn/>}
    </div>
  )
}

export default App
