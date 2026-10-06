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

    let html = "";
    let total = 0;
    let cantidadTotal = 0;

    carrito.forEach(p => {

        total += p.precio * p.cant;

        cantidadTotal += p.cant;

        html += `
        <div class="item">

            <span>
                ${p.nombre} 
                $${p.precio}
            </span>

            <span>

                <button onclick="restar('${p.nombre}')">
                    -
                </button>

                ${p.cant}

                <button onclick="agregar('${p.nombre}',${p.precio})">
                    +
                </button>

                <button onclick="quitar('${p.nombre}')">
                    🗑️
                </button>

            </span>

        </div>
        `;
    });


    // Lista de productos
    document.getElementById("carrito").innerHTML =
        html || "Carrito vacío";


    // Total
    document.getElementById("total").innerText =
        total > 0 ? `TOTAL: $${total}` : "";


    // CONTADOR DEL ICONO
    document.getElementById("contadorCarrito").innerText =
        cantidadTotal;

}

function comprar(){

    const hayProductos = carrito.some(p => p.cant > 0);

    if(!hayProductos){

        mostrarMensaje(
            "Carrito vacío",
            "Agrega algún producto antes de realizar tu pedido."
        );

        return;
    }

    const modal = new bootstrap.Modal(
        document.getElementById("modalCompra")
    );

    modal.show();
}

async function confirmarCompra(){

    const nombreInput =
        document.getElementById("nombreCliente");

    const telefonoInput =
        document.getElementById("telefonoCliente");


    const nombre = nombreInput.value.trim();

    const telefono = telefonoInput.value.trim();


    // Quitar estados anteriores

    nombreInput.classList.remove("is-valid", "is-invalid");

    telefonoInput.classList.remove("is-valid", "is-invalid");


    // VALIDAR NOMBRE

    if(!validarNombre(nombre)){

        nombreInput.classList.add("is-invalid");

        nombreInput.focus();

        return;
    }

    nombreInput.classList.add("is-valid");


    // VALIDAR TELÉFONO

    if(!validarTelefono(telefono)){

        telefonoInput.classList.add("is-invalid");

        telefonoInput.focus();

        return;
    }

    telefonoInput.classList.add("is-valid");


    // AQUÍ CONTINÚA TU CÓDIGO DE COMPRA

if(!tel){

    mostrarMensaje(
        "Falta tu WhatsApp",
        "Por favor escribe tu número de WhatsApp para continuar."
    );

    return;
}

    let total = carrito.reduce(
        (s,p) => s + p.precio * p.cant,
        0
    );


    let prod = carrito
        .map(p => `${p.nombre} x${p.cant}`)
        .join(", ");


    await fetch(SUPABASE_URL+"/rest/v1/pedidos",{

        method:"POST",

        headers:{
            "apikey":SUPABASE_KEY,
            "Authorization":"Bearer "+SUPABASE_KEY,
            "Content-Type":"application/json",
            "Prefer":"return=minimal"
        },

        body:JSON.stringify({
            nombre,
            telefono:tel,
            producto:prod,
            total
        })

    });


    let telLimpio = limpiarNumero(tel);


    let paraTi =
`NUEVO PEDIDO
${prod}
Total: $${total}
Cliente: ${nombre}
Tel: ${telLimpio}`;


    window.location.href =
        `https://wa.me/${MI_NUMERO}?text=${encodeURIComponent(paraTi)}`;


    localStorage.removeItem("carrito");

    carrito = [];

    mostrar();
}


function abrirCarrito(){

    document
        .getElementById("panelCarrito")
        .classList.add("abierto");

}


function cerrarCarrito(){

    document
        .getElementById("panelCarrito")
        .classList.remove("abierto");

}


function mostrarMensaje(titulo, mensaje){

    document.getElementById("tituloMensaje").innerText = titulo;

    document.getElementById("textoMensaje").innerText = mensaje;

    const modal = new bootstrap.Modal(
        document.getElementById("modalMensaje")
    );

    modal.show();
}
mostrarMensaje(
    "Carrito vacío",
    "Agrega algún producto antes de realizar tu pedido."
);


function validarNombre(nombre){

    nombre = nombre.trim();

    // Mínimo 3 caracteres
    if(nombre.length < 3){
        return false;
    }

    // Solo letras, espacios, acentos y ñ
    const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/;

    return regex.test(nombre);
}
function validarTelefono(telefono){

    // Elimina espacios, guiones, paréntesis, etc.
    let numero = telefono.replace(/\D/g, "");

    // México: 10 dígitos
    return numero.length === 10;
}