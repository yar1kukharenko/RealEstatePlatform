import { NextResponse } from 'next/server';

const BASEURL = process.env.NEXT_PUBLIC_API_URL || 'http://real-estate-backend:8000/api';

export async function GET(
  req: Request,
  context: { params: { id: string } | Promise<{ id: string }> },
) {
  const params = await context.params;
  const API_URL = `${BASEURL}/clients/${params.id}/related/`;
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Ошибка загрузки данных о клиенте');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Ошибка загрузки данных о клиенте' }, { status: 500 });
  }
}
