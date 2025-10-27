import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

//Toggle store isActive
export async function POST(request) {
    try {
        const {userId} = getAuth(request)
        const isAdmin = await authAdmin(userId)

        if (!isAdmin) {
            return NextResponse.json({error: 'không được cấp quyền'}, {status: 401})
        }

        const {storeId} = await request.json()

        if (!storeId) {
            if (!isAdmin) {
            return NextResponse.json({error: "thiếu storeId"}, {status: 400})
        }
        
        //Find store
        const store = await prisma.store.findUnique({where: {id: storeId}})

        if (!store) {
            if (!isAdmin) {
            return NextResponse.json({error: "không tìm thấy cửa hàng"}, {status: 400})
        }
        
        await prisma.store.update({
            where: {id: storeId},
            data: {isActive: !store.isActive}
        })

        return NextResponse.json({message: "Cửa hàng đã được cập nhật thành công"})
        
    }}
    } catch (error) {
        console.error(error)
        return NextResponse.json({error: error.code || error.message}, {status: 400})
    }
}