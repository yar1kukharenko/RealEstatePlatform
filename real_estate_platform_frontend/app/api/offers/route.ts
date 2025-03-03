import { NextResponse } from 'next/server';

const BASEURL = process.env.NEXT_PUBLIC_API_URL || 'http://real-estate-backend:8000/api';
const API_URL = `${BASEURL}/offers/`;

export async function GET() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Ошибка загрузки предложений');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Ошибка получения предложений' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const offer = await req.json();
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(offer),
    });

    if (!res.ok) throw new Error('Ошибка создания предложения');
    const data = await res.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Ошибка создания предложения' }, { status: 500 });
  }
}
