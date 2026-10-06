import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ma_dh = parseInt(id);

    if (isNaN(ma_dh)) {
      return NextResponse.json({ error: "Mã đơn hàng không hợp lệ" }, { status: 400 });
    }

    const orders = await sql`
      SELECT d.*, k.ten_kh, k.ho_kh, k.email, k.sdt
      FROM don_dat_hang d
      LEFT JOIN khach_hang k ON d.ma_kh = k.ma_kh
      WHERE d.ma_dh = ${ma_dh}
    `;

    if (orders.length === 0) {
      return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });
    }

    const details = await sql`
      SELECT c.*, h.ten_hoa, h.hinh_anh
      FROM ct_don_dat_hang c
      JOIN hoa h ON c.ma_hoa = h.ma_hoa
      WHERE c.ma_dh = ${ma_dh}
    `;

    return NextResponse.json({
      success: true,
      order: {
        ...orders[0],
        items: details
      }
    });
  } catch (error: any) {
    console.error("GET /api/orders/[id] error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi lấy thông tin đơn hàng" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ma_dh = parseInt(id);

    if (isNaN(ma_dh)) {
      return NextResponse.json({ error: "Mã đơn hàng không hợp lệ" }, { status: 400 });
    }

    const body = await request.json();
    const status = parseInt(body.status);

    if (isNaN(status)) {
      return NextResponse.json({ error: "Trạng thái đơn hàng không hợp lệ" }, { status: 400 });
    }

    const result = await sql`
      UPDATE don_dat_hang 
      SET hien_trang = ${status}
      WHERE ma_dh = ${ma_dh}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Không tìm thấy đơn hàng để cập nhật" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: result[0] });
  } catch (error: any) {
    console.error("PATCH /api/orders/[id] error:", error);
    return NextResponse.json({ error: "Lỗi khi cập nhật trạng thái đơn hàng" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ma_dh = parseInt(id);

    if (isNaN(ma_dh)) {
      return NextResponse.json({ error: "Mã đơn hàng không hợp lệ" }, { status: 400 });
    }

    // 1. Delete details first
    await sql`DELETE FROM ct_don_dat_hang WHERE ma_dh = ${ma_dh}`;

    // 2. Delete order
    const result = await sql`DELETE FROM don_dat_hang WHERE ma_dh = ${ma_dh} RETURNING ma_dh`;

    if (result.length === 0) {
      return NextResponse.json({ error: "Không tìm thấy đơn hàng để xóa" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/orders/[id] error:", error);
    return NextResponse.json({ error: "Không thể xóa đơn hàng này" }, { status: 500 });
  }
}
