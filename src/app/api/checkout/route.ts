import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const userData = token ? verifyToken(token) as any : null;

    const customerId = userData?.id || 1; // Default fallback to customer ID 1 for training convenience

    const body = await request.json();
    const { formData, cart } = body;

    if (!formData || !formData.diaChiGiaoHang) {
      return NextResponse.json({ error: "Địa chỉ giao hàng không được để trống" }, { status: 400 });
    }

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: "Giỏ hàng không được để trống" }, { status: 400 });
    }

    const noiGiao = formData.diaChiGiaoHang;
    const ngayGH = formData.ngayGiaoHang || new Date();

    // 1. Create Order
    const orderResult = await sql`
      INSERT INTO don_dat_hang (ma_kh, ngay_gh, noi_giao, hien_trang)
      VALUES (${customerId}, ${ngayGH}, ${noiGiao}, 0)
      RETURNING ma_dh
    `;

    const maDH = orderResult[0].ma_dh;

    // 2. Create Order Details
    for (const item of cart) {
      await sql`
        INSERT INTO ct_don_dat_hang (ma_dh, ma_hoa, gia_ban, sl_dat)
        VALUES (${maDH}, ${item.ma_hoa}, ${item.gia}, ${item.quantity})
      `;
    }

    return NextResponse.json({ success: true, orderId: maDH }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/checkout error:", error);
    return NextResponse.json({ error: "Lỗi xử lý đơn hàng" }, { status: 500 });
  }
}
