import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import facilitiesRouter from './routes/facilities'
import { swaggerSpec } from './lib/swagger'

const app = express()

app.use(cors())
app.use(express.json())

// API routes
app.use('/api/facilities', facilitiesRouter)

// Swagger UI + raw spec
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.get('/api/openapi.json', (_req, res) => res.json(swaggerSpec))

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }))

// Root → redirect to interactive API docs
app.get('/', (_req, res) => res.redirect('/api-docs'))

export default app
