require('dotenv').config() ; 
const express = require('express') ; 
const amqp = require('amqplib') ; 

const app = express() ;
app.use(express.json()) ; 

const EXCHANGE_NAME = 'notification_exchange' ; 

let channel ;

async function connectRabbitMQ(){

    try{
        
        const connection = await amqp.connect(process.env.CLOUD_AMQP_URL);
        channel = await connection.createChannel() ;

        // Assert an exchance  instead of a queue, type is 'fanout'
        await channel.assertExchange(EXCHANGE_NAME , 'fanout' , {durable : true}) ; 
        console.log("⚡ Connected to Fanout Exchange successfully");
    }catch(error){
        console.error("❌ Failed to connect", error) ; 
    }
}

connectRabbitMQ() ;

app.post('/event' , async(req , res) => {
    const eventData = req.body ; 

    try{
        //we publish to the exchance. The second argument (routing key) is empty '' for fanout
        channel.publish(EXCHANGE_NAME, '' , Buffer.from(JSON.stringify(eventData)) , {persistent : true})  ;

        return res.status(202).json({message : 'Event broadcasted successfully!'})
    }catch(error){
        return res.status(500).json({
            error : 'Failed to broadcast event'
        })
    }
});

app.listen(3000 , () => console.log("🚀 Notification API running on port 3000")) ;