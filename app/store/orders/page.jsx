'use client'
import { useEffect, useState } from "react"
import Loading from "@/components/Loading"
import { orderDummyData } from "@/assets/assets"
import { useAuth } from "@clerk/clerk-react"
import axios from "axios"
import toast from "react-hot-toast"

export default function StoreOrders() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const {getToken} = useAuth()

    const fetchOrders = async () => {
       try {
        const token = await getToken()
        const {data} = await axios.get('/api/store/orders', {headers: {Authorization: `Bearer ${token}`}})
        setOrders(data.orders)
       } catch (error) {
        toast.error(error?.response?.data?.error || error.messag)
       } finally {
        setLoading(false)
       }
    }

    const updateOrderStatus = async (orderId, status) => {
        try {
        const token = await getToken()
        await axios.post('/api/store/orders', {orderId, status}, {headers: {Authorization: `Bearer ${token}`}})
        setOrders(prev =>
            prev.map(order =>
                order.id === orderId? {...order, status} : order
            )
        )
        toast.success('Trạng thái đơn hàng đã được cập nhật')
       } catch (error) {
        toast.error(error?.response?.data?.error || error.messag)
       } finally {
        setLoading(false)
       }


    }

    const openModal = (order) => {
        setSelectedOrder(order)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setSelectedOrder(null)
        setIsModalOpen(false)
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    if (loading) return <Loading />

    return (
        <>
            <h1 className="text-2xl text-slate-500 mb-5"><span className="text-slate-800 font-medium">Đơn hàng</span></h1>
            {orders.length === 0 ? (
                <p>Không tìm thấy đơn hàng nào</p>
            ) : (
                <div className="overflow-x-auto max-w-4xl rounded-md shadow border border-gray-200">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 text-xs uppercase tracking-wider">
                            <tr>
                                {["STT", "Khách hàng", "Tổng", "Thanh toán", "Coupon", "Trạng thái", "Ngày"].map((heading, i) => (
                                    <th key={i} className="px-4 py-3">{heading}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map((order, index) => (
                                <tr
                                    key={order.id}
                                    className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                                    onClick={() => openModal(order)}
                                >
                                    <td className="pl-6 text-green-600" >
                                        {index + 1}
                                    </td>
                                    <td className="px-4 py-3">{order.user?.name}</td>
                                    <td className="px-4 py-3 font-medium text-slate-800">{order.total}VND</td>
                                    <td className="px-4 py-3">{order.paymentMethod}</td>
                                    <td className="px-4 py-3">
                                        {order.isCouponUsed ? (
                                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                                                {order.coupon?.code}
                                            </span>
                                        ) : (
                                            "—"
                                        )}
                                    </td>
                                    <td className="px-4 py-3" onClick={(e) => { e.stopPropagation() }}>
                                        <select
                                            value={order.status}
                                            onChange={e => updateOrderStatus(order.id, e.target.value)}
                                            className="border-gray-300 rounded-md text-sm focus:ring focus:ring-blue-200"
                                        >
                                            <option value="ĐÃ_ĐẶT_HÀNG">ĐÃ ĐẶT HÀNG</option>
                                            <option value="ĐANG_XỬ_LÝ">ĐANG XỬ LÝ</option>
                                            <option value="ĐÃ_GỬI">ĐÃ GỬI</option>
                                            <option value="ĐÃ_GIAO">ĐÃ GIAO</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {new Date(order.createdAt).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && selectedOrder && (
                <div onClick={closeModal} className="fixed inset-0 flex items-center justify-center bg-black/50 text-slate-700 text-sm backdrop-blur-xs z-50" >
                    <div onClick={e => e.stopPropagation()} className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4 text-center">
                            Chi tiết đơn hàng
                        </h2>

                        {/* Customer Details */}
                        <div className="mb-4">
                            <h3 className="font-semibold mb-2">Thông tin khách hàng</h3>
                            <p><span className="text-green-700">Tên:</span> {selectedOrder.user?.name}</p>
                            <p><span className="text-green-700">Email:</span> {selectedOrder.user?.email}</p>
                            <p><span className="text-green-700">SĐT:</span> {selectedOrder.address?.phone}</p>
                            <p><span className="text-green-700">Địa chỉ:</span> {`${selectedOrder.address?.street}, ${selectedOrder.address?.city}, ${selectedOrder.address?.state}, ${selectedOrder.address?.zip}, ${selectedOrder.address?.country}`}</p>
                        </div>

                        {/* Products */}
                        <div className="mb-4">
                            <h3 className="font-semibold mb-2">Sản phẩm</h3>
                            <div className="space-y-2">
                                {selectedOrder.orderItems.map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 border border-slate-100 shadow rounded p-2">
                                        <img
                                            src={item.product.images?.[0].src || item.product.images?.[0]}
                                            alt={item.product?.name}
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                        <div className="flex-1">
                                            <p className="text-slate-800">{item.product?.name}</p>
                                            <p>Số lượng: {item.quantity}</p>
                                            <p>Giá tiền: ${item.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment & Status */}
                        <div className="mb-4">
                            <p><span className="text-green-700">Phương thức thanh toán:</span> {selectedOrder.paymentMethod}</p>
                            <p><span className="text-green-700">Đã thanh toán:</span> {selectedOrder.isPaid ? "Rồi" : "Chưa"}</p>
                            {selectedOrder.isCouponUsed && (
                                <p><span className="text-green-700">Coupon:</span> {selectedOrder.coupon.code} ({selectedOrder.coupon.discount}% off)</p>
                            )}
                            <p><span className="text-green-700">Trạng thái:</span> {selectedOrder.status}</p>
                            <p><span className="text-green-700">Ngày đặt:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end">
                            <button onClick={closeModal} className="px-4 py-2 bg-slate-200 rounded hover:bg-slate-300" >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
