import { NextResponse } from 'next/server';

const BASEURL = process.env.NEXT_PUBLIC_API_URL || 'http://real-estate-backend:8000/api';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const res = await fetch(`${BASEURL}/offers/${params.id}/search_demands/`);
    if (!res.ok) throw new Error('Ошибка поиска потребностей');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Ошибка поиска потребностей' }, { status: 500 });
  }
}
