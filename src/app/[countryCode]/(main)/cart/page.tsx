import { Cart as CartI, LineItem } from "@medusajs/medusa"
import { Metadata } from "next"
import { cookies } from "next/headers"

import CartTemplate from "@modules/cart/templates"

import { getCart, getCustomer } from "@lib/data"
import { getCheckoutStep } from "@lib/util/get-checkout-step"
import { enrichLineItems } from "@modules/cart/actions"
import { CartWithCheckoutStep } from "types/global"

export const metadata: Metadata = {
  title: "Cart",
  description: "View your cart",
}

const fetchCart = async () => {
  const cartId = cookies().get("_medusa_cart_id")?.value

  if (!cartId) {
    return null
  }

  const cart = await getCart(cartId).then(
    (cart: Omit<CartI, "refundable_amount" | "refunded_total"> | null) =>
      cart as CartWithCheckoutStep
  )

  if (!cart) {
    return null
  }

  if (cart?.items.length) {
    const enrichedItems = await enrichLineItems(cart?.items, cart?.region_id)
    cart.items = enrichedItems as LineItem[]
  }

  cart.checkout_step = cart && getCheckoutStep(cart)

  return cart
}

export default async function Cart() {
  const cart = await fetchCart()
  const customer = await getCustomer()

  return <CartTemplate cart={cart} customer={customer} />
}
