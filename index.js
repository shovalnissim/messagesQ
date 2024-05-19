const express = require('express');
const routes = require('./routes');
const rabbitmq = require('./rabbit-mq');

const app = express();
const port = 3000;

(async () => {
  try {
    const channel = await rabbitmq.connectToRabbitMQ();

    routes.setupRoutes(app, channel);

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Error starting the server:', error);
  }
})();