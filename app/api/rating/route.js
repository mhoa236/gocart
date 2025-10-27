import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


//Add new rating
export async function GET(request) {
    try {
        const {useIdr} = getAuth(request)
        const {orderId, productId, rating, review} = await request.json()
        const order = await prisma.order.findUnique({where: {id: orderId, userId}})

        if (!order) {
            return NextResponse.json({error: "Không tìm thấy đơn hàng"}, {status: 404})
        }

        const isAlreadyRated = await prisma.rating.findFirst({where: {productId, orderId}})

        if (isAlreadyRated) {
            return NextResponse.json({error: "Sản phẩm đã được đánh giá"}, {status: 400})
        }

        const response  = await prisma.rating.create({
            data: {userId, productId, rating, review, orderId}
        })

        return NextResponse.json({message: "Đã thêm đánh giá thành công"})
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: error.code || error.message}, {status: 400})
    }
}

//Get all ratings for user
export async function POST(request) {
    try {
        const {userId} = getAuth(request)
        if (!userId) {
            return NextResponse.json({error: "không được cấp quyền"}, {status: 401})
        }
        const ratings = await prisma.rating.findMany({
            where: {userId}
        })
        return NextResponse.json({ratings})
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: error.code || error.message}, {status: 400})
    }
}