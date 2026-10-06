"use server";

import { revalidatePath } from "next/cache";
import { POST as createNewsApi } from "@/app/api/news/route";
import { PUT as updateNewsApi, DELETE as deleteNewsApi } from "@/app/api/news/[id]/route";

export async function addNews(formData: FormData) {
  try {
    const req = new Request("http://localhost/api/news", {
      method: "POST",
      body: formData,
    });
    const res = await createNewsApi(req);
    const data = await res.json();

    if (!res.ok || !data.success) {
      return { success: false, error: data.error || "Lỗi khi đăng tin tức" };
    }

    revalidatePath('/quan-tri/tin-tuc');
    revalidatePath('/tin-tuc');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Add news action error:", error);
    return { success: false, error: "Lỗi khi đăng tin tức" };
  }
}

export async function updateNews(ma_tt: number, formData: FormData) {
  try {
    const req = new Request(`http://localhost/api/news/${ma_tt}`, {
      method: "PUT",
      body: formData,
    });
    const res = await updateNewsApi(req, { params: Promise.resolve({ id: ma_tt.toString() }) });
    const data = await res.json();

    if (!res.ok || !data.success) {
      return { success: false, error: data.error || "Lỗi khi cập nhật tin tức" };
    }

    revalidatePath('/quan-tri/tin-tuc');
    revalidatePath('/tin-tuc');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Update news action error:", error);
    return { success: false, error: "Lỗi khi cập nhật tin tức" };
  }
}

export async function deleteNews(ma_tt: number) {
  try {
    const req = new Request(`http://localhost/api/news/${ma_tt}`, {
      method: "DELETE",
    });
    const res = await deleteNewsApi(req, { params: Promise.resolve({ id: ma_tt.toString() }) });
    const data = await res.json();

    if (!res.ok || !data.success) {
      return { success: false, error: data.error || "Không thể xóa tin tức này" };
    }

    revalidatePath('/quan-tri/tin-tuc');
    revalidatePath('/tin-tuc');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Delete news action error:", error);
    return { success: false, error: "Không thể xóa tin tức này" };
  }
}
