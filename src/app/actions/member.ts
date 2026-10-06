"use server";

import { revalidatePath } from "next/cache";
import { DELETE as deleteMemberApi } from "@/app/api/members/[id]/route";

export async function deleteMember(ma_kh: number) {
  try {
    const req = new Request(`http://localhost/api/members/${ma_kh}`, {
      method: "DELETE",
    });
    const res = await deleteMemberApi(req, { params: Promise.resolve({ id: ma_kh.toString() }) });
    const data = await res.json();

    if (!res.ok || !data.success) {
      return { success: false, error: data.error || "Lỗi hệ thống khi xóa thành viên" };
    }

    revalidatePath('/quan-tri/thanh-vien');
    return { success: true };
  } catch (error) {
    console.error("Delete member action error:", error);
    return { success: false, error: "Lỗi hệ thống khi xóa thành viên" };
  }
}
