import React, { useState } from 'react';
import { Calendar, DollarSign, FileText, Users, TrendingUp, TrendingDown, BarChart3, PieChart, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import MainLayout from '@/layouts/MainLayout';
import { useApp } from '@/context/useApp';

const Reports = () => {
	const [timeRange, setTimeRange] = useState('30d');
	const { invoices, quotes, customers, getTotalRevenue } = useApp();

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-IN', {
			style: 'currency',
			currency: 'INR',
		}).format(amount);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-IN');
	};

	// Calculate filtered data based on time range
	const getDateRangeInDays = () => {
		const mapping: { [key: string]: number } = {
			'7d': 7,
			'30d': 30,
			'90d': 90,
			'1y': 365,
		};
		return mapping[timeRange] || 30;
	};

	const getDateThreshold = () => {
		const days = getDateRangeInDays();
		const date = new Date();
		date.setDate(date.getDate() - days);
		return date;
	};

	const filteredInvoices = invoices.filter(
		(inv) => new Date(inv.invoiceDate) >= getDateThreshold()
	);

	const filteredQuotes = quotes.filter(
		(q) => new Date(q.quoteDate) >= getDateThreshold()
	);

	// Calculate statistics
	const totalRevenue = getTotalRevenue();
	const paidAmount = filteredInvoices
		.filter((inv) => inv.status === 'paid')
		.reduce((sum, inv) => sum + inv.grandTotal, 0);
	const pendingAmount = filteredInvoices
		.filter((inv) => inv.status === 'pending' || inv.status === 'sent')
		.reduce((sum, inv) => sum + inv.grandTotal, 0);
	const overdueAmount = filteredInvoices
		.filter((inv) => inv.status === 'overdue')
		.reduce((sum, inv) => sum + inv.grandTotal, 0);

	const paymentStatus = [
		{ status: 'Paid', amount: paidAmount, count: filteredInvoices.filter(i => i.status === 'paid').length, color: 'bg-green-500' },
		{ status: 'Pending', amount: pendingAmount, count: filteredInvoices.filter(i => i.status === 'pending' || i.status === 'sent').length, color: 'bg-yellow-500' },
		{ status: 'Overdue', amount: overdueAmount, count: filteredInvoices.filter(i => i.status === 'overdue').length, color: 'bg-red-500' },
	];

	// Top customers by revenue
	const topCustomers = customers
		.map((customer) => {
			const customerInvoices = filteredInvoices.filter((inv) => inv.customerId === customer.id);
			const revenue = customerInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
			return {
				name: customer.name,
				revenue,
				invoices: customerInvoices.length,
			};
		})
		.sort((a, b) => b.revenue - a.revenue)
		.slice(0, 4);

	// Monthly revenue
	const monthlyRevenue: { [key: string]: { revenue: number; invoices: number } } = {};
	filteredInvoices.forEach((invoice) => {
		const date = new Date(invoice.invoiceDate);
		const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
		if (!monthlyRevenue[monthKey]) {
			monthlyRevenue[monthKey] = { revenue: 0, invoices: 0 };
		}
		monthlyRevenue[monthKey].revenue += invoice.grandTotal;
		monthlyRevenue[monthKey].invoices += 1;
	});

	const monthlyRevenueData = Object.entries(monthlyRevenue)
		.map(([month, data]) => ({
			month: new Date(month + '-01').toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
			revenue: data.revenue,
			invoices: data.invoices,
		}))
		.sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
		.slice(-12);

	const totalInvoicesCount = filteredInvoices.length;
	const totalQuotesCount = filteredQuotes.length;
	const convertedQuotes = filteredQuotes.filter((q) => q.status === 'converted').length;

	return (
		<MainLayout>
			<div className="min-h-screen bg-[#0B0F19] text-gray-300">
				{/* Header */}
				<div className="sticky top-0 z-10 bg-[#0B0F19] border-b border-[#1F2937] p-4 sm:p-6">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div>
							<h1 className="text-xl sm:text-2xl font-bold text-white">Reports & Analytics</h1>
							<p className="text-gray-400 mt-1 text-sm sm:text-base">Track your business performance and insights</p>
						</div>
						<div className="flex flex-wrap gap-2 sm:gap-3">
							<Select value={timeRange} onValueChange={setTimeRange}>
								<SelectTrigger className="w-full sm:w-32 bg-[#111827] border-[#1F2937] text-gray-300">
									<SelectValue />
								</SelectTrigger>
								<SelectContent className="bg-[#111827] border-[#1F2937]">
									<SelectItem value="7d" className="text-gray-300">Last 7 days</SelectItem>
									<SelectItem value="30d" className="text-gray-300">Last 30 days</SelectItem>
									<SelectItem value="90d" className="text-gray-300">Last 90 days</SelectItem>
									<SelectItem value="1y" className="text-gray-300">Last year</SelectItem>
								</SelectContent>
							</Select>
							<Button variant="outline" className="bg-[#1F2937] border-[#1F2937] text-gray-300 hover:bg-[#374151] text-sm">
								<Download className="h-4 w-4 mr-2" />
								Export
							</Button>
						</div>
					</div>
				</div>

				<div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
					{/* Overview Cards */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						<Card className="bg-[#111827] border-[#1F2937]">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium text-gray-300">Total Revenue</CardTitle>
								<DollarSign className="h-4 w-4 text-green-400" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold text-white">{formatCurrency(totalRevenue)}</div>
								<p className="text-xs text-gray-400 mt-1">All time revenue</p>
							</CardContent>
						</Card>

						<Card className="bg-[#111827] border-[#1F2937]">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium text-gray-300">Total Invoices</CardTitle>
								<FileText className="h-4 w-4 text-blue-400" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold text-white">{totalInvoicesCount}</div>
								<p className="text-xs text-gray-400 mt-1">In selected period</p>
							</CardContent>
						</Card>

						<Card className="bg-[#111827] border-[#1F2937]">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium text-gray-300">Total Customers</CardTitle>
								<Users className="h-4 w-4 text-purple-400" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold text-white">{customers.length}</div>
								<p className="text-xs text-gray-400 mt-1">Active customers</p>
							</CardContent>
						</Card>

						<Card className="bg-[#111827] border-[#1F2937]">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium text-gray-300">Pending Payments</CardTitle>
								<Calendar className="h-4 w-4 text-yellow-400" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold text-white">{formatCurrency(pendingAmount)}</div>
								<p className="text-xs text-yellow-400 mt-1">Awaiting payment</p>
							</CardContent>
						</Card>
					</div>

					{/* Charts Section */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Revenue Chart */}
						<Card className="bg-[#111827] border-[#1F2937]">
							<CardHeader>
								<CardTitle className="text-white flex items-center gap-2">
									<BarChart3 className="h-5 w-5" />
									Revenue Trend
								</CardTitle>
							</CardHeader>
							<CardContent>
								{monthlyRevenueData.length === 0 ? (
									<div className="text-center py-8 text-gray-400">
										No data available for selected period
									</div>
								) : (
									<div className="space-y-4">
										{monthlyRevenueData.map((data) => (
											<div key={data.month} className="flex items-center justify-between">
												<div className="flex items-center gap-3">
													<div className="w-12 text-sm font-medium text-gray-300">{data.month}</div>
													<div className="flex-1">
														<div className="w-full bg-[#1F2937] rounded-full h-2">
															<div
																className="bg-blue-500 h-2 rounded-full"
																style={{
																	width: `${(data.revenue / Math.max(...monthlyRevenueData.map(d => d.revenue), 1)) * 100}%`
																}}
															></div>
														</div>
													</div>
												</div>
												<div className="text-right">
													<div className="text-sm font-medium text-white">{formatCurrency(data.revenue)}</div>
													<div className="text-xs text-gray-400">{data.invoices} invoices</div>
												</div>
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>

						{/* Payment Status Chart */}
						<Card className="bg-[#111827] border-[#1F2937]">
							<CardHeader>
								<CardTitle className="text-white flex items-center gap-2">
									<PieChart className="h-5 w-5" />
									Payment Status
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{paymentStatus.map((status) => (
										<div key={status.status} className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												<div className={`w-3 h-3 rounded-full ${status.color}`}></div>
												<span className="text-sm font-medium text-gray-300">{status.status}</span>
											</div>
											<div className="text-right">
												<div className="text-sm font-medium text-white">{formatCurrency(status.amount)}</div>
												<div className="text-xs text-gray-400">{status.count} invoices</div>
											</div>
										</div>
									))}
								</div>
								<div className="mt-6">
									<div className="w-full bg-[#1F2937] rounded-full h-4 flex">
										{paymentStatus.map((status, index) => {
											const total = paymentStatus.reduce((sum, s) => sum + s.amount, 0);
											const percentage = total > 0 ? (status.amount / total) * 100 : 0;
											return (
												<div
													key={status.status}
													className={status.color}
													style={{ width: `${percentage}%` }}
												></div>
											);
										})}
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Bottom Section */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Top Customers */}
						<Card className="bg-[#111827] border-[#1F2937]">
							<CardHeader>
								<CardTitle className="text-white">Top Customers</CardTitle>
							</CardHeader>
							<CardContent>
								{topCustomers.length === 0 ? (
									<div className="text-center py-8 text-gray-400">
										No customers yet
									</div>
								) : (
									<div className="space-y-4">
										{topCustomers.map((customer, index) => (
											<div key={customer.name} className="flex items-center justify-between">
												<div className="flex items-center gap-3">
													<div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
														{index + 1}
													</div>
													<div>
														<p className="text-sm font-medium text-white">{customer.name}</p>
														<p className="text-xs text-gray-400">{customer.invoices} invoices</p>
													</div>
												</div>
												<div className="text-right">
													<p className="text-sm font-medium text-white">{formatCurrency(customer.revenue)}</p>
												</div>
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>

						{/* Quote Statistics */}
						<Card className="bg-[#111827] border-[#1F2937]">
							<CardHeader>
								<CardTitle className="text-white">Quote Statistics</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div className="w-3 h-3 bg-purple-500 rounded-full"></div>
											<span className="text-sm font-medium text-gray-300">Total Quotes</span>
										</div>
										<div className="text-right">
											<div className="text-sm font-medium text-white">{totalQuotesCount}</div>
										</div>
									</div>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div className="w-3 h-3 bg-green-500 rounded-full"></div>
											<span className="text-sm font-medium text-gray-300">Converted</span>
										</div>
										<div className="text-right">
											<div className="text-sm font-medium text-white">{convertedQuotes}</div>
											<div className="text-xs text-gray-400">
												{totalQuotesCount > 0 ? `${((convertedQuotes / totalQuotesCount) * 100).toFixed(1)}%` : '0%'}
											</div>
										</div>
									</div>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div className="w-3 h-3 bg-gray-500 rounded-full"></div>
											<span className="text-sm font-medium text-gray-300">Pending</span>
										</div>
										<div className="text-right">
											<div className="text-sm font-medium text-white">
												{totalQuotesCount - convertedQuotes}
											</div>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Quick Actions */}
					<Card className="bg-[#111827] border-[#1F2937]">
						<CardHeader>
							<CardTitle className="text-white">Quick Actions</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<Button variant="outline" className="bg-[#1F2937] border-[#1F2937] text-gray-300 hover:bg-[#374151] justify-start">
									<FileText className="h-4 w-4 mr-2" />
									View All Invoices
								</Button>
								<Button variant="outline" className="bg-[#1F2937] border-[#1F2937] text-gray-300 hover:bg-[#374151] justify-start">
									<Users className="h-4 w-4 mr-2" />
									View All Customers
								</Button>
								<Button variant="outline" className="bg-[#1F2937] border-[#1F2937] text-gray-300 hover:bg-[#374151] justify-start">
									<TrendingUp className="h-4 w-4 mr-2" />
									View All Quotes
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</MainLayout>
	);
};

export default Reports;
