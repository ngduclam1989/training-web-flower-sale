import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ma_loai = parseInt(id);

    if (isNaN(ma_loai)) {
      return NextResponse.json({ error: "Mã loại hoa không hợp lệ" }, { status: 400 });
    }

    const categories = await sql`SELECT * FROM loai_hoa WHERE ma_loai = ${ma_loai}`;

    if (categories.length === 0) {
      return NextResponse.json({ error: "Không tìm thấy loại hoa" }, { status: 404 });
    }

    return NextResponse.json({ success: true, category: categories[0] });
  } catch (error: any) {
    console.error("GET /api/categories/[id] error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tải loại hoa" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ma_loai = parseInt(id);

    if (isNaN(ma_loai)) {
      return NextResponse.json({ error: "Mã loại hoa không hợp lệ" }, { status: 400 });
    }

    let body: any = {};
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      const formData = await request.formData();
      formData.forEach((value, key) => {
        body[key] = value;
      });
    }

    const ten_loai = (body.ten_loai || '').toString().trim();

    if (!ten_loai) {
      return NextResponse.json({ error: "Tên loại không được để trống" }, { status: 400 });
    }

    const result = await sql`
      UPDATE loai_hoa 
      SET ten_loai = ${ten_loai} 
      WHERE ma_loai = ${ma_loai}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Không tìm thấy loại hoa để cập nhật" }, { status: 404 });
    }

    return NextResponse.json({ success: true, category: result[0] });
  } catch (error: any) {
    console.error("PUT /api/categories/[id] error:", error);
    return NextResponse.json({ error: "Lỗi khi cập nhật loại hoa" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ma_loai = parseInt(id);

    if (isNaN(ma_loai)) {
      return NextResponse.json({ error: "Mã loại hoa không hợp lệ" }, { status: 400 });
    }

    // Check if category has flowers
    const flowers = await sql`SELECT count(*) FROM hoa WHERE ma_loai = ${ma_loai}`;
    if (parseInt(flowers[0].count) > 0) {
      return NextResponse.json({ error: "Không thể xóa loại hoa đang có sản phẩm" }, { status: 400 });
    }

    const result = await sql`DELETE FROM loai_hoa WHERE ma_loai = ${ma_loai} RETURNING ma_loai`;

    if (result.length === 0) {
      return NextResponse.json({ error: "Không tìm thấy loại hoa để xóa" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/categories/[id] error:", error);
    return NextResponse.json({ error: "Lỗi khi xóa loại hoa" }, { status: 500 });
  }
}
