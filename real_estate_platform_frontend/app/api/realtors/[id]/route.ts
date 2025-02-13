import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://real-estate-backend:8000/api/realtors/';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const realtor = await req.json();
    const res = await fetch(`${API_URL}${params.id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(realtor),
    });

    if (!res.ok) throw new Error('Ошибка обновления риэлтора');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Ошибка обновления риэлтора' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const res = await fetch(`${API_URL}${params.id}/`, { method: 'DELETE' });

    if (!res.ok) throw new Error('Ошибка удаления риэлтора');
    return NextResponse.json({ message: 'Риэлтор удалён' }, { status: 204 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Ошибка удаления риэлтора' }, { status: 500 });
  }
}
