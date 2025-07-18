// import { useAuthState } from "@/context/authContext"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"



export const SignIn=({handleAuthClick,isLoading})=>
{
    return (
        <div className="p-10 min-h-screen flex justify-center items-center">
            <Button onClick={handleAuthClick}  className="bg-[var(--primary-500)] hover:bg-[var(--primary-600)]">
                {isLoading?<Loader2 className="animate-spin"/>:'Sign In with Google'}
            </Button>
        </div>
    )
}