const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "EcoRide API",
      version: "1.0.0",
      description: "Backend API documentation for the EcoRide Smart Carpool & Daily Commute Platform",
    },
    servers: [
  {
    url: "https://ecoride-backend-mdlg.onrender.com",
    description: "Production server",
  },
  {
    url: "http://localhost:5000",
    description: "Local development server",
  },
],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;