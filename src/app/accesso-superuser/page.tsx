'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";


export default function AccessoSuperUser(){


const router = useRouter();


const [password,setPassword] =
useState("");



const entra = ()=>{


if(password === "123456"){


localStorage.clear();

localStorage.setItem(
"ruolo",
"superuser"
);


router.push(
"/dashboard-centrale"
);


}
else{


alert(
"Password errata"
);


}


};



return(

<div className="min-h-screen flex items-center justify-center bg-gray-100">


<div className="bg-white p-6 rounded-xl shadow">


<h1 className="text-xl font-bold mb-4">

🔐 Accesso Super User

</h1>



<input

type="password"

placeholder="Password"

value={password}

onChange={(e)=>
setPassword(e.target.value)
}

className="border p-2 rounded w-full"

/>



<button

onClick={entra}

className="
mt-4
bg-red-600
text-white
px-5
py-2
rounded
"

>

Entra

</button>


</div>


</div>


);


}