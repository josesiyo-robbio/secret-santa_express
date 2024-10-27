


const moduleEXCHANGEGIF = require('../model/giftExchange');
const moduleVALIDATORAPI    = require('../middleware/validatorApi');
const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "conor.weber85@ethereal.email", 
    pass: "j4NpEz9NqGPESNPY8P" 
  }
});



const GiftExchangeController =
{
    create_exchange : async(req,res) =>
    {
        try
        {
            const requiredFields = ['name', 'numberParticipants', 'minBudget', 'maxBudget', 'participants'];
            const {name, numberParticipants, minBudget, maxBudget, participants} = req.body;

            const validation = moduleVALIDATORAPI.validateRequiredFields(req.body, requiredFields);
            if (!validation.success) 
                {
                    res.status(400).json({ message: validation.message, missingFields: validation.missingFields });
                    return; 
                }

            if (!Array.isArray(participants) || participants.length === 0) 
            {
                return res.status(400).json({ message: 'Participants must be a non-empty array' });
            }

            const createNew = await moduleEXCHANGEGIF.insert_new_secret_santa(name, numberParticipants, minBudget, maxBudget, participants);

            if (createNew) 
            {
                participants.forEach(participant => {
                    const mailOptions = {
                        from: '"Secret Santa" <santa@ethereal.email>',
                        to: participant.email,
                        subject: 'Welcome to the Secret Santa Exchange!',
                        text: `Hello ${participant.name}!\n\nYou've been added to the "${name}" Secret Santa Exchange.\nExchange ID: ${createNew._id}\nGet ready to share some holiday cheer!`,
                        html: `<p>Hello ${participant.name}!</p><p>You've been added to the "<strong>${name}</strong>" Secret Santa Exchange.</p><p>Exchange ID: <strong>${createNew._id}</strong></p><p>Get ready to share some holiday cheer!</p>`
                    };

                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) 
                        {
                            console.log(`Error sending email to ${participant.email}:`, error);
                        } 
                        else 
                        {
                            console.log(`Email sent to ${participant.email}:`, info.response);
                        }
                    });
                });
                res.status(200).json({ createNew });
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
            const requiredFields = ['exchangeId','description','price','url','participantEmail'];
            const {exchangeId,description,price,url,participantEmail} = req.body;

            const validation = moduleVALIDATORAPI.validateRequiredFields(req.body, requiredFields);
            if (!validation.success) 
            {
                res.status(400).json({ message: validation.message, missingFields: validation.missingFields });
                return;
            }

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
            const requiredFields = ['exchangeId','email'];
            const {exchangeId,email} =req.body;

            const validation = moduleVALIDATORAPI.validateRequiredFields(req.body, requiredFields);
            if (!validation.success) 
            {
                res.status(400).json({ message: validation.message, missingFields: validation.missingFields });
                return; 
            }

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
    },



    return_gift_sad : async(req,res) =>
    {
        try
        {
            const requiredFields = ['exchangeId', 'email', 'idGiftReturned', 'idGiftTaken'];
            const {exchangeId, email, idGiftReturned, idGiftTaken} = req.body;

            const validation = moduleVALIDATORAPI.validateRequiredFields(req.body, requiredFields);
            if (!validation.success) 
            {
                res.status(400).json({ message: validation.message, missingFields: validation.missingFields });
                return; // Detener la ejecución si hay campos faltantes
            }

            const returnsGift = await moduleEXCHANGEGIF.update_return_gift(exchangeId, email, idGiftReturned, idGiftTaken);
            if(returnsGift)
            {
                res.status(200).json({returnsGift});
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