import { NextResponse } from 'next/server';

const BASEURL = process.env.NEXT_PUBLIC_API_URL || 'http://real-estate-backend:8000/api';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const res = await fetch(`${BASEURL}/demands/${params.id}/search_offers/`);
    if (!res.ok) throw new Error('Ошибка поиска предложений');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Ошибка поиска предложений' }, { status: 500 });
  }
}
