"use server";

import { revalidatePath } from "next/cache";
import { PATCH as updateOrderStatusApi, DELETE as deleteOrderApi } from "@/app/api/orders/[id]/route";

export async function updateOrderStatus(ma_dh: number, status: number) {
  try {
    const req = new Request(`http://localhost/api/orders/${ma_dh}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const res = await updateOrderStatusApi(req, { params: Promise.resolve({ id: ma_dh.toString() }) });
    const data = await res.json();

    if (!res.ok || !data.success) {
      return { success: false, error: data.error || "Lỗi khi cập nhật trạng thái đơn hàng" };
    }

    revalidatePath('/quan-tri/don-hang');
    revalidatePath(`/quan-tri/don-hang/${ma_dh}`);
    return { success: true };
  } catch (error) {
    console.error("Update order status action error:", error);
    return { success: false, error: "Lỗi khi cập nhật trạng thái đơn hàng" };
  }
}

export async function deleteOrder(ma_dh: number) {
  try {
    const req = new Request(`http://localhost/api/orders/${ma_dh}`, {
      method: "DELETE",
    });
    const res = await deleteOrderApi(req, { params: Promise.resolve({ id: ma_dh.toString() }) });
    const data = await res.json();

    if (!res.ok || !data.success) {
      return { success: false, error: data.error || "Không thể xóa đơn hàng này" };
    }

    revalidatePath('/quan-tri/don-hang');
    return { success: true };
  } catch (error) {
    console.error("Delete order action error:", error);
    return { success: false, error: "Không thể xóa đơn hàng này" };
  }
}
