"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { PUT as updateUserProfileApi } from "@/app/api/users/profile/route";

export async function updateUser(formData: any) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    const req = new Request("http://localhost/api/users/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Cookie": token ? `token=${token}` : "",
      },
      body: JSON.stringify(formData),
    });

    const res = await updateUserProfileApi(req);
    const data = await res.json();

    if (!res.ok || !data.success) {
      return { success: false, error: data.error || "Lỗi hệ thống khi cập nhật" };
    }

    revalidatePath('/thanh-vien');
    return { success: true };
  } catch (error) {
    console.error("Update user action error:", error);
    return { success: false, error: "Lỗi hệ thống khi cập nhật" };
  }
}
