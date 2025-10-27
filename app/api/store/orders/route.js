import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


//Update seller order status
export async function POST(request) {
    try {
        const {userId} = getAuth(request)
        const storeId = await authSeller(userId)

        if (!storeId) {
            return NextResponse.json({error: 'không được cấp quyền'}, {status: 401})
        }

        const {orderID, status} = await request.json()

        await prisma.order.update({
            where: {id: orderId, storeId},
            data: {status}
        })

        return NextResponse.json({message: "Trạng thái đơn hàng đã được cập nhật"})
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: error.code || error.message}, {status: 400})
    }
}

//Get all orders for seller
export async function GET(request) {
    try {
        const {userId} = getAuth(request)
        const storeId = await authSeller(userId)

        if (!storeId) {
            return NextResponse.json({error: 'không được cấp quyền'}, {status: 401})
        }

        const orders = await prisma.order.findMany({
            where: {storeId},
            include: {user: true, address: true, orderItems: {include: {product: true}}},
            orderBy: {createdAt: 'desc'}
        })

        return NextResponse.json({orders})
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: error.code || error.message}, {status: 400})
    }
}