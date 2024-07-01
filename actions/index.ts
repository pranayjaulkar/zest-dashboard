import prisma from "@/prisma/client";

interface GraphData {
  name: string;
  total: number;
}

export async function getGraphRevenue(storeId: string) {
  const paidOrders = await prisma.order.findMany({
    where: { storeId, isPaid: true },
    include: {
      orderItems: {
        include: { product: true },
      },
    },
  });
  const monthlyRevenue: { [key: number]: number } = {};
  for (const order of paidOrders) {
    const month = order.createdAt.getMonth();
    let revenueForOrder = 0;
    for (const item of order.orderItems) {
      revenueForOrder += item.product.price.toNumber();
    }
    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + revenueForOrder;
  }
  const graphData: GraphData[] = [
    { name: "Jan", total: 0 },
    { name: "Feb", total: 0 },
    { name: "Mar", total: 0 },
    { name: "Apr", total: 0 },
    { name: "May", total: 0 },
    { name: "Jun", total: 0 },
    { name: "Jul", total: 0 },
    { name: "Aug", total: 0 },
    { name: "Sep", total: 0 },
    { name: "Oct", total: 0 },
    { name: "Nov", total: 0 },
    { name: "Dec", total: 0 },
  ];
  for (const month in monthlyRevenue) {
    graphData[parseInt(month)].total = monthlyRevenue[parseInt(month)];
  }
  return graphData;
}

export async function getSalesCount(storeId: string) {
  const salesCount = await prisma.order.count({
    where: { storeId, isPaid: true },
  });
  return salesCount;
}

export async function getStockCount(storeId: string) {
  const stockCounts = await prisma.productVariation.groupBy({
    by: ["productId"],
    where: { product: { storeId } },
    _sum: { quantity: true },
  });
  return stockCounts.reduce((acc, stockCount) => {
    let sum = 0;
    if (stockCount) {
      sum = stockCount._sum.quantity || 0;
    }
    return acc + sum;
  }, 0);
}

export async function getTotalRevenue(storeId: string) {
  const paidOrders = await prisma.order.findMany({
    where: { storeId, isPaid: true },
    include: { orderItems: { include: { product: true } } },
  });
  const totalRevenue = paidOrders.reduce((total, order) => {
    const orderTotal = order.orderItems.reduce((orderSum, item) => {
      return orderSum + item.product.price.toNumber();
    }, 0);
    return orderTotal + total;
  }, 0);
  return totalRevenue;
}
