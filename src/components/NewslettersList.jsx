
const newsletterContent = [
  {
    sender: 'walterwhite@heisenberg.com',
    label: 'I am the one who knocks',
  },
  {
    sender: 'don.draper@sterlingcooper.com',
    label: 'Make it simple, but significant.',
  },
  {
    sender: 'lizlemon@tgs.nbc',
    label: 'I want to go to there.',
  },
  {
    sender: 'tonysoprano@bada.bing',
    label: 'Those who want respect, give respect.',
  },
  {
    sender: 'michaelscott@dundermifflin.com',
    label: 'That\'s what she said!',
  },
  {
    sender: 'sherlock@221bbaker.st',
    label: 'The game is afoot.',
  },
  {
    sender: 'daenerys@dragonstone.westeros',
    label: 'I will take what is mine.',
  },
  {
    sender: 'aragorn@gondor.me',
    label: 'For Frodo.',
  },
  {
    sender: 'vito.corleone@ghf.ny',
    label: 'An offer you can\'t refuse.',
  },
  {
    sender: 'juleswinnfield@bmf.wallet',
    label: 'Say what again!',
  },
  {
    sender: 'ellen.ripley@weyland-yutani.corp',
    label: 'Get away from her, you bitch!',
  },
  {
    sender: 'thebride@houseofblueleaves.jp',
    label: 'Wiggle your big toe.',
  },
  {
    sender: 'hannibal@lecter.fbi',
    label: 'Having an old friend for dinner.',
  },
  {
    sender: 'bruce.wayne@wayne.gotham', // Superhero (scarce)
    label: 'I am vengeance.',
  },
  {
    sender: 'indy@archaeology.edu',
    label: 'It belongs in a museum!',
  },
];
export const NewsletterList=()=>
{
    return(
        <div className="max-h-[400px] max-w-full p-4 rounded-md bg-slate-200 flex flex-col items-center gap-4 overflow-y-scroll">
            {newsletterContent.map((letter,idx)=>
            (
                <div key={idx} className="bg-white p-2 rounded-md border-1 border-slate-300 flex flex-col justify-center gap-2 min-w-[560px] max-w-full max-h[44px] text-left">
                    <h2 className="font-bold text-xl">Subject : {letter.label}</h2>
                    <span className="text-base">Sent By : {letter.sender}</span>
                </div>

            ))}
        </div>
    )
}