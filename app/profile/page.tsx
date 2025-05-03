'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Order } from '../../types'

// Dummy data for invoices
const dummyInvoices: Order[] = [
  // {
  //   id: '1',
  //   userId: '1',
  //   items: [
  //     { id: '1', name: 'Product 1', price: 19.99, quantity: 2, image: '/placeholder.svg' },
  //     { id: '2', name: 'Product 2', price: 29.99, quantity: 1, image: '/placeholder.svg' },
  //   ],
  //   total: 69.97,
  //   status: 'delivered',
  //   createdAt: new Date('2023-05-01'),
  // },
  // {
  //   id: '2',
  //   userId: '1',
  //   items: [
  //     { id: '3', name: 'Product 3', price: 39.99, quantity: 1, image: '/placeholder.svg' },
  //   ],
  //   total: 39.99,
  //   status: 'processing',
  //   createdAt: new Date('2023-05-15'),
  // },
]

export default function ProfilePage() {
  const [user, setUser] = useState({ name: 'John Doe', email: 'john@example.com' })
  const [invoices, setInvoices] = useState<Order[]>([])

  useEffect(() => {
    // TODO: Fetch actual user data and invoices
    setInvoices(dummyInvoices)
  }, [])

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>
        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Manage your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <strong>Name:</strong> {user.name}
                </div>
                <div>
                  <strong>Email:</strong> {user.email}
                </div>
                <Button>Edit Profile</Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle>Invoices</CardTitle>
                <CardDescription>View your order history</CardDescription>
              </CardHeader>
              <CardContent>
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="mb-6 p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold">Order #{invoice.id}</h3>
                      <span className="text-sm text-gray-500">
                        {invoice.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mb-2">
                      <strong>Status:</strong> {invoice.status}
                    </div>
                    <div className="mb-2">
                      <strong>Items:</strong>
                      <ul className="list-disc list-inside">
                        {invoice.items.map((item) => (
                          <li key={item.id}>
                            {item.name} x {item.quantity} - ${item.price.toFixed(2)}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="text-right">
                      <strong>Total:</strong> ${invoice.total.toFixed(2)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}

