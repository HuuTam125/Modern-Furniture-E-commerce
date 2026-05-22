import prisma from '@/lib/prisma'
import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  // Webhook verify
  let evt
  try {
    evt = await verifyWebhook(req)
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error verifying webhook', { status: 400 })
  }
  const eventType = evt.type
  // Creating User
  try {
    if (eventType === 'user.created') {
      await prisma.user.create({
        data: {
          clerkId: evt.data.id,
          email: evt.data.email_addresses[0].email_address,
          name: `${evt.data.first_name ?? ''} ${evt.data.last_name ?? ''}`,
          imageUrl: evt.data.image_url,
        },
      })
    }
    return new Response('OK', { status: 200 })
  } catch (err) {
    console.error('Error Creating User:', err)
    return new Response('Error Creating User', { status: 400 })
  }
}
