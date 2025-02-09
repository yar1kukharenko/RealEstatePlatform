import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://real-estate-backend:8000/api/clients/';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const client = await req.json();
    const res = await fetch(`${API_URL}${params.id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client),
    });

    if (!res.ok) throw new Error('Ошибка обновления клиента');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Ошибка обновления клиента' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const res = await fetch(`${API_URL}${params.id}/`, { method: 'DELETE' });

    if (!res.ok) throw new Error('Ошибка удаления клиента');
    return NextResponse.json({ message: 'Клиент удалён' }, { status: 204 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Ошибка удаления клиента' }, { status: 500 });
  }
}
