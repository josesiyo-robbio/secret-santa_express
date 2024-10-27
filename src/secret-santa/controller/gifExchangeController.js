


const moduleEXCHANGEGIF = require('../model/giftExchange');



const GiftExchangeController =
{
    create_exchange : async(req,res) =>
    {
        try
        {
            const {name, numberParticipants, minBudget, maxBudget, participants} = req.body;

            if (!Array.isArray(participants) || participants.length === 0) 
            {
                return res.status(400).json({ message: 'Participants must be a non-empty array' });
            }

            const createNew = await moduleEXCHANGEGIF.insert_new_secret_santa(name, numberParticipants, minBudget, maxBudget, participants);

            if(createNew)
            {
                res.status(200).json({createNew});
            }
        }
        catch (error) 
        {
            console.log(error);
            res.status(500).json({ message: 'Error', error: { message: error.message } });
        }
    },



    new_gift_idea : async(req,res) =>
    {
        try
        {
            const {exchangeId,description,price,url,participantEmail} = req.body;
            const newIdeaGift = await moduleEXCHANGEGIF.insert_new_idea_gift(exchangeId,description,price,url,participantEmail);

            if(newIdeaGift)
            {
                res.status(200).json({newIdeaGift});
            }
        }
        catch (error) 
        {
            console.log(error);
            res.status(500).json({ message: 'Error', error: { message: error.message } });
        }
    },


    aprove_idea : async(req,res) =>
    {
        try
        {        
            const {exchangeId,email} =req.body;

            const aproveIdea = await moduleEXCHANGEGIF.update_gift_idea_aprobe(exchangeId,email);

            if(aproveIdea)
            {
                res.status(200).json({aproveIdea});
            }
        }
    
        catch (error) 
        {
            console.log(error);
            res.status(500).json({ message: 'Error', error: { message: error.message } });
        }

    }


}



module.exports =  { GiftExchangeController }