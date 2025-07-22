import React, { useState, useEffect } from 'react'
import { RiStackFill } from "react-icons/ri";

export default function Organizing() {
    return (
        <div className='w-[160px] h-[50px] items-center'>
            <h3 className='text-lg text-white font-semibold mt-5 ml-3 gap-x-2 flex'>Organizing...<RiStackFill className='text-orange-600 mt-2' /></h3>
        </div>
    );
}