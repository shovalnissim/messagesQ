const { Router } = require('express');

function setupRoutes(app, channel) {
    const router = Router();

    channel.assertQueue('', { durable: true }); 

    router.post('/:queue_name', async (req, res) => {
        const queueName = req.params.queue_name;
        const message = req.body;

        try {
            await channel.assertQueue(queueName, { durable: true }); // Ensure the queue exists
            await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), { persistent: true });
            res.status(201)
                .send({ message: 'Message added to the queue', queue: queueName, data: message });
        } catch (error) {
            console.error('Error sending message to queue:', error);
            res.status(500)
                .send({ error: 'Internal server error' });
        }
    });

    router.get('/:queue_name', async (req, res) => {
        const queueName = req.params.queue_name; 
        const timeout = parseInt(req.query.timeout) || 10000; // Default 10 seconds

        try {
            const message = await channel.get(queueName);
            if (!message) {
                setTimeout(() => {
                    res.status(204).send();
                }, timeout);
            } else {
                res.status(200)
                    .send(JSON.parse(message.content.toString()));
            }
        } catch (error) {
            console.error('Error getting message from queue:', error);
            res.status(500)
                .send({ error: 'Internal server error' });
        }
    });

    app.use('/api', router);
}

exports.setupRoutes = setupRoutes;