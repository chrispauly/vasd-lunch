import { NextRequest } from 'next/server';
import { handleMenuRequest } from '@/lib/menu-handler';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return handleMenuRequest(req, 'breakfast');
}
