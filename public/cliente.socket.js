const socket = io();
const messageForm = document.querySelector('#messageForm');
const userMailInput = document.querySelector('#userMailInput');
const userNameInput = document.querySelector('#userNameInput');
const userLastNameInput = document.querySelector('#userLastNameInput');
const userAgeInput = document.querySelector('#userAgeInput');
const userAliasInput = document.querySelector('#userAliasInput');
const userAvatarInput = document.querySelector('#userAvatarInput');
const messageInput = document.querySelector('#messageInput');
const messagesPool = document.querySelector('#messagesPool');
const formularioProd = document.querySelector('#formularioProd');
const prodTitle = document.querySelector('#prodTitle');
const prodPrice = document.querySelector('#prodPrice');
const prodImage = document.querySelector('#prodImage');
const productsPool = document.querySelector('#productsPool');
const greeting = document.querySelector('#greeting');
const formProduct = document.querySelector('#formProduct');
let activeUser = '';
let admin = false;


fetch('/logged').then(res => {
    return res.json()
}).then(res => {
    activeUser = res.user;
    admin = res.admin;
    greeting.innerHTML = `<div><h1>Bienvenido ${res.user}</h1><a href="/logout">Logout</a></div><a href="/api/carrito">Ir al carrito</a>`;
    if (!admin) {
        formProduct.style.visibility='hidden';
    }
    userMailInput.innerHTML = res.user;
})

function denormalizeMensajes(objMensajes) {
    const author = new normalizr.schema.Entity(
        "author"
    );

    const mensaje = new normalizr.schema.Entity(
        "mensaje",
        { author: author },
        { idAttribute: "_id" }
    );

    const schemaMensajes = new normalizr.schema.Entity(
        "mensajes",
        {
        mensajes: [mensaje],
        }
    );

    const denormalized = normalizr.denormalize(
        objMensajes.result,
        schemaMensajes,
        objMensajes.entities
    );


    const logitudNormalized = JSON.stringify(objMensajes).length;
    const longitudDenormalized = JSON.stringify(denormalized).length;
    const porcentajeOptimizacion = (1 - (logitudNormalized / longitudDenormalized)).toFixed(2);

    const mensajesDenormalizados = denormalized.mensajes.map(mensaje => mensaje._doc)

    return { mensajesDenormalizados, porcentajeOptimizacion };
}

function sendMessage(messageInfo) {
    socket.emit('client:message', messageInfo)
}

function sendProduct(productInfo){
    socket.emit('client:product', productInfo)
}

function clearMessage(){
    messageInput.value = '';
}

function clearProduct(){
    prodTitle.value = '';
    prodPrice.value = ''; 
    prodImage.value = '';
}

async function renderMessages(messagesArray){;
    console.log(messagesArray);
    const mensajesDenormalizados = denormalizeMensajes(messagesArray).mensajesDenormalizados;
    const porcentajeOptimizacion = denormalizeMensajes(messagesArray).porcentajeOptimizacion;
    console.log(mensajesDenormalizados, porcentajeOptimizacion);
    const response = await fetch('./templates/messages.hbs');
    const content = await response.text();
    let template = Handlebars.compile(content);
    const html = template({mensajesDenormalizados});
    messagesPool.innerHTML = html;
}

async function renderProducts(productsArray){;
    const response = await fetch('./templates/products.hbs');
    const content = await response.text();
    let template = Handlebars.compile(content);
    const html = template({productsArray});
    productsPool.innerHTML = html;
}

messageForm.addEventListener('submit', e => {
    e.preventDefault();
    if(messageInput.value){
        const messageInfo = {
            author: {
                id: activeUser,
                nombre: "nombreDefault",
                apellido: "apellidoDefault",
                edad: 99,
                alias: "aliasDefault",
                avatar: "avatarDefault"
            },
            text: messageInput.value
        }
        sendMessage(messageInfo);
        clearMessage();
    }
})

formularioProd.addEventListener('submit', e => {
    e.preventDefault();
    if(prodTitle.value&&prodPrice.value&&prodImage){
        const productInfo = {title:prodTitle.value, price:prodPrice.value, thumbnail:prodImage.value};
        sendProduct(productInfo);
        clearProduct();
    }
})

socket.on('server:messages', renderMessages);
socket.on('server:products', renderProducts);