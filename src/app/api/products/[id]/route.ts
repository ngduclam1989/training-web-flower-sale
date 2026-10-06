import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ma_hoa = parseInt(id);

    if (isNaN(ma_hoa)) {
      return NextResponse.json({ error: "Mã sản phẩm không hợp lệ" }, { status: 400 });
    }

    const products = await sql`
      SELECT h.*, l.ten_loai 
      FROM hoa h 
      LEFT JOIN loai_hoa l ON h.ma_loai = l.ma_loai
      WHERE h.ma_hoa = ${ma_hoa}
    `;

    if (products.length === 0) {
      return NextResponse.json({ error: "Không tìm thấy sản phẩm" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product: products[0] });
  } catch (error: any) {
    console.error("GET /api/products/[id] error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi lấy thông tin sản phẩm" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ma_hoa = parseInt(id);

    if (isNaN(ma_hoa)) {
      return NextResponse.json({ error: "Mã sản phẩm không hợp lệ" }, { status: 400 });
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
      UPDATE hoa 
      SET ten_hoa = ${ten_hoa}, ma_loai = ${ma_loai}, gia = ${gia}, 
          trang_thai = ${trang_thai}, mo_ta = ${mo_ta}, hinh_anh = ${hinh_anh}
      WHERE ma_hoa = ${ma_hoa}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Không tìm thấy sản phẩm để cập nhật" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product: result[0] });
  } catch (error: any) {
    console.error("PUT /api/products/[id] error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi cập nhật sản phẩm" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ma_hoa = parseInt(id);

    if (isNaN(ma_hoa)) {
      return NextResponse.json({ error: "Mã sản phẩm không hợp lệ" }, { status: 400 });
    }

    // 1. Delete details first
    await sql`DELETE FROM ct_don_dat_hang WHERE ma_hoa = ${ma_hoa}`;
    
    // 2. Delete product
    const result = await sql`DELETE FROM hoa WHERE ma_hoa = ${ma_hoa} RETURNING ma_hoa`;

    if (result.length === 0) {
      return NextResponse.json({ error: "Không tìm thấy sản phẩm để xóa" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json({ error: "Không thể xóa sản phẩm này" }, { status: 500 });
  }
}
