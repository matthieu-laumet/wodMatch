require('dotenv').config();
const express = require("express");
const app = express();
let session = require('express-session');
app.set('trust proxy', 1);
const bodyParser = require('body-parser');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const cookieParser = require('cookie-parser');
const credentials = require('./middleware/credentials');

const http = require('http');
const server = http.createServer(app);
const apiKeyMiddleware = require('./middleware/apiKeyForNoOriginReq');

app.use(credentials);
app.use(cors(corsOptions))  // pour bloquer les requetes CORS
app.use(apiKeyMiddleware)   // pour permettre les Requetes sans origin de provenant de ios / android de passer
  
app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  unset: 'destroy',
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'None',
    httpOnly: true
  }
}));


app.use('/api/images', require('./src/routes/imagesRoutes'));
app.use('/api/funReps', require('./src/routes/funRepsRoutes'));
app.use('/api/skills', require('./src/routes/skillsRoutes'));

app.get('/api', (req, res) => {
  res.sendStatus(200);  // Renvoie uniquement le statut 200
});


server.listen(process.env.PORT || 5001, () => {
  console.log(`serveur has started on port ${process.env.PORT}`)
})

module.exports = app;