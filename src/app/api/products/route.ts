import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ma_loai = searchParams.get('ma_loai');
    const search = searchParams.get('search');

    let query;

    if (ma_loai && search) {
      query = sql`
        SELECT h.*, l.ten_loai 
        FROM hoa h 
        LEFT JOIN loai_hoa l ON h.ma_loai = l.ma_loai
        WHERE h.ma_loai = ${parseInt(ma_loai)} AND h.ten_hoa ILIKE ${'%' + search + '%'}
        ORDER BY h.ma_hoa DESC
      `;
    } else if (ma_loai) {
      query = sql`
        SELECT h.*, l.ten_loai 
        FROM hoa h 
        LEFT JOIN loai_hoa l ON h.ma_loai = l.ma_loai
        WHERE h.ma_loai = ${parseInt(ma_loai)}
        ORDER BY h.ma_hoa DESC
      `;
    } else if (search) {
      query = sql`
        SELECT h.*, l.ten_loai 
        FROM hoa h 
        LEFT JOIN loai_hoa l ON h.ma_loai = l.ma_loai
        WHERE h.ten_hoa ILIKE ${'%' + search + '%'}
        ORDER BY h.ma_hoa DESC
      `;
    } else {
      query = sql`
        SELECT h.*, l.ten_loai 
        FROM hoa h 
        LEFT JOIN loai_hoa l ON h.ma_loai = l.ma_loai
        ORDER BY h.ma_hoa DESC
      `;
    }

    const products = await query;
    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tải danh sách sản phẩm" }, { status: 500 });
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

    const ten_hoa = (body.ten_hoa || '').toString().trim();
    const ma_loai = parseInt(body.ma_loai);
    const gia = parseFloat(body.gia);
    const parsedStatus = parseInt(body.trang_thai);
    const trang_thai = isNaN(parsedStatus) ? 1 : parsedStatus;
    const mo_ta = (body.mo_ta || '').toString().trim();
    const hinh_anh = (body.hinh_anh || '').toString().trim();

    // Validation
    if (!ten_hoa || ten_hoa.length < 5 || ten_hoa.length > 20) {
      return NextResponse.json({ error: "Tên hoa phải từ 5 đến 20 ký tự" }, { status: 400 });
    }
    if (isNaN(ma_loai)) {
      return NextResponse.json({ error: "Loại hoa không hợp lệ" }, { status: 400 });
    }
    if (isNaN(gia) || gia < 5000 || gia > 7000000) {
      return NextResponse.json({ error: "Giá bán phải từ 5.000đ đến 7.000.000đ" }, { status: 400 });
    }
    if (!mo_ta || mo_ta.length > 250) {
      return NextResponse.json({ error: "Mô tả không được để trống và không quá 250 ký tự" }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO hoa (ten_hoa, ma_loai, gia, trang_thai, mo_ta, hinh_anh)
      VALUES (${ten_hoa}, ${ma_loai}, ${gia}, ${trang_thai}, ${mo_ta}, ${hinh_anh})
      RETURNING *
    `;

    return NextResponse.json({ success: true, product: result[0] }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/products error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi thêm sản phẩm" }, { status: 500 });
  }
}
