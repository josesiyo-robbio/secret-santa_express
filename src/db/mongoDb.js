const mongoose = require('mongoose');

const uri = 'mongodb://admin:sasha88@localhost:27017/secret-santa?authSource=admin';


const connectDB = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Conectado a MongoDB');
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error);
    process.exit(1);
  }
};


module.exports = connectDB;
