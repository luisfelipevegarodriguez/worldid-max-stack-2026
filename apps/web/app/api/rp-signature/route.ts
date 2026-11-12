import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// IDKit 2.x has no RP signing helper. The IDKit 4 upgrade replaces this route
// with signRequest() and never returns the signing key.
export async function POST() {
  return NextResponse.json(
    {
      error: 'signing_unavailable',
      detail: 'RP request signatures are added with IDKit 4. Proof verification still runs without this route.',
    },
    { status: 501 },
  );
}
