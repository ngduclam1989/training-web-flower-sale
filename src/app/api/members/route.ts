import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const members = await sql`
      SELECT ma_kh, ho_kh, ten_kh, sdt, dia_chi, email, gioi_tinh, ten_dn 
      FROM khach_hang 
      ORDER BY ma_kh DESC
    `;
    return NextResponse.json({ success: true, members });
  } catch (error: any) {
    console.error("GET /api/members error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tải danh sách thành viên" }, { status: 500 });
  }
}
