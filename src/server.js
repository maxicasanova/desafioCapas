const express = require('express');
const {Server: IOServer} = require('socket.io');
const rutas = require('./routes/productos.routes');
const app = express();
const path = require('path');
const {engine} = require('express-handlebars');
const normalizeMensajes = require("../utils/normalize");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo") ;
const passport = require('passport');
const config = require("./config");
const cluster = require('cluster');
const os = require('os');
const compression = require("compression");
const {productos, carritos, messages} = require('./models/index.js')

const cpus = os.cpus();
const port = config.port;

const mongoStoreOptions = { useNewUrlParser: true, useUnifiedTopology: true };

if (config.mode === "cluster" && cluster.isPrimary) {
    cpus.map(() => {
        cluster.fork();
    })

    cluster.on("exit", worker => {
        console.log(`Worker ${worker.process.pid} died. A new one is being created.`)
        cluster.fork();
    })
} else {

    app.use(compression())

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

    app.use(cookieParser());

    app.use(
        session({
            store: MongoStore.create({
                mongoUrl:
                    config.mongoconnect,
                mongoStoreOptions,
            }),
            secret: config.sessionsecret,
            resave: true,
            saveUninitialized: true,
            cookie: {
                maxAge: 120000
            },
            rolling: true,
            // saveUninitialized: false,
        })
    )

    app.use(passport.initialize());
    app.use(passport.session());

    function checkAuth(req, res, next){
        if (req.isAuthenticated()) {
            next();
        } else {
            res.redirect('/login')
        }
    }

    app.use(checkAuth);

    app.use(express.static(path.join(__dirname, '..','./public/')));

    app.use('/', rutas);

    app.use((req, res) => {
        res.status(404).send("No pudimos encontrar la dirección");
    });

    app.use((err, req, res) => {
        console.error(err);
        res.status(500).send("Ocurrió un error");
    });

    const PORT = process.env.PORT || port
    const expressServer = app.listen(PORT  , err => {
        if (err) {
            console.log(`Hubo un error al inciar el servidor : ${err}`);
        } else {
            console.log(`Servidor escuchando el puerto: ${PORT}`);
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
}