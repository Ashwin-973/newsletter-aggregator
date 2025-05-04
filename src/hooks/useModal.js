import { useState } from "react";

const useModal=()=>
{
    const [open,setOpen]=useState(false)

    const openModal=()=>
    {
        return setOpen(true)
    }
    const closeModal=()=>
    {
        return setOpen(false)
    }

    return {open,openModal,closeModal}    //custom hooks return the necessary elements to the hoom itself

}

export {useModal}