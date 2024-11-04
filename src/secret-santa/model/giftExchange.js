


const { v4: uuidv4 } = require('uuid');
const Exchange = require('../query/scheme');



const GiftExchange = 
{
  insert_new_secret_santa: async (name, numberParticipants, minBudget, maxBudget, participants) => {
    try 
    {
      const exchangeId = uuidv4();

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
      return('Error creating new Secret Santa exchange');
    }
  },



  insert_new_idea_gift: async (exchangeId, description, price, url, participantEmail) => 
  {
    try 
    {
      const exchange = await Exchange.findOne({ _id: exchangeId });
  
      if (!exchange) 
      {
        return('Exchange Not Found');
      }

      const participant = exchange.participants.find(member => member.email === participantEmail);
      if (!participant) 
      {
        return('Participant Not Found in this Exchange');
      }
  
      let newGiftIdea;
  
      const existingGiftIdeaIndex = exchange.giftIdeas.findIndex(idea => idea.participant.email === participantEmail );
  
      if (existingGiftIdeaIndex !== -1) 
      {
        const existingGiftIdea = exchange.giftIdeas[existingGiftIdeaIndex];
        if (existingGiftIdea.approved) 
        {
          return('El participante ya tiene una idea de regalo aprobada en este intercambio');
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
          exchange.giftIdeas[existingGiftIdeaIndex] = newGiftIdea;
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
      return('Error creating new idea');
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
        return('Exchange Not Found');
      }

      //find the idea from participant by email
      const giftIdeaIndex = exchange.giftIdeas.findIndex( idea => idea.participant.email === email);
      if(giftIdeaIndex === -1)
      {
        return('Gift Idea Not Found for this Participant');
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
      return('Error approving gift idea');
    }
  },



  update_return_gift: async (exchangeId, email, idGiftReturned, idGiftTaken) => 
  {
    try 
    {
      // Find exchange
      const exchange = await Exchange.findOne({ _id: exchangeId });
      if (!exchange) {
        return('Exchange Not Found');
      }
  
      // Find member 
      const participant = exchange.participants.find(member => member.email === email);
      if (!participant) {
        return('Participant Not Found in this Exchange');
      }
  
      // Find the gift to be returned in Gift Ideas
      const returnedGiftIndex = exchange.giftIdeas.findIndex(gift => gift._id.toString() === idGiftReturned);
      if (returnedGiftIndex === -1) {
        return('Returned Gift Not Found in gift ideas');
      }
  
      // Get gift 
      const returnedGift = exchange.giftIdeas[returnedGiftIndex];
  
      // If there are no gifts on the returned list, just add the returned gift
      if (exchange.returnedGifts.length === 0) 
      {
        exchange.returnedGifts.push({
          _id: returnedGift._id, 
          originalRecipient: email, 
          description: returnedGift.description,
        });

        // Save changes and return the message
        await exchange.save();
        return { message: 'Your gift was left on the table. Wait to take another.' };
      } 
      else 
      {
        // Check if the gift to be taken exists in the returned gifts
        const takenGiftIndex = exchange.returnedGifts.findIndex(gift => gift._id.toString() === idGiftTaken);
        if (takenGiftIndex === -1) 
        {
          return('Taken Gift Not Found in returned gifts');
        }
  
        // get taking gifft
        const takenGift = exchange.returnedGifts[takenGiftIndex];
  
        // Remove the gift taken from the list of returned gifts
        exchange.returnedGifts.splice(takenGiftIndex, 1); 
  
        // Add the returned gift to the returned gifts list
        exchange.returnedGifts.push({
          _id: returnedGift._id,
          originalRecipient: email, 
          description: returnedGift.description,
        });
      }
  
      //saving changes
      await exchange.save();
      return { message: 'Gift returned successfully' };
  
    } 
    catch (error) 
    {
      console.error('Error updating return gift:', error);
      return('Error updating return gift');
    }
  }
  
}





/*
  Generates gift assignments for a Secret Santa exchange.
  Each participant is assigned a recipient, ensuring that no one is assigned to themselves.
  If the number of participants is odd, one participant is randomly assigned to give a gift to themselves.
*/
function generateAssignments(participants) 
{
  const availableParticipants = [...participants];
  const assignments = [];

  if (participants.length % 2 !== 0) 
    {
    const randomIndex = Math.floor(Math.random() * participants.length);
    const luckyParticipant = participants[randomIndex];

    // Assign the additional gift to the selected participant
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
