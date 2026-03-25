"use server"

import { db } from "@/lib/db"
import { customers, type NewCustomer } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getCustomers() {
  try {
    return await db.query.customers.findMany({
      orderBy: (c, { desc }) => [desc(c.createdAt)],
    })
  } catch (error) {
    console.error("Error fetching customers:", error)
    throw new Error("Kon klanten niet ophalen")
  }
}

export async function getCustomer(id: number) {
  try {
    return await db.query.customers.findFirst({
      where: eq(customers.id, id),
      with: {
        contacts: {
          orderBy: (c, { desc }) => [desc(c.contactDate)],
        },
        quotes: {
          orderBy: (q, { desc }) => [desc(q.createdAt)],
        },
        invoices: {
          orderBy: (i, { desc }) => [desc(i.createdAt)],
        },
      },
    })
  } catch (error) {
    console.error("Error fetching customer:", error)
    throw new Error("Kon klant niet ophalen")
  }
}

export async function createCustomer(data: NewCustomer) {
  try {
    const result = await db.insert(customers).values(data).returning()
    revalidatePath("/customers")
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error creating customer:", error)
    return { success: false, error: "Kon klant niet aanmaken" }
  }
}

export async function updateCustomer(id: number, data: Partial<NewCustomer>) {
  try {
    const result = await db
      .update(customers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning()
    revalidatePath("/customers")
    revalidatePath(`/customers/${id}`)
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error updating customer:", error)
    return { success: false, error: "Kon klant niet bijwerken" }
  }
}

export async function deleteCustomer(id: number) {
  try {
    await db.delete(customers).where(eq(customers.id, id))
    revalidatePath("/customers")
    return { success: true }
  } catch (error) {
    console.error("Error deleting customer:", error)
    return { success: false, error: "Kon klant niet verwijderen" }
  }
}
