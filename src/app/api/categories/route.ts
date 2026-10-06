import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const categories = await sql`SELECT * FROM loai_hoa ORDER BY ma_loai ASC`;
    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tải danh sách loại hoa" }, { status: 500 });
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

    const ten_loai = (body.ten_loai || '').toString().trim();

    if (!ten_loai) {
      return NextResponse.json({ error: "Tên loại không được để trống" }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO loai_hoa (ten_loai) 
      VALUES (${ten_loai})
      RETURNING *
    `;

    return NextResponse.json({ success: true, category: result[0] }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/categories error:", error);
    return NextResponse.json({ error: "Loại hoa này đã tồn tại hoặc lỗi hệ thống" }, { status: 400 });
  }
}
