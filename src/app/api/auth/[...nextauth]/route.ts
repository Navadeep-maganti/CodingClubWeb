import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextRequest } from "next/server"

const nextAuthHandler = NextAuth(authOptions)

export async function GET(req: NextRequest, props: { params: Promise<any> }) {
  const params = await props.params;
  return nextAuthHandler(req, { params });
}

export async function POST(req: NextRequest, props: { params: Promise<any> }) {
  const params = await props.params;
  return nextAuthHandler(req, { params });
}
