"use server";

import { revalidatePath } from "next/cache";
import { POST as createProductApi } from "@/app/api/products/route";
import { PUT as updateProductApi, DELETE as deleteProductApi } from "@/app/api/products/[id]/route";

export async function addProduct(formData: FormData) {
  try {
    const req = new Request("http://localhost/api/products", {
      method: "POST",
      body: formData,
    });
    const res = await createProductApi(req);
    const data = await res.json();

    if (!res.ok || !data.success) {
      return { success: false, error: data.error || "Lỗi khi thêm sản phẩm" };
    }

    revalidatePath('/quan-tri/hoa');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Add product action error:", error);
    return { success: false, error: "Lỗi hệ thống khi thêm sản phẩm" };
  }
}

export async function updateProduct(ma_hoa: number, formData: FormData) {
  try {
    const req = new Request(`http://localhost/api/products/${ma_hoa}`, {
      method: "PUT",
      body: formData,
    });
    const res = await updateProductApi(req, { params: Promise.resolve({ id: ma_hoa.toString() }) });
    const data = await res.json();

    if (!res.ok || !data.success) {
      return { success: false, error: data.error || "Lỗi khi cập nhật sản phẩm" };
    }

    revalidatePath('/quan-tri/hoa');
    revalidatePath(`/hoa/${ma_hoa}`);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Update product action error:", error);
    return { success: false, error: "Lỗi hệ thống khi cập nhật sản phẩm" };
  }
}

export async function deleteProduct(ma_hoa: number) {
  try {
    const req = new Request(`http://localhost/api/products/${ma_hoa}`, {
      method: "DELETE",
    });
    const res = await deleteProductApi(req, { params: Promise.resolve({ id: ma_hoa.toString() }) });
    const data = await res.json();

    if (!res.ok || !data.success) {
      return { success: false, error: data.error || "Không thể xóa sản phẩm này" };
    }

    revalidatePath('/quan-tri/hoa');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Delete product action error:", error);
    return { success: false, error: "Không thể xóa sản phẩm này" };
  }
}
