const express = require('express');
const {Server: IOServer} = require('socket.io');
const rutas = require('./routes/index');
const app = express();
const puerto = 8080;
const path = require('path');
const {engine} = require('express-handlebars');
const Contenedor = require('./contenedor');
const ContenedorMongo = require('./contenedorMongo');
const normalizeMensajes = require("../utils/normalize");

const config1 = {
    client: 'mysql',
    connection: {
        host : '127.0.0.1',
        port : 3306,
        user : 'root',
        password : '',
        database : 'desafiocoder'
    }
};

const productos = new Contenedor(config1, 'productos');
const messages = new ContenedorMongo('mensajes', {
    author: {
        id: { type: String, required: true },
        nombre: { type: String, required: true },
        apellido: { type: String, required: true },
        edad: { type: Number, required: true },
        alias: { type: String, required: true },
        avatar: { type: String, required: true }
    },
    text: { type: String, required: true }
});


app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, './views'));

app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: path.join(__dirname, './views/layout/main.hbs'),
    layoutsDir: path.join(__dirname,'views/layout'),
    partialDir: path.join(__dirname, './views/partials')
}));

app.use(express.static(path.join(__dirname, '..','./public/')));

app.use('/api', rutas);

app.use((req, res) => {
    res.status(404).send("No pudimos encontrar la dirección");
});

app.use((err, req, res) => {
    console.error(err);
    res.status(500).send("Ocurrió un error");
});

const expressServer = app.listen(puerto, err => {
    if (err) {
        console.log(`Hubo un error al inciar el servidor : ${err}`);
    } else {
        console.log(`Servidor escuchando el puerto: ${puerto}`);
    };
});

const io = new IOServer(expressServer);

io.on('connection', async socket => {
    console.log('se conecto un usuario', socket.id);

    const messagesArray = await messages.getAll();
    const normalizedMensajes = normalizeMensajes(messagesArray);
    const productsArray = await productos.getAll();

    socket.emit('server:messages', normalizedMensajes);
    socket.emit('server:products', productsArray);

    socket.on('client:message', async messageInfo => {
        await messages.save(messageInfo);

        const messagesArray = await messages.getAll();
        const normalizedMensajes = normalizeMensajes(messagesArray);

        io.emit('server:messages', normalizedMensajes);
    })

    socket.on('client:product', async productInfo => {
        await productos.save(productInfo);
        const productsArray = await productos.getAll();
        io.emit('server:products', productsArray);
    })
})