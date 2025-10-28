import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


//Approve seller
export async function POST(request) {
    try {
        const {userId} = getAuth(request)
        const isAdmin = await authAdmin(userId)

        if (!isAdmin) {
            return NextResponse.json({error: 'không được cấp quyền'}, {status: 401})
        }

        const {storeId, status} = await request.json()

        if (status === 'đã_duyệt') {
            await prisma.store.update({
                where: {id: storeId},
                data: {status: "đã_duyệt", isActive: true}
            })
        } else if (status === 'đã_từ_chối') {
            await prisma.store.update({
                where: {id: storeId},
                data: {status: "đã_từ_chối"}
            })
        }

        return NextResponse.json({message: status })
    } catch (error) {
        console.error(error)
        return NextResponse.json({error: error.code || error.message}, {status: 400})
    }
}

//Get all pending and rejected stores
export async function GET(request) {
    try {
        const {userId} = getAuth(request)
        const isAdmin = await authAdmin(userId)

        if (!isAdmin) {
            return NextResponse.json({error: 'không được cấp quyền'}, {status: 401})
        }

        const stores = await prisma.store.findMany({
            where: {status: {in: ["đang_chờ_xử_lý", "đã_từ_chối"]}},
            include: {user: true}
        })

        return NextResponse.json({stores})
    } catch (error) {
        console.error(error)
        return NextResponse.json({error: error.code || error.message}, {status: 400})
    }
}