"use server"

import { db } from "@/lib/db"
import { customerContacts, type NewCustomerContact } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getContacts() {
  try {
    return await db.query.customerContacts.findMany({
      with: { customer: true },
      orderBy: [desc(customerContacts.contactDate)],
    })
  } catch (error) {
    console.error("Error fetching contacts:", error)
    throw new Error("Kon contactmomenten niet ophalen")
  }
}

export async function getContactsByCustomer(customerId: number) {
  try {
    return await db.query.customerContacts.findMany({
      where: eq(customerContacts.customerId, customerId),
      orderBy: [desc(customerContacts.contactDate)],
    })
  } catch (error) {
    console.error("Error fetching contacts:", error)
    throw new Error("Kon contactmomenten niet ophalen")
  }
}

export async function createContact(data: NewCustomerContact) {
  try {
    const result = await db.insert(customerContacts).values(data).returning()
    revalidatePath("/contacts")
    revalidatePath(`/customers/${data.customerId}`)
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error creating contact:", error)
    return { success: false, error: "Kon contactmoment niet aanmaken" }
  }
}

export async function updateContact(id: number, data: Partial<NewCustomerContact>) {
  try {
    const result = await db
      .update(customerContacts)
      .set(data)
      .where(eq(customerContacts.id, id))
      .returning()
    revalidatePath("/contacts")
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error updating contact:", error)
    return { success: false, error: "Kon contactmoment niet bijwerken" }
  }
}

export async function markFollowUpDone(id: number) {
  try {
    const result = await db
      .update(customerContacts)
      .set({ followUpDone: true })
      .where(eq(customerContacts.id, id))
      .returning()
    revalidatePath("/contacts")
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error updating follow-up:", error)
    return { success: false, error: "Kon follow-up niet bijwerken" }
  }
}

export async function deleteContact(id: number) {
  try {
    await db.delete(customerContacts).where(eq(customerContacts.id, id))
    revalidatePath("/contacts")
    return { success: true }
  } catch (error) {
    console.error("Error deleting contact:", error)
    return { success: false, error: "Kon contactmoment niet verwijderen" }
  }
}
