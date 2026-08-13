'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";


export default function AccessoAmministrazione(){

const router = useRouter();

const [password,setPassword] = useState("");
const [errore,setErrore] = useState("");


// CAMBIARE QUESTA PASSWORD
const PASSWORD_AMMINISTRATORE = "Calabria2026";


const entra = ()=>{


if(password === PASSWORD_AMMINISTRATORE){

localStorage.setItem(
"accessoAmministrazione",
"true"
);


router.push("/GestionePresenze");


}
else{

setErrore(
"Password errata"
);

}


};



return(

<div className="
min-h-screen
bg-gray-100
flex
items-center
justify-center
p-6
">


<div className="
bg-white
rounded-xl
shadow
p-6
w-full
max-w-md
">


<h1 className="
text-2xl
font-bold
mb-6
text-center
">

🔐 Accesso Amministrazione

</h1>



<input

type="password"

value={password}

onChange={
e=>setPassword(e.target.value)
}

placeholder="Password"

className="
border
rounded
p-3
w-full
mb-4
"

/>



<button

onClick={entra}

className="
bg-blue-600
hover:bg-blue-700
text-white
font-bold
p-3
rounded
w-full
"

>

Accedi

</button>



{
errore && (

<p className="
text-red-600
mt-4
font-bold
text-center
">

{errore}

</p>

)

}



</div>


</div>

);

}