"use server"

import { db } from "@/lib/db"
import { companyProfile, type NewCompanyProfile } from "@/lib/db/schema"
import { revalidatePath } from "next/cache"

export async function getCompanyProfile() {
  try {
    const result = await db.query.companyProfile.findFirst()
    return result || null
  } catch (error) {
    console.error("Error fetching company profile:", error)
    return null
  }
}

export async function upsertCompanyProfile(data: Partial<NewCompanyProfile>) {
  try {
    const existing = await db.query.companyProfile.findFirst()
    if (existing) {
      const result = await db
        .update(companyProfile)
        .set({ ...data, updatedAt: new Date() })
        .returning()
      revalidatePath("/settings")
      return { success: true, data: result[0] }
    } else {
      const result = await db
        .insert(companyProfile)
        .values({ name: "AI-Group.nl", ...data })
        .returning()
      revalidatePath("/settings")
      return { success: true, data: result[0] }
    }
  } catch (error) {
    console.error("Error upserting company profile:", error)
    return { success: false, error: "Kon bedrijfsprofiel niet opslaan" }
  }
}
