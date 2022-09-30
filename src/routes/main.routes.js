const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User.js');
const args = require("yargs/yargs")(process.argv.slice(2)).argv;
const logger = require("../logs/logger");
const multer  = require('multer');
const bcrypt = require('bcrypt');
const {transporter, mailOptions} = require('../mailConfig');
const mainRouter = Router();

const upload = multer({ dest: '../../public/uploads' })

function createHash(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10))
}

function isValidPass(reqpass, dbpass) {
    return bcrypt.compareSync(reqpass, dbpass)
}

const singupStrategy = new LocalStrategy(
    {passReqToCallback:true}, 
    async (req, username, password, name, address, age, telephone, done) => {
        try{
            const existingUser = await User.findOne({username})
            if(existingUser){
                return done(null, null)
            }
            const newUser = {
                username, 
                password: createHash(password),
                name, 
                address, 
                age, 
                telephone
            }
            const createdUser = await User.create(newUser);
            mailOptions.html = JSON.stringify({newUser})
            await transporter.sendMail(mailOptions);

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

mainRouter.use((req, res, next)=>{
    logger.info(`New request: ${req.method} - ${req.path}`)
    next()
})

mainRouter.get("/login", (req, res) => {
    res.render('login', {});
})

mainRouter.post(
    "/login", 
    passport.authenticate('login', {failureRedirect:'/faillogin'}) ,
    (req, res) => {
        res.redirect('/')
})

mainRouter.get('/faillogin', (req, res) => {
    res.render('faillogin', {})
})

mainRouter.get("/logged", async (req, res) => {
    if (req.user) {
        const info = await User.findOne({username:req.user.username})
        res.json({user:info.username, admin:info.admin})
        // {user: req.user.username}
    } else {
        res.status(401).json({ status: 401, message: "no credentials" })
    }
})

mainRouter.get("/logout", (req, res) => {
    const nombre = req.user?.username;
    req.logout(function(err) {
        if (err) { return next(err); }
        res.render('logout', {nombre})
    })
})

mainRouter.get('/register', (req, res) => {
    res.render('register', {});
})


mainRouter.post(
    '/register', 
    passport.authenticate('register', {failureRedirect:'/failsignup'}) ,
    upload.single('avatar'),
    (req, res) => {
        res.redirect('/login')
})

mainRouter.get('/failsignup', (req, res) => {
    res.render('failsignup', {})
})


mainRouter.get("/info", (req, res) => {
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

mainRouter.get("/infoconsolelog",(req, res) => {
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


module.exports = mainRouter;