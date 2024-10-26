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
  active: { type: Boolean, default: true } // Campo para indicar si el intercambio está activo
});

const Exchange = mongoose.model('Exchange', exchangeSchema);

const GifExchange = {
  insert_new_secret_santa: async (name, numberParticipants, minBudget, maxBudget, participants) => {
    try {
      const exchangeId = uuidv4();

      // Genera asignaciones
      const assignments = generateAssignments(participants);

      const newExchange = new Exchange({
        _id: exchangeId,
        name,
        numberParticipants,
        minBudget,
        maxBudget,
        participants,
        assignments // Agrega las asignaciones generadas al nuevo intercambio
      });

      await newExchange.save();
      return newExchange;
    } catch (error) {
      console.error('Error inserting new Secret Santa:', error);
      throw new Error('Error creating new Secret Santa exchange');
    }
  }
};



function generateAssignments(participants) {
  const availableParticipants = [...participants];
  const assignments = [];

  if (participants.length % 2 !== 0) {
    const randomIndex = Math.floor(Math.random() * participants.length);
    const luckyParticipant = participants[randomIndex];

    // Asignar el regalo adicional al participante seleccionado
    assignments.push({ sender: luckyParticipant.email, recipient: luckyParticipant.email }); 
  }

  for (let i = 0; i < participants.length; i++) {
    let recipient;
    do {
      recipient = availableParticipants[Math.floor(Math.random() * availableParticipants.length)];
    } while (recipient.email === participants[i].email);

    assignments.push({ sender: participants[i].email, recipient: recipient.email });
    availableParticipants.splice(availableParticipants.indexOf(recipient), 1);
  }

  return assignments;
}
module.exports = GifExchange; 
