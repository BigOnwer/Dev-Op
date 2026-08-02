import fastify from 'fastify'
import { AuthRoute } from './routes/auth.js'
import cookie from "@fastify/cookie"
import jwt from "@fastify/jwt"
import { ProjectRoute } from './routes/project.js'
import { ProfileRoute } from './routes/profile.js'
import { env } from './config/env.js'
import { CorsConfig, RateRequestLimit, registerSecurity } from './plugins/security.js'

const server = fastify()

await registerSecurity(server)
await RateRequestLimit(server)
await CorsConfig(server)

await server.register(cookie)
await server.register(jwt, {
  secret: env.JWT_SECRET,
  cookie: {
    cookieName: "token",
    signed: false
  }
})

server.register(AuthRoute)
server.register(ProfileRoute)
server.register(ProjectRoute)

server.listen({ port: env.PORT }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})