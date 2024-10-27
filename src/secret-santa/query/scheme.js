


const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');


const exchangeSchema = new mongoose.Schema({
    _id: { type: String, default: uuidv4 }, // Usar UUID como _id
    name: { type: String, required: true },
    numberParticipants: { type: Number, required: true },
    minBudget: { type: Number, required: true },
    maxBudget: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    participants: [{ name: String, email: String, exchangeId: String }],
    assignments: [{ sender: String, recipient: String }],
    active: { type: Boolean, default: true },
    validateGifts: { type: Number, default: 0 },
    returnedGifts: [{ // Nuevo array para los regalos devueltos
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, // ID único del regalo devuelto
        originalRecipient: { type: String, required: true }, // Email del destinatario original del regalo
        description: { type: String, required: true }, // Descripción del regalo
        // Puedes agregar más campos si lo necesitas, como la fecha de devolución o el motivo
    }],
    giftIdeas: [{ // Nueva colección anidada para las ideas de regalo
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        url: { type: String, required: true },
        approved: { type: Boolean, required: true, default: false },
        participant: {
            name: { type: String, required: true },
            email: { type: String, required: true }
        }
    }]
});
const Exchange = mongoose.model('Exchange', exchangeSchema);


module.exports = Exchange;