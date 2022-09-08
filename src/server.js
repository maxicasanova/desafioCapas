const express = require('express');
const {Server: IOServer} = require('socket.io');
const rutas = require('./routes/index');
const app = express();
const path = require('path');
const {engine} = require('express-handlebars');
const Contenedor = require('./contenedor');
const ContenedorMongo = require('./contenedorMongo');
const normalizeMensajes = require("../utils/normalize");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo") ;
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('./models/User.js');
const config = require("./config");
const args = require("yargs/yargs")(process.argv.slice(2)).argv;
const cluster = require('cluster');
const os = require('os');
const compression = require("compression");
const logger = require("./logs/logger")

const cpus = os.cpus();
const port = config.port;

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

function createHash(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10))
}

function isValidPass(reqpass, dbpass) {
    return bcrypt.compareSync(reqpass, dbpass)
}

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
            secret: "coderhouse",
            cookie: {
                httpOnly: false,
                secure: false,
                maxAge: 20000,
            },
            rolling: true,
            resave: false,
            saveUninitialized: false,
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

    const singupStrategy = new LocalStrategy(
        {passReqToCallback:true}, 
        async (req, username, password, done) => {
            try{
                const existingUser = await User.findOne({username})
                if(existingUser){
                    return done(null, null)
                }
                const newUser = {
                    username, 
                    password: createHash(password)
                }
                const createdUser = await User.create(newUser);
                return done(null, createdUser)
            } catch (err){
                console.log(err)
                done('error en registro', null)
            }

    })

    const loginStrategy = new LocalStrategy(
        async (username, password, done) => {
            try {
                const user = await User.findOne({username});

                if(!user || !isValidPass(password,user.password)){
                    return done(null, null);
                }

                done(null, user);

            } catch (err) {
                console.log(err)
                done('error en acceso', null)
            }
        }
    )

    passport.use('register', singupStrategy);
    passport.use('login', loginStrategy);
    passport.serializeUser((user, done) => {
        done(null, user._id)
    })
    passport.deserializeUser((id, done) => {
        User.findById(id, done)
    })

    app.use((req, res, next)=>{
        logger.info(`New request: ${req.method} - ${req.path}`)
        next()
    })

    app.get("/login", (req, res) => {
        res.render('login', {});
    })

    app.post(
        "/login", 
        passport.authenticate('login', {failureRedirect:'/faillogin'}) ,
        (req, res) => {
            res.redirect('/')
    })

    app.get('/faillogin', (req, res) => {
        res.render('faillogin', {})
    })

    app.get("/logged", (req, res) => {
        if (req.user) {
            res.json({user: req.user.username})
        } else {
            res.status(401).json({ status: 401, message: "no credentials" })
        }
    })

    app.get("/logout", (req, res) => {
        const nombre = req.user?.username;
        req.logout(function(err) {
            if (err) { return next(err); }
            res.render('logout', {nombre})
        })
    })

    app.get('/register', (req, res) => {
        res.render('register', {});
    })


    app.post(
        '/register', 
        passport.authenticate('register', {failureRedirect:'/failsignup'}) ,
        (req, res) => {
            res.redirect('/login')
    })

    app.get('/failsignup', (req, res) => {
        res.render('failsignup', {})
    })

    app.use(checkAuth);

    app.get("/info", (req, res) => {
        const platform = process.platform;
        const version = process.version;
        const memory = process.memoryUsage();
        const path = process.execPath;
        const pid = process.pid;
        const folder = process.cwd();
        
        const objetoInfo = {
            args,
            platform,
            version,
            memory,
            path,
            pid,
            folder
        }

        res.json(objetoInfo);
    });

    app.get("/infoconsolelog",(req, res) => {
        const platform = process.platform;
        const version = process.version;
        const memory = process.memoryUsage();
        const path = process.execPath;
        const pid = process.pid;
        const folder = process.cwd();
        const cpus = os.cpus().length;
        
        const objetoInfo = {
            args,
            platform,
            version,
            memory,
            path,
            pid,
            folder,
            cpus
        }
        console.log(objetoInfo)
        res.json(objetoInfo);
    })

    app.use(express.static(path.join(__dirname, '..','./public/')));

    app.use('/api', rutas);

    app.use((req, res) => {
        res.status(404).send("No pudimos encontrar la dirección");
    });

    app.use((err, req, res) => {
        console.error(err);
        res.status(500).send("Ocurrió un error");
    });

    const expressServer = app.listen(port, err => {
        if (err) {
            console.log(`Hubo un error al inciar el servidor : ${err}`);
        } else {
            console.log(`Servidor escuchando el puerto: ${port}`);
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