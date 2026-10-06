"use server";

import { cookies } from "next/headers";
import { POST as checkoutApi } from "@/app/api/checkout/route";

export async function processCheckout(formData: any, cart: any[]) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    const req = new Request("http://localhost/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": token ? `token=${token}` : "",
      },
      body: JSON.stringify({ formData, cart }),
    });

    const res = await checkoutApi(req);
    const data = await res.json();

    if (!res.ok || !data.success) {
      return { success: false, error: data.error || "Lỗi xử lý đơn hàng" };
    }

    return { success: true, orderId: data.orderId };
  } catch (error) {
    console.error("Checkout action error:", error);
    return { success: false, error: "Lỗi xử lý đơn hàng" };
  }
}
