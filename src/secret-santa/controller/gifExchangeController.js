
const moduleEXCHANGEGIF = require('../model/gifExchange');



const GifExchangeController =
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
    }

}



module.exports =  { GifExchangeController }