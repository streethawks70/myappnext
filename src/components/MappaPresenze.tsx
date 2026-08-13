'use client';

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";


const icona = new L.Icon({

  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",

  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",

  iconSize:[
    25,
    41
  ],

  iconAnchor:[
    12,
    41
  ],

  popupAnchor:[
    1,
    -34
  ]

});


type PresenzaMappa = {

  nome:string;

  stato:string;

  oraFirma:string;

  posizione:string;

  matricolaSquadra:string;

};



export default function MappaPresenze({

  presenze

}:{

  presenze:PresenzaMappa[];

}){


const punti = presenze.filter(

(p)=>

p.posizione &&
p.posizione.includes(",")

);



return(

<>

<div className="
w-full
h-[500px]
rounded-xl
overflow-hidden
border
mt-6
">


<MapContainer

center={[
38.0972,
15.6358
]}

zoom={13}

style={{
height:"100%",
width:"100%"
}}

>


<TileLayer

url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

/>



{

punti.map((p,index)=>{


const coordinate =
p.posizione.split(",").map(Number);



return(


<Marker

key={index}

position={[
coordinate[0],
coordinate[1]
]}

icon={icona}

>


<Popup>


<div>

<b>
👷 {p.nome}
</b>


<br/>


Stato:
{" "}
{p.stato}


<br/>


Ora firma:
{" "}
{p.oraFirma}


<br/>


Squadra:
{" "}
{p.matricolaSquadra}


</div>


</Popup>


</Marker>


);


})

}


</MapContainer>


</div>

</>

);


}