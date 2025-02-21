import { NextResponse } from 'next/server';

const BASEURL = process.env.NEXT_PUBLIC_API_URL || 'http://real-estate-backend:8000/api';

const API_URL = `${BASEURL}/properties/`;

export async function GET() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Ошибка загрузки недвижимости');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        error: 'Ошибка получение недвижимости',
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(req: Request) {
  try {
    const client = await req.json();
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client),
    });

    if (!res.ok) throw new Error('Ошибка создания недвижимости');
    const data = await res.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Ошибка создания недвижимости' }, { status: 500 });
  }
}
