require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/db/mongoDb'); 

//------------------ROUTES IMPORTS---------------------------------------------------|
const routesGifs = require('./src/secret-santa/routes/gifExchangeRoutes');

//---------------------Cors Config & Other Stuff-------------------------------------|

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = { origin: 'http://localhost:8080' };
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//---------------------Cors Config & Other Stuff-------------------------------------|

// Conectar a la base de datos y luego iniciar el servidor
connectDB().then(() => {
    //-----------APIs SECTION-------------------------------------------------------------|
    app.use('/api', routesGifs);

    //--------------------SERVER SECTION-------------------------------|
    app.use((err, req, res, next) => {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    });

    // Se inicia el servidor
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1); // Termina el proceso si la conexión falla
});
