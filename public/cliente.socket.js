const socket = io();
const messageForm = document.querySelector('#messageForm');
const userNameInput = document.querySelector('#userNameInput');
const messageInput = document.querySelector('#messageInput');
const messagesPool = document.querySelector('#messagesPool');
const formularioProd = document.querySelector('#formularioProd');
const prodTitle = document.querySelector('#prodTitle');
const prodPrice = document.querySelector('#prodPrice');
const prodImage = document.querySelector('#prodImage');
const productsPool = document.querySelector('#productsPool');
const randomColor = '#'+Math.floor(Math.random()*16777215).toString(16);

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

    const response = await fetch('./templates/messages.hbs');
    const content = await response.text();
    let template = Handlebars.compile(content);
    const html = template({messagesArray});
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
    if(userNameInput.value&&messageInput.value){
        const date = new Date();
        const minutos = date.getMinutes()<10 ? `0${date.getMinutes()}` : date.getMinutes()
        const fechaYHora = `${date.getDate()}/${date.getMonth()+1} a las ${date.getHours()}:${minutos}`;
        const messageInfo = {username: userNameInput.value, message: messageInput.value, fechaYHora, color:randomColor}
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