require('dotenv').config() ; 
const amqp = require('amqplib') ; 

const EXCHANGE_NAME = 'notification_exchange' ; 
const QUEUE_NAME = 'email_queue' ; 

async function startEmailWorker(){

    try{

        const connection = await amqp.connect(process.env.CLOUD_AMQP_URL) ; 
        const channel = await connection.createChannel() ;

        await channel.assertExchange(EXCHANGE_NAME , 'fanout' , {durable : true}) ; 
        await channel.assertQueue(QUEUE_NAME , {durable : true})  ;

        // bind  the queue to the exxhance so it receives broadcasted msg   
        await channel.bindQueue(QUEUE_NAME , EXCHANGE_NAME , '') ; 

        channel.prefetch(1);    

        console.log("📨 Email Worker is listening for events...");

        channel.consume(QUEUE_NAME , (msg) => {

            if(msg !== null){
                const data = JSON.parse(msg.content.toString()) ; 
                console.log(`📧 Sending receipt email to ${data.user || 'Customer'}...`);

                setTimeout(() => {
                    console.log(`✅ Email successfully sent!`) ; 
                    channel.ack(msg) ;
                } , 20000)
            }
        } , {noAck : false})
    }catch(error){
        console.error("Worker Error" , error) ;
    }
}

startEmailWorker();