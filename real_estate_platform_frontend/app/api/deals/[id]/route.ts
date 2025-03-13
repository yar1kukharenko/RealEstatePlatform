import { NextResponse } from 'next/server';

const BASEURL = process.env.NEXT_PUBLIC_API_URL || 'http://real-estate-backend:8000/api';
const API_URL = `${BASEURL}/deals/`;

// 🔹 Обновление сделки (PUT)
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { offer, demand } = await req.json();

    // Отправляем только `offer` и `demand`, Django сам пересчитает комиссии
    const payload = { offer, demand };

    console.log('📤 Обновляем данные сделки:', payload);

    const res = await fetch(`${API_URL}${params.id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error('Ошибка обновления сделки');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Ошибка обновления сделки', error);
    return NextResponse.json({ error: 'Ошибка обновления сделки' }, { status: 500 });
  }
}

// 🔹 Удаление сделки (DELETE)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const res = await fetch(`${API_URL}${params.id}/`, { method: 'DELETE' });

    if (!res.ok) throw new Error('Ошибка удаления сделки');
    return NextResponse.json({ message: 'Сделка удалена' }, { status: 200 });
  } catch (error) {
    console.error('Ошибка удаления сделки', error);
    return NextResponse.json({ error: 'Ошибка удаления сделки' }, { status: 500 });
  }
}
