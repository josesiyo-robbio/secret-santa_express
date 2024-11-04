


const moduleEXCHANGEGIF     =   require('../model/giftExchange');
const moduleVALIDATORAPI    =   require('../middleware/validatorApi');
const nodemailer            =   require("nodemailer");



/*
    Since only one email is sent throughout the entire project process, a separate service isn't created for this.
    Increasing the project’s modularity for such a minor task is unnecessary.
*/
const transporter = nodemailer.createTransport({
    host    : process.env.HOST_MAIL,
    port    : 587,
    auth    : {
    user    : process.env.MAIL_ACCOUNT, 
    pass    : process.env.MAIL_PASSWORD
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



    new_gift_idea: async (req, res) => 
    {
        const { exchangeId, description, price, url, participantEmail } = req.body;
        
        const requiredFields = ['exchangeId', 'description', 'price', 'url', 'participantEmail'];
        const validation = moduleVALIDATORAPI.validateRequiredFields(req.body, requiredFields);
        if (!validation.success) 
        {
            return res.status(400).json({ message: validation.message,missingFields: validation.missingFields });
        }
    
        try 
        {
            const newIdeaGift = await moduleEXCHANGEGIF.insert_new_idea_gift(exchangeId, description, price, url, participantEmail);
    
            if (!newIdeaGift) 
            {
                return res.status(404).json({ message: 'Gift idea could not be created. Please check your input.', });
            }

            res.status(201).json({ newIdeaGift });
    
        } 
        catch (error) 
        {
            console.error('Error creating gift idea:', error);
            res.status(500).json({ message: 'An error occurred while creating the gift idea.', error: { message: error.message } });
        }
    },



    aprove_idea: async (req, res) => 
    {
        const { exchangeId, email } = req.body;

        const requiredFields = ['exchangeId', 'email'];
        const validation = moduleVALIDATORAPI.validateRequiredFields(req.body, requiredFields);
        if (!validation.success) 
        {
            return res.status(400).json({ message: validation.message, missingFields: validation.missingFields });
        }

        try 
        {
            const aproveIdea = await moduleEXCHANGEGIF.update_gift_idea_aprobe(exchangeId, email);
    
            if (!aproveIdea) 
            {
                return res.status(404).json({ message: 'Gift idea not found or could not be approved.' });
            }
    
            res.status(200).json({ message: 'Gift idea approved successfully.', aproveIdea });
        } 
        catch (error) 
        {
            console.error('Error approving gift idea:', error);
            res.status(500).json({ message: 'An error occurred while approving the gift idea.', error: { message: error.message } });
        }
    },



    return_gift_sad : async(req,res) =>
    {
        const {exchangeId, email, idGiftReturned, idGiftTaken} = req.body;

        const requiredFields = ['exchangeId', 'email', 'idGiftReturned', 'idGiftTaken'];
        const validation = moduleVALIDATORAPI.validateRequiredFields(req.body, requiredFields);
        if (!validation.success) 
        {
            res.status(400).json({ message: validation.message, missingFields: validation.missingFields });
            return; 
        }

        try
        {
            const returnsGift = await moduleEXCHANGEGIF.update_return_gift(exchangeId, email, idGiftReturned, idGiftTaken);
            if(returnsGift)
            {
                res.status(200).json({returnsGift});
            }
        }
        catch (error) 
        {
            console.log(error);
            res.status(500).json({ message: 'An error occurred while returning the gift.', error: { message: error.message } });
        }
    }


}



module.exports =  { GiftExchangeController }