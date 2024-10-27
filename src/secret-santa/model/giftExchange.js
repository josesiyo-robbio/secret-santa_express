


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
  validateGifts : {type: Number, default : 0},
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



const GiftExchange = 
{
  insert_new_secret_santa: async (name, numberParticipants, minBudget, maxBudget, participants) => {
    try 
    {
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
        assignments 
      });

      await newExchange.save();
      return newExchange;
    } 
    catch (error) 
    {
      console.error('Error inserting new Secret Santa:', error);
      throw new Error('Error creating new Secret Santa exchange');
    }
  },


  insert_new_idea_gift: async (exchangeId, description, price, url, participantEmail) => 
    {
    try 
    {
      const exchange = await Exchange.findOne({ _id: exchangeId });
  
      if (!exchange) 
      {
        throw new Error('Exchange Not Found');
      }

      const participant = exchange.participants.find(member => member.email === participantEmail);
      if (!participant) 
      {
        throw new Error('Participant Not Found in this Exchange');
      }
  
      let newGiftIdea;
  
      const existingGiftIdeaIndex = exchange.giftIdeas.findIndex(idea =>
        idea.participant.email === participantEmail
      );
  
      if (existingGiftIdeaIndex !== -1) 
      {
        const existingGiftIdea = exchange.giftIdeas[existingGiftIdeaIndex];
        if (existingGiftIdea.approved) 
        {
          throw new Error('El participante ya tiene una idea de regalo aprobada en este intercambio');
        } 
        else 
        {
          newGiftIdea = {
            description,
            price,
            url,
            participant: {
              name: participant.name,
              email: participant.email
            }
          };
          exchange.giftIdeas[existingGiftIdeaIndex] = newGiftIdea; // Actualizar la existente
        }
      } 
      else 
      {
        newGiftIdea = {
          description,
          price,
          url,
          participant: {
            name: participant.name,
            email: participant.email
          }
        };
        exchange.giftIdeas.push(newGiftIdea);
      }
  
      await exchange.save();

      return newGiftIdea;
    } 
    catch (error) 
    {
      console.error('Error inserting new idea:', error);
      throw new Error('Error creating new idea');
    }
  },



  update_gift_idea_aprobe : async(exchangeId,email) =>
  {
    try
    {
      //search exchange by ID
      const exchange = await Exchange.findOne({_id : exchangeId});

      if(!exchange)
      {
        throw new Error('Exchange Not Found');
      }

      //find the idea from participant by email
      const giftIdeaIndex = exchange.giftIdeas.findIndex( idea => idea.participant.email === email);
      if(giftIdeaIndex === -1)
      {
        throw new Error('Gift Idea Not Found for this Participant');
      }

      //acept gift idea
      exchange.giftIdeas[giftIdeaIndex].approved = true;

      //save changes
      await exchange.save();

      return exchange.giftIdeas[giftIdeaIndex];

    }
    catch (error) 
    {
      console.error('Error approving gift idea:', error);
      throw new Error('Error approving gift idea');
    }
  },


  update_return_gift: async (exchangeId, email, idGiftReturned, idGiftTaken) => {
    try {
      // Buscar el intercambio
      const exchange = await Exchange.findOne({ _id: exchangeId });
      if (!exchange) {
        throw new Error('Exchange Not Found');
      }
  
      // Validar el participante por email
      const participant = exchange.participants.find(member => member.email === email);
      if (!participant) {
        throw new Error('Participant Not Found in this Exchange');
      }
  
      // Buscar el regalo que se va a devolver en giftIdeas
      const returnedGiftIndex = exchange.giftIdeas.findIndex(gift => gift._id.toString() === idGiftReturned);
      if (returnedGiftIndex === -1) {
        throw new Error('Returned Gift Not Found in gift ideas');
      }
  
      // Obtener el regalo devuelto
      const returnedGift = exchange.giftIdeas[returnedGiftIndex];
  
      // Si no hay regalos en la lista devuelta, solo agrega el regalo devuelto
      if (exchange.returnedGifts.length === 0) {
        exchange.returnedGifts.push({
          _id: returnedGift._id, // ID del regalo que se deja
          originalRecipient: email, // Email del que devuelve el regalo
          description: returnedGift.description,
        });
        // Guardar los cambios y devolver el mensaje
        await exchange.save();
        return { message: 'No se rtu regalo, se dejó en la mesa. Espera a tomar otro.' };
      } else {
        // Verificar si el regalo que se va a tomar existe en los regalos devueltos
        const takenGiftIndex = exchange.returnedGifts.findIndex(gift => gift._id.toString() === idGiftTaken);
        if (takenGiftIndex === -1) {
          throw new Error('Taken Gift Not Found in returned gifts');
        }
  
        // Obtener el regalo tomado
        const takenGift = exchange.returnedGifts[takenGiftIndex];
  
        // Eliminar el regalo tomado de la lista de regalos devueltos
        exchange.returnedGifts.splice(takenGiftIndex, 1); // Eliminar el regalo tomado
  
        // Agregar el regalo devuelto a la lista de regalos devueltos
        exchange.returnedGifts.push({
          _id: returnedGift._id, // ID del regalo que se deja
          originalRecipient: email, // Email del que devuelve el regalo
          description: returnedGift.description,
        });
      }
  
      // Guardar los cambios
      await exchange.save();
      return { message: 'Gift returned successfully' };
  
    } catch (error) {
      console.error('Error updating return gift:', error);
      throw new Error('Error updating return gift');
    }
  }
  
  
  
  

}





function generateAssignments(participants) 
{
  const availableParticipants = [...participants];
  const assignments = [];

  if (participants.length % 2 !== 0) 
    {
    const randomIndex = Math.floor(Math.random() * participants.length);
    const luckyParticipant = participants[randomIndex];

    // Asignar el regalo adicional al participante seleccionado
    assignments.push({ sender: luckyParticipant.email, recipient: luckyParticipant.email }); 
  }

  for (let i = 0; i < participants.length; i++) 
    {
    let recipient;
    do {
      recipient = availableParticipants[Math.floor(Math.random() * availableParticipants.length)];
    } 
    while (recipient.email === participants[i].email);

    assignments.push({ sender: participants[i].email, recipient: recipient.email });
    availableParticipants.splice(availableParticipants.indexOf(recipient), 1);
  }

  return assignments;
}



module.exports = GiftExchange; 
