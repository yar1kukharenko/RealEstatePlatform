import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://real-estate-backend:8000/api/clients/';

// 🔹 Получить список клиентов (GET)
export async function GET() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Ошибка загрузки клиентов');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Ошибка получения клиентов' }, { status: 500 });
  }
}

// 🔹 Создать клиента (POST)
export async function POST(req: Request) {
  try {
    const client = await req.json();
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client),
    });

    if (!res.ok) throw new Error('Ошибка создания клиента');
    const data = await res.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Ошибка создания клиента' }, { status: 500 });
  }
}
