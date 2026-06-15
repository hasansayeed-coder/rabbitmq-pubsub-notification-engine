require('dotenv').config() ; 
const amqp =  require('amqplib') ; 

const EXCHANGE_NAME = 'notification_exchange' ; 
const QUEUE_NAME = 'sms_queue' ; 

async function startSMSWorker(){

    try{

        const connection = await amqp.connect(process.env.CLOUD_AMQP_URL) ; 
        const channel = await connection.createChannel() ; 

        await channel.assertExchange(EXCHANGE_NAME , 'fanout' , {durable : true}) ; 
        await channel.assertQueue(QUEUE_NAME , {durable : true}) ;

        // Bind this queue to the exact same exchance
        await channel.bindQueue(QUEUE_NAME , EXCHANGE_NAME , '') ; 

        channel.prefetch(1) ; 
        console.log("📱 SMS Worker is listening for events...");

        channel.consume(QUEUE_NAME , (msg) => {

            if(msg !== null){
                const data = JSON.parse(msg.content.toString()) ; 
                console.log(`📱 Firing SMS text alert for event: ${data.action}...`);

                setTimeout(() => {

                    console.log(`SMS dispatch message sent!`) ; 
                    channel.ack(msg) ;
                } , 20000)
            }
        } , {noAck : false})

    }catch(error){
        console.error("Worker Error " , error) ;
    }
}

startSMSWorker() ;