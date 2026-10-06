import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const newsList = await sql`SELECT * FROM tin_tuc ORDER BY ngay_dang DESC, ma_tt DESC`;
    return NextResponse.json({ success: true, news: newsList });
  } catch (error: any) {
    console.error("GET /api/news error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tải danh sách tin tức" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
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
      INSERT INTO tin_tuc (tieu_de, hinh_anh, noi_dung, ngay_dang) 
      VALUES (${tieu_de}, ${hinh_anh}, ${noi_dung}, NOW())
      RETURNING *
    `;

    return NextResponse.json({ success: true, news: result[0] }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/news error:", error);
    return NextResponse.json({ error: "Lỗi khi đăng tin tức" }, { status: 500 });
  }
}
