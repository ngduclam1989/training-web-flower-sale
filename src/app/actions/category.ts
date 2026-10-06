"use server";

import { revalidatePath } from "next/cache";
import { POST as createCategoryApi } from "@/app/api/categories/route";
import { PUT as updateCategoryApi, DELETE as deleteCategoryApi } from "@/app/api/categories/[id]/route";

export async function addCategory(formData: FormData) {
  try {
    const req = new Request("http://localhost/api/categories", {
      method: "POST",
      body: formData,
    });
    const res = await createCategoryApi(req);
    const data = await res.json();

    if (!res.ok || !data.success) {
      return { success: false, error: data.error || "Lỗi khi thêm loại hoa" };
    }

    revalidatePath('/quan-tri/loai-hoa');
    revalidatePath('/quan-tri/hoa');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Add category action error:", error);
    return { success: false, error: "Loại hoa này đã tồn tại hoặc lỗi hệ thống" };
  }
}

export async function updateCategory(ma_loai: number, formData: FormData) {
  try {
    const req = new Request(`http://localhost/api/categories/${ma_loai}`, {
      method: "PUT",
      body: formData,
    });
    const res = await updateCategoryApi(req, { params: Promise.resolve({ id: ma_loai.toString() }) });
    const data = await res.json();

    if (!res.ok || !data.success) {
      return { success: false, error: data.error || "Lỗi khi cập nhật loại hoa" };
    }

    revalidatePath('/quan-tri/loai-hoa');
    revalidatePath('/quan-tri/hoa');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Update category action error:", error);
    return { success: false, error: "Lỗi khi cập nhật loại hoa" };
  }
}

export async function deleteCategory(ma_loai: number) {
  try {
    const req = new Request(`http://localhost/api/categories/${ma_loai}`, {
      method: "DELETE",
    });
    const res = await deleteCategoryApi(req, { params: Promise.resolve({ id: ma_loai.toString() }) });
    const data = await res.json();

    if (!res.ok || !data.success) {
      return { success: false, error: data.error || "Lỗi khi xóa loại hoa" };
    }

    revalidatePath('/quan-tri/loai-hoa');
    return { success: true };
  } catch (error) {
    console.error("Delete category action error:", error);
    return { success: false, error: "Lỗi khi xóa loại hoa" };
  }
}
