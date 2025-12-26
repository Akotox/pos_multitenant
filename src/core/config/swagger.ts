import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Multi-Tenant POS API',
            version: '1.0.0',
            description: 'API documentation for the Multi-Tenant Point of Sale System. \n\nFeatures:\n- Multi-tenancy via `tenantId`\n- JWT Authentication & RBAC\n- Inventory, Sales, Customers, and Reports modules',
            contact: {
                name: 'API Support',
            },
        },
        servers: [
            {
                url: 'http://localhost:3000/api/v1',
                description: 'Local Development Server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/modules/**/*.routes.ts', './src/modules/**/*.model.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
