import { NextResponse } from 'next/server';

const BASEURL = process.env.NEXT_PUBLIC_API_URL || 'http://real-estate-backend:8000/api';
const API_URL = `${BASEURL}/deals/`;

// 🔹 Получение списка сделок (GET)
export async function GET() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Ошибка загрузки сделок');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Ошибка получения сделок', error);
    return NextResponse.json({ error: 'Ошибка получения сделок' }, { status: 500 });
  }
}

// 🔹 Создание сделки (POST)
export async function POST(req: Request) {
  try {
    const { offer, demand } = await req.json();

    // Отправляем только `offer` и `demand`, Django сам считает комиссии
    const payload = { offer, demand };

    console.log('📤 Отправляем данные на сервер:', payload);

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error('Ошибка создания сделки');
    const data = await res.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Ошибка создания сделки', error);
    return NextResponse.json({ error: 'Ошибка создания сделки' }, { status: 500 });
  }
}
