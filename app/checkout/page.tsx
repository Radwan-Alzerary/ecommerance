'use client'

import { useState, useEffect } from 'react'
import { useCart } from '../../hooks/useCart'
import { useAuth } from '@/contexts/AuthContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import SignInPrompt from '@/components/SignInPrompt'
import { Loader2 } from 'lucide-react'

type CountryData = {
  country: string
  cities: string[]
}

export default function CheckoutPage() {
  const { cart } = useCart()
  const { user, isAuthenticated, isLoading, error: authError } = useAuth()

  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    address: '',
    city: '',
    country: 'Iraq',
  })

  const [countriesData, setCountriesData] = useState<CountryData[]>([])
  const [citiesList, setCitiesList] = useState<string[]>([])

  // Fetch all countries & cities on mount
  useEffect(() => {
    fetch('https://countriesnow.space/api/v0.1/countries')
      .then((res) => res.json())
      .then((json) => {
        setCountriesData(json.data)
      })
      .catch((err) => {
        console.error('Failed to load country data', err)
      })
  }, [])

  // Whenever countriesData loads or country changes, update citiesList
  useEffect(() => {
    const entry = countriesData.find(
      (c) => c.country === shippingInfo.country
    )
    if (entry) {
      setCitiesList(entry.cities)
    } else {
      setCitiesList([])
    }
  }, [countriesData, shippingInfo.country])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setShippingInfo((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({ shippingInfo, user, cart })
    alert('Order placement logic needs implementation!')
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2">Checking authentication...</span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        {authError && <p className="text-destructive mb-4">Authentication error: {authError}</p>}
        <SignInPrompt />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Shipping Information Form */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                aria-label="Full Name"
                name="name"
                placeholder="Full Name"
                value={shippingInfo.name}
                onChange={handleInputChange}
                required
              />
              <Input
                aria-label="Address"
                name="address"
                placeholder="Street Address"
                value={shippingInfo.address}
                onChange={handleInputChange}
                required
              />

              {/* Country Select */}
              <div>
                <label htmlFor="country" className="block mb-1 font-medium">
                  Country
                </label>
                <select
                  id="country"
                  name="country"
                  value={shippingInfo.country}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option disabled value="">
                    Select country
                  </option>
                  {countriesData.map((c) => (
                    <option key={c.country} value={c.country}>
                      {c.country}
                    </option>
                  ))}
                </select>
              </div>

              {/* City Select */}
              <div>
                <label htmlFor="city" className="block mb-1 font-medium">
                  City
                </label>
                <select
                  id="city"
                  name="city"
                  value={shippingInfo.city}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option disabled value="">
                    Select city
                  </option>
                  {citiesList.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Button type="submit" className="mt-6 w-full md:w-auto">
              Place Order
            </Button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-muted/30 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          {cart.length === 0 ? (
            <p className="text-muted-foreground">Your cart is empty.</p>
          ) : (
            <>
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center mb-3 pb-3 border-b border-border/50 last:border-b-0 last:pb-0 last:mb-0"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <span className="font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="border-t border-border pt-4 mt-4">
                <div className="flex justify-between items-center font-semibold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
