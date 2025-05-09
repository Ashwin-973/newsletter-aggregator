import { useState } from "react"
import { Button } from "./ui/button";
import {BadgePlus} from 'lucide-react'
import {BadgeMinus} from 'lucide-react'
const senderArray = [
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
    "\"Wellfound (formerly AngelList Talent)\" <team@hi.wellfound.com>",
    "Google <no-reply@accounts.google.com>",
    "Glassdoor <info@glassdoor.com>",
    "Pinterest <recommendations@explore.pinterest.com>",
    "Glassdoor <noreply@glassdoor.com>",
    "Sean from Meco <team@meco.app>",
    "Letterboxd <robot@letterboxd.com>",
    "Pinterest <pinterest-recommendations@ideas.pinterest.com>",
    "Behance <noreply-behance@behance.com>",
    "Adobe <message@adobe.com>",
    "Backend Weekly <masteringbackend@mail.beehiiv.com>",
    "Meco <no-reply@meco.app>",
    "Canva <marketing@engage.canva.com>",
    "Spline Team <hello@mail.spline.design>",
    "Jovin from Mobbin <jovin@mobbin.com>",
    "Gamma <hello@gamma.app>",
    "Quora Digest <english-personalized-digest@quora.com>",
    "Unstop <noreply@dare2compete.news>",
    "Internshala <student@mail.internshala.com>",
    "Internshala Trainings <trainings@mail.internshala.com>",
    "\"roadmap.sh\" <roadmap@email.roadmap.sh>",
    "Naukri <info@naukri.com>",
    "Unstop Management <noreply@dare2compete.news>",
    "\"Wix.com\" <wix-team@emails.wix.com>",
    "\"Wix.com\" <welcome-to-wix@emails.wix.com>",
    "ISP Team from Internshala <student@mail.internshala.com>",
    "\"The Movie Database (TMDB)\" <no-reply@themoviedb.org>",
    "Product Hunt <hello@team.producthunt.com>",
    "John from Catchpoint <team@catchpoint.com>",
    "Hernan Aracena <aracena@codegpt.dev>",
    "CodeSandbox <hello@codesandbox.io>",
    "Canva Create HQ <canvacreate@engage.canva.com>",
    "Fliki <support@fliki.ai>",
    "GraphHopper Directions API <api-management@graphhopper.com>",
    "ISP team from Internshala <student@mail.internshala.com>",
    "Lucid <email@e.lucid.co>",
    "Eventbrite <noreply@marketing.eventbrite.com>",
    "Catchpoint <team@catchpoint.com>",
    "Lucid <webinars@e.lucid.co>",
    "Scribd <hello@hello.scribd.com>",
    "Unwrap by Unstop <noreply@dare2compete.news>",
    "Gamma <notifications@gamma.app>",
    "registration@tollguru.com",
    "Mappls Console <notifications@mapmyindiamail.com>",
    "Michael Truell <michaelt@cursor.so>",
    "GDG on Campus Solution Challenge <hello@noreply.hack2skill.com>",
    "StreamYard <yourfriends@onair.streamyard.com>",
    "Okta Showcase <showcase@okta.com>",
    "GDG on Campus India <gdgoncampus-india@hack2skill.com>",
    "GDG on Campus India Team <gdgoncampus-india@hack2skill.com>",
    "ScyllaDB <no-reply@events.ringcentral.com>",
    "Clockify <clockify@mail.cake.com>",
    "Zoho Payments Notification <notification@zohostore.in>",
    "Ashtyn Creel from Lucid <acreel@lucidchart.com>"
  ];
export const SelectProviders=()=>
{
    const [selectedProviders,setSelectedProviders]=useState(senderArray)
    //all providers
    //filtered providers (heu)
    //remaining
    function handleAddProvider(){
        
    }
    function handleRemoveProvider(){

    }
    return(
        <div className="min-h-screen flex justify-around items-center">
            <div className="grow-8"></div>
                <div className="max-h-[400px] p-4 bg-gray-200 border-1 border-gray-100 rounded-md flex flex-col items-center gap-2 overflow-y-scroll">
                {selectedProviders.map((provider,idx)=>
                (
                    <div key={idx} className="max-h-[44px] p-2 bg-white font-medium flex gap-2 items-center">
                        <span className="">{provider}</span>   {/* set appropriate line height */}
                        <button className="" onClick={handleAddProvider}>
                            <BadgeMinus color="red"/>
                        </button>
                    </div>

                ))}
                </div>
                <div className="max-h-[400px] p-4 bg-gray-200 border-1 border-gray-100 flex flex-col items-center gap-2 overflow-y-scroll">
                {selectedProviders.map((provider,idx)=>
                (
                    <div key={idx} className="max-h-[44px] p-2 bg-white font-medium flex gap-2 items-center">
                        <span className="">{provider}</span>   {/* set appropriate line height */}
                        <button className="" onClick={handleRemoveProvider}>
                            <BadgePlus color="green"/>
                        </button>
                    </div>

                ))}
                </div>
                <div className="">
                    <Button className="">Save</Button>
                </div>
        </div>
    )
}