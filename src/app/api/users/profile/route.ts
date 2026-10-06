import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const decoded = token ? verifyToken(token) as any : null;

    if (!decoded) {
      return NextResponse.json({ error: "Phiên đăng nhập hết hạn hoặc chưa đăng nhập" }, { status: 401 });
    }

    const users = await sql`
      SELECT ma_kh, ho_kh, ten_kh, sdt, dia_chi, email, gioi_tinh, ten_dn 
      FROM khach_hang 
      WHERE ten_dn = ${decoded.ten_dn}
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: users[0] });
  } catch (error: any) {
    console.error("GET /api/users/profile error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tải thông tin người dùng" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const decoded = token ? verifyToken(token) as any : null;

    if (!decoded) {
      return NextResponse.json({ error: "Phiên đăng nhập hết hạn" }, { status: 401 });
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

    const { ho, ten, sdt, email, dia_chi, gioi_tinh, mat_khau } = body;

    // Server-side Validation
    if (!ho || /\d/.test(ho)) {
      return NextResponse.json({ error: "Họ không hợp lệ" }, { status: 400 });
    }
    if (!ten || /\d/.test(ten)) {
      return NextResponse.json({ error: "Tên không hợp lệ" }, { status: 400 });
    }
    if (!sdt || !sdt.startsWith('0') || sdt.length < 9 || sdt.length > 12 || !/^\d+$/.test(sdt)) {
      return NextResponse.json({ error: "Số điện thoại không hợp lệ (9-12 số, bắt đầu bằng 0)" }, { status: 400 });
    }
    if (!email || email.length > 50 || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Email không hợp lệ" }, { status: 400 });
    }
    if (!dia_chi || dia_chi.length > 200) {
      return NextResponse.json({ error: "Địa chỉ không quá 200 ký tự" }, { status: 400 });
    }

    const gioiTinhBit = (gioi_tinh === 'Nam' || gioi_tinh === 1 || gioi_tinh === '1') ? 1 : 0;

    let result;
    if (mat_khau && mat_khau !== "••••") {
      if (mat_khau.length < 11) {
        return NextResponse.json({ error: "Mật khẩu mới phải tối thiểu 11 ký tự" }, { status: 400 });
      }
      const hashedPassword = await bcrypt.hash(mat_khau, 10);
      result = await sql`
        UPDATE khach_hang 
        SET ho_kh = ${ho}, ten_kh = ${ten}, sdt = ${sdt}, email = ${email}, 
            dia_chi = ${dia_chi}, gioi_tinh = ${gioiTinhBit}, mat_khau = ${hashedPassword}
        WHERE ten_dn = ${decoded.ten_dn}
        RETURNING ma_kh, ho_kh, ten_kh, sdt, email, dia_chi, gioi_tinh, ten_dn
      `;
    } else {
      result = await sql`
        UPDATE khach_hang 
        SET ho_kh = ${ho}, ten_kh = ${ten}, sdt = ${sdt}, email = ${email}, 
            dia_chi = ${dia_chi}, gioi_tinh = ${gioiTinhBit}
        WHERE ten_dn = ${decoded.ten_dn}
        RETURNING ma_kh, ho_kh, ten_kh, sdt, email, dia_chi, gioi_tinh, ten_dn
      `;
    }

    return NextResponse.json({ success: true, user: result[0] });
  } catch (error: any) {
    console.error("PUT /api/users/profile error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi cập nhật thông tin" }, { status: 500 });
  }
}
