import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAuth } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  const userId = await verifyAuth(request);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase admin client unavailable' }, { status: 500 });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('users')
    .select('usertype')
    .eq('userid', userId)
    .single();

  const userProfile = profile as { usertype?: string } | null;
  if (profileError || userProfile?.usertype?.toLowerCase() !== 'manager') {
    return NextResponse.json({ error: 'Manager privileges required' }, { status: 403 });
  }

  const [
    productsResult,
    ordersResult,
    customersResult,
    consultancyBookingsResult,
    courseBookingsResult,
    ordersDataResult,
  ] = await Promise.all([
    supabaseAdmin.from('products').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('customers').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('biz_consultancy_bookings').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('biz_course_bookings').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('orders').select('totalamount'),
  ]);

  const failedQuery = [
    productsResult,
    ordersResult,
    customersResult,
    consultancyBookingsResult,
    courseBookingsResult,
    ordersDataResult,
  ].find((result) => result.error);

  if (failedQuery?.error) {
    console.error('Admin dashboard stats query failed:', failedQuery.error);
    return NextResponse.json({ error: failedQuery.error.message }, { status: 500 });
  }

  const totalRevenue = ((ordersDataResult.data || []) as Array<{ totalamount?: number | string | null }>).reduce(
    (sum, order) => sum + ((Number(order.totalamount) || 0) / 100),
    0
  );

  return NextResponse.json({
    products: productsResult.count || 0,
    orders: ordersResult.count || 0,
    customers: customersResult.count || 0,
    bookings: (consultancyBookingsResult.count || 0) + (courseBookingsResult.count || 0),
    totalRevenue,
  });
}