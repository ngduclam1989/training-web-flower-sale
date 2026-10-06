import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ma_kh = searchParams.get('ma_kh');

    let orders;
    if (ma_kh) {
      orders = await sql`
        SELECT d.*, k.ten_kh, k.ho_kh, k.email, k.sdt,
               COALESCE(SUM(c.gia_ban * c.sl_dat), 0) as tong_tien
        FROM don_dat_hang d
        LEFT JOIN khach_hang k ON d.ma_kh = k.ma_kh
        LEFT JOIN ct_don_dat_hang c ON d.ma_dh = c.ma_dh
        WHERE d.ma_kh = ${parseInt(ma_kh)}
        GROUP BY d.ma_dh, k.ma_kh
        ORDER BY d.ma_dh DESC
      `;
    } else {
      orders = await sql`
        SELECT d.*, k.ten_kh, k.ho_kh, k.email, k.sdt,
               COALESCE(SUM(c.gia_ban * c.sl_dat), 0) as tong_tien
        FROM don_dat_hang d
        LEFT JOIN khach_hang k ON d.ma_kh = k.ma_kh
        LEFT JOIN ct_don_dat_hang c ON d.ma_dh = c.ma_dh
        GROUP BY d.ma_dh, k.ma_kh
        ORDER BY d.ma_dh DESC
      `;
    }

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tải danh sách đơn hàng" }, { status: 500 });
  }
}
