import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ma_tt = parseInt(id);

    if (isNaN(ma_tt)) {
      return NextResponse.json({ error: "Mã tin tức không hợp lệ" }, { status: 400 });
    }

    const newsList = await sql`SELECT * FROM tin_tuc WHERE ma_tt = ${ma_tt}`;

    if (newsList.length === 0) {
      return NextResponse.json({ error: "Không tìm thấy bài viết tin tức" }, { status: 404 });
    }

    return NextResponse.json({ success: true, news: newsList[0] });
  } catch (error: any) {
    console.error("GET /api/news/[id] error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tải bài viết tin tức" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ma_tt = parseInt(id);

    if (isNaN(ma_tt)) {
      return NextResponse.json({ error: "Mã tin tức không hợp lệ" }, { status: 400 });
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

    const tieu_de = (body.tieu_de || '').toString().trim();
    const hinh_anh = (body.hinh_anh || '').toString().trim();
    const noi_dung = (body.noi_dung || '').toString().trim();

    if (!tieu_de || !noi_dung) {
      return NextResponse.json({ error: "Tiêu đề và nội dung không được để trống" }, { status: 400 });
    }

    const result = await sql`
      UPDATE tin_tuc 
      SET tieu_de = ${tieu_de}, hinh_anh = ${hinh_anh}, noi_dung = ${noi_dung}
      WHERE ma_tt = ${ma_tt}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Không tìm thấy tin tức để cập nhật" }, { status: 404 });
    }

    return NextResponse.json({ success: true, news: result[0] });
  } catch (error: any) {
    console.error("PUT /api/news/[id] error:", error);
    return NextResponse.json({ error: "Lỗi khi cập nhật tin tức" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ma_tt = parseInt(id);

    if (isNaN(ma_tt)) {
      return NextResponse.json({ error: "Mã tin tức không hợp lệ" }, { status: 400 });
    }

    const result = await sql`DELETE FROM tin_tuc WHERE ma_tt = ${ma_tt} RETURNING ma_tt`;

    if (result.length === 0) {
      return NextResponse.json({ error: "Không tìm thấy tin tức để xóa" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/news/[id] error:", error);
    return NextResponse.json({ error: "Không thể xóa tin tức này" }, { status: 500 });
  }
}
