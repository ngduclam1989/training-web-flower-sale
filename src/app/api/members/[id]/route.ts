import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ma_kh = parseInt(id);

    if (isNaN(ma_kh)) {
      return NextResponse.json({ error: "Mã thành viên không hợp lệ" }, { status: 400 });
    }

    const members = await sql`
      SELECT ma_kh, ho_kh, ten_kh, sdt, dia_chi, email, gioi_tinh, ten_dn 
      FROM khach_hang 
      WHERE ma_kh = ${ma_kh}
    `;

    if (members.length === 0) {
      return NextResponse.json({ error: "Không tìm thấy thành viên" }, { status: 404 });
    }

    return NextResponse.json({ success: true, member: members[0] });
  } catch (error: any) {
    console.error("GET /api/members/[id] error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi lấy thông tin thành viên" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ma_kh = parseInt(id);

    if (isNaN(ma_kh)) {
      return NextResponse.json({ error: "Mã thành viên không hợp lệ" }, { status: 400 });
    }

    // Check for dependencies (active or past orders)
    const orders = await sql`SELECT count(*) FROM don_dat_hang WHERE ma_kh = ${ma_kh}`;
    if (parseInt(orders[0].count) > 0) {
      return NextResponse.json({ error: "Không thể xóa thành viên đã có lịch sử đặt hàng" }, { status: 400 });
    }

    const result = await sql`DELETE FROM khach_hang WHERE ma_kh = ${ma_kh} RETURNING ma_kh`;

    if (result.length === 0) {
      return NextResponse.json({ error: "Không tìm thấy thành viên để xóa" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/members/[id] error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi xóa thành viên" }, { status: 500 });
  }
}
