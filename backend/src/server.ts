import app from './app'

const PORT = process.env.PORT ?? 3001

app.listen(PORT, () => {
  console.log(`SF Food Facility API  →  http://localhost:${PORT}`)
  console.log(`Swagger UI            →  http://localhost:${PORT}/api-docs`)
  console.log(`OpenAPI JSON          →  http://localhost:${PORT}/api/openapi.json`)
})
