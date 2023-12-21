const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const expressLayouts = require('express-ejs-layouts');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const visitorRoutes = require('./routes/visitorRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const messageRoutes = require('./routes/messageRoutes');
const commentRoutes = require('./routes/commentRoutes');
const passwordRoutes = require('./routes/passwordRoutes');
const partnerMessageRoutes = require('./routes/partnerMessageRoutes');
const cookieParser = require('cookie-parser');

const {seedPermissions, seedPermissionsAndRole, seedSuperAdminUser} = require('./seeders/permissionSeeder');

const { requireAuth, checkUser } = require('./middleware/authMiddleware');
const { checkApiKey } = require('./middleware/apiMiddleware');
const { checkRole } = require('./middleware/roleMiddleware');

const path = require('path');
const homeRoutes = require('./routes/homeRoutes');
const User = require('./models/User');

const session = require('express-session');
const flash = require('connect-flash');

const port = 3001;


const fileupload = require("express-fileupload");

const app = express();

// Specify allowed origins
// const whiteList = ['http://localhost:3000'];
// const corsOptions = {
//     origin: (origin, callback) => {
//         if(!origin || whiteList.indexOf(origin) !== -1) {
//             callback(null, true);
//         }else{
//             callback(new Error("Not allowed"));
//         }
//     },
//     optionsSuccessStatus: 200,
// };

app.use(cors()); // to use the whiteList specify the CorsOptions inside cors()


// middleware
app.use(express.static('public'));
// app.use('/users', express.static('public'));
// app.use('/users', express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

app.use(fileupload());

app.use(session({
    secret: 'somesecret',
    cookie: {maxAge: 60000},
    resave: false,
    saveUninitialized: false
}));

app.use(flash());

// view engine
app.use(expressLayouts);
app.set('view engine', 'ejs');

app.use(function(req, res, next){
    res.locals.message = req.flash();
    next();
});

// database connection
const dbURI = process.env.DATABASE_URL;
mongoose.connect(dbURI, { useNewURLParser: true, useUnifiedTopology: true })
    .then((result) => app.listen(process.env.PORT || port, ()=> console.log(`Listening on port ${port}`)))
    .catch((err) => console.log(err));
    
    
// Applying this middlewear to every get request
// app.get('*', checkUser);
app.use(checkUser);

// Middleware to log the base URL
// app.use((req, res, next) => {
//     // Assuming you have user permissions stored in the session
//     const userPermissions = req.session.permissions || [];
//     const userPerms = res.locals.permissions
//     console.log(userPermissions);

//     const splitedOriginalUrl = `/${req.originalUrl.split("/")[1]}`;

//     console.log('Splited: ', splitedOriginalUrl);
//     console.log('Base URL:', req.baseUrl);
//     console.log('Original URL:', req.originalUrl);
//     console.log('Path:', req.path);
//     console.log('Hostname:', req.hostname);
//     console.log('Protocol:', req.protocol);
//     console.log('Params:', req.params); // If you have route parameters
//     console.log('========================='); // If you have route parameters
  
//     if (userPermissions.includes(req.originalUrl)) {
//       next();
//     } else {
//     //   return res.status(403).json({ error: 'Not authorized to access this resource' });
//         res.render('404', { layout: false });
//     }
// });

app.use((req, res, next) => {
    // Assuming you have user permissions stored in the session
    const userPermissions = req.session.permissions || [];

    console.log("Coming from session: ", userPermissions);

    // Define an array of routes that should be excluded from the middleware
    const excludedRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/', '/api' , '/uploads'];

    // Construct the split URL using pathname
    const splitedOriginalUrl = `/${req.originalUrl.split("/")[1]}`;

    console.log('Splited: ', splitedOriginalUrl);

    // Check if the requested URL is in the excludedRoutes array
    if (excludedRoutes.includes(splitedOriginalUrl)) {
        return next(); // Continue to the next middleware or route
    }

    if (userPermissions.includes(splitedOriginalUrl)) {
        return next(); // Continue to the next middleware or route
    } else {
        // If the user doesn't have permission, render a 403 page
        return res.status(403).render('404', { layout: false });
    }
});

app.use('/api', checkApiKey);
// Apply the middleware to the authRoutes
authRoutes.use(requireAuth);

//routes
// app.get('/', (req, res) => res.render('home', req.flash('message')));
app.get('/dashboard', requireAuth, (req, res) => res.render('dashboard'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(authRoutes);
app.use(userRoutes);
app.use(homeRoutes);
app.use(passwordRoutes);

app.use('/api', postRoutes);
app.use('/api', visitorRoutes);
app.use('/api', messageRoutes);
app.use('/api', commentRoutes);
app.use('/api', testimonialRoutes);
app.use('/api', feedbackRoutes);
app.use('/api', partnerMessageRoutes);

// cookies

app.get('/set-cookies', (req, res) => {
    res.cookie('newUser', false, {maxAge : 1000 *60 *60 });
    
    res.send('you got the cookies!');
});

app.get('/read-cookies', (req, res) => {
    const cookies = req.cookies;
    console.log(cookies.newUser);
    res.json(cookies);
});

// Assuming you are calling these functions in some script or entry point
async function seedDatabase() {
    try {
      await seedPermissions();  // Wait for seedPermissions to complete
      await seedPermissionsAndRole();  // Wait for seedPermissionsAndRole to complete
      await seedSuperAdminUser();
      console.log('Seeding completed successfully.');
    } catch (error) {
      console.error('Error seeding database:', error);
    }
}

// Call the function to start the seeding process
// seedDatabase(); //<============================== INCOMMENT THIS TO SEED DATABASE