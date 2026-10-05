const SUPABASE_URL="https://gxlozbgxnskokxmidusa.supabase.co";
const SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bG96Ymd4bnNrb2t4bWlkdXNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExNTI5NzksImV4cCI6MjEwNjcyODk3OX0.Re2eMTSx-4iUP6iZGkoaP6kDuZh3Ur3cDClfSfdtqc0"; 
const MI_NUMERO="521556436020";
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
 let nombre=prompt("Tu nombre?"); let tel=prompt("Tu WhatsApp?");
 let total=carrito.reduce((s,p)=>s+p.precio*p.cant,0);
 let prod=carrito.map(p=>`${p.nombre} x${p.cant}`).join(", ");

 const res = await fetch(SUPABASE_URL+"/rest/v1/pedidos",{
  method:"POST",
  headers:{
    "apikey":SUPABASE_KEY,
    "Authorization":"Bearer "+SUPABASE_KEY,
    "Content-Type":"application/json",
    "Prefer": "return=minimal"
  },
  body:JSON.stringify({nombre,telefono:tel,producto:prod,total})
});
if(!res.ok){
  const txt = await res.text();
  console.log(txt);
  return alert("Error Supabase: "+txt);
}
 let paraTi=`NUEVO PEDIDO%0A${prod}%0ATotal: $${total}%0ACliente: ${nombre}%0ATel: ${tel}`;
 let paraCliente=`Hola ${nombre}! Pedido recibido: ${prod} Total $${total}.`;
 window.open(`https://wa.me/${MI_NUMERO}?text=${paraTi}`,"_blank");
 setTimeout(()=>window.open(`https://wa.me/${tel}?text=${encodeURIComponent(paraCliente)}`,"_blank"),1000);
 localStorage.removeItem("carrito"); carrito=[]; mostrar();
}
mostrar();