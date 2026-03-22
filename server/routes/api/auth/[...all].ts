import { getAuth } from "@/server/auth"
import { defineEventHandler } from "h3"

export default defineEventHandler(async (event) => {
  const auth = await getAuth()
  return auth.handler(event.req)
})
