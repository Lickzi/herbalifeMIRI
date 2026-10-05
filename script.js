const SUPABASE_URL="https://gxlozbgxnskokxmidusa.supabase.co";
const SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bG96Ymd4bnNrb2t4bWlkdXNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExNTI5NzksImV4cCI6MjEwNjcyODk3OX0.Re2eMTSx-4iUP6iZGkoaP6kDuZh3Ur3cDClfSfdtqc0";

// FUNCION PARA LIMPIAR NUMEROS DE MEXICO
function limpiarNumero(num){
  let n = num.replace(/\D/g,''); // quita espacios, +, -
  if(n.startsWith('521')) n = '52' + n.substring(3); // quita el 1 que causa "numero no encontrado"
  if(n.length == 10) n = '52' + n; // si ponen 5512345678 lo convierte a 525512345678
  if(n.startsWith('52') && n.length == 13) n = '52' + n.substring(3); // por si ponen 521 de nuevo
  return n;
}

const MI_NUMERO=limpiarNumero("5215564355876"); // quedará como 52556436020
let carrito = JSON.parse(localStorage.getItem("carrito")||"[]");

function agregar(nombre,precio){
 let e=carrito.find(p=>p.nombre==nombre);
 if(e) e.cant++; else carrito.push({nombre,precio,cant:1});
 guardar();
}
function restar(nombre){
 let e=carrito.find(p=>p.nombre==nombre);
 if(e){ e.cant--; if(e.cant<=0) carrito=carrito.filter(p=>p.nombre!=nombre); }
 guardar();
}
function quitar(nombre){
 carrito=carrito.filter(p=>p.nombre!=nombre);
 guardar();
}
function guardar(){
 localStorage.setItem("carrito",JSON.stringify(carrito));
 mostrar();
}
function mostrar(){
 let html=""; let total=0;
 carrito.forEach(p=>{
  total+=p.precio*p.cant;
  html+=`<div class="item"><span>${p.nombre} $${p.precio}</span><span><button onclick="restar('${p.nombre}')">-</button> ${p.cant} <button onclick="agregar('${p.nombre}',${p.precio})">+</button> <button onclick="quitar('${p.nombre}')">🗑️</button></span></div>`;
 });
 document.getElementById("carrito").innerHTML= html || "Carrito vacío";
 document.getElementById("total").innerText= total>0 ? `TOTAL: $${total}` : "";
}

async function comprar(){
 if(carrito.length==0) return alert("Carrito vacío");
 let nombre=prompt("Tu nombre?"); 
 let tel=prompt("Tu WhatsApp? ej 55 1234 5678");
 if(!nombre || !tel) return;
 let total=carrito.reduce((s,p)=>s+p.precio*p.cant,0);
 let prod=carrito.map(p=>`${p.nombre} x${p.cant}`).join(", ");
 
 await fetch(SUPABASE_URL+"/rest/v1/pedidos",{
   method:"POST",
   headers:{
     "apikey":SUPABASE_KEY,
     "Authorization":"Bearer "+SUPABASE_KEY,
     "Content-Type":"application/json",
     "Prefer":"return=minimal"
   },
   body:JSON.stringify({nombre,telefono:tel,producto:prod,total})
 });

 let telLimpio = limpiarNumero(tel);
 let paraTi=`NUEVO PEDIDO\n${prod}\nTotal: $${total}\nCliente: ${nombre}\nTel: ${telLimpio}`;
 
 window.location.href = `https://wa.me/${MI_NUMERO}?text=${encodeURIComponent(paraTi)}`;

 localStorage.removeItem("carrito"); carrito=[]; mostrar();
}
mostrar();