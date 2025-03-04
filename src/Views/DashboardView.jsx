import Layout from "./Layout";
import { useState, useEffect } from 'react';

export default function DashboardView() {
    // Sample data - in a real app, this would come from an API or database
    const stats = {
        dailyRevenue: "$2,450",
        ticketsSold: 186,
        occupancyRate: "75%",
        averageTicketPrice: "$25",
        concessionSales: "$980",
        totalCustomers: "210",
        weeklyComparison: {
            revenue: "+12%",
            tickets: "+8%",
            customers: "+15%"
        },
        revenueBreakdown: {
            tickets: "65%",
            concessions: "25%",
            merchandise: "10%"
        },
        topMovies: [
            { title: "Inception", revenue: "$12,450", occupancy: "92%" },
            { title: "The Dark Knight", revenue: "$10,280", occupancy: "88%" },
            { title: "Dune: Part Two", revenue: "$9,850", occupancy: "85%" }
        ],
        dailySchedule: [
            { time: "10:00 AM", movie: "Inception", hall: "Hall A", bookings: "45/120" },
            { time: "11:30 AM", movie: "The Dark Knight", hall: "Hall B", bookings: "78/120" },
            { time: "2:00 PM", movie: "Dune: Part Two", hall: "Hall C", bookings: "92/120" },
            { time: "4:30 PM", movie: "Inception", hall: "Hall A", bookings: "89/120" }
        ],
        upcomingReleases: [
            { title: "The Matrix Resurrections", releaseDate: "Next Week", preBookings: 145 },
            { title: "Avatar 3", releaseDate: "In 2 Weeks", preBookings: 230 },
            { title: "Blade Runner 2099", releaseDate: "In 3 Weeks", preBookings: 89 }
        ],
        concessionPerformance: {
            topItems: [
                { item: "Popcorn Combo", sales: "$450", quantity: 150 },
                { item: "Nachos", sales: "$280", quantity: 70 },
                { item: "Soft Drinks", sales: "$250", quantity: 125 }
            ],
            peakHours: [
                { hour: "6 PM - 7 PM", sales: "$180" },
                { hour: "7 PM - 8 PM", sales: "$220" },
                { hour: "8 PM - 9 PM", sales: "$195" }
            ]
        }
    };

    return (
        <Layout>
            <div className="space-y-4">
                <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
                
                {/* Analytics Overview */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="text-gray-500 text-sm font-medium">Today's Revenue</h3>
                        <p className="text-xl font-bold mt-1">{stats.dailyRevenue}</p>
                        <p className="text-xs text-green-600 mt-1">{stats.weeklyComparison.revenue} vs last week</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="text-gray-500 text-sm font-medium">Tickets Sold</h3>
                        <p className="text-xl font-bold mt-1">{stats.ticketsSold}</p>
                        <p className="text-xs text-green-600 mt-1">{stats.weeklyComparison.tickets} vs last week</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="text-gray-500 text-sm font-medium">Occupancy Rate</h3>
                        <p className="text-xl font-bold mt-1">{stats.occupancyRate}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="text-gray-500 text-sm font-medium">Ticket Price</h3>
                        <p className="text-xl font-bold mt-1">{stats.averageTicketPrice}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="text-gray-500 text-sm font-medium">Concession Sales</h3>
                        <p className="text-xl font-bold mt-1">{stats.concessionSales}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="text-gray-500 text-sm font-medium">Total Customers</h3>
                        <p className="text-xl font-bold mt-1">{stats.totalCustomers}</p>
                        <p className="text-xs text-green-600 mt-1">{stats.weeklyComparison.customers} vs last week</p>
                    </div>
                </div>

                {/* Daily Schedule Overview */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold mb-4">Today's Schedule</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Movie</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hall</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {stats.dailySchedule.map((screening, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{screening.time}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{screening.movie}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{screening.hall}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{screening.bookings}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Revenue Breakdown & Top Movies */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Revenue Breakdown */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold mb-4">Revenue Breakdown</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Ticket Sales</span>
                                <span className="font-semibold">{stats.revenueBreakdown.tickets}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{width: stats.revenueBreakdown.tickets}}></div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Concessions</span>
                                <span className="font-semibold">{stats.revenueBreakdown.concessions}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-green-600 h-2.5 rounded-full" style={{width: stats.revenueBreakdown.concessions}}></div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Merchandise</span>
                                <span className="font-semibold">{stats.revenueBreakdown.merchandise}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-yellow-600 h-2.5 rounded-full" style={{width: stats.revenueBreakdown.merchandise}}></div>
                            </div>
                        </div>
                    </div>

                    {/* Top Performing Movies */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold mb-4">Top Performing Movies</h2>
                        <div className="space-y-4">
                            {stats.topMovies.map((movie, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                        <h3 className="font-medium">{movie.title}</h3>
                                        <p className="text-sm text-gray-500">Occupancy: {movie.occupancy}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-green-600">{movie.revenue}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Upcoming Releases & Concessions Performance */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Upcoming Releases */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold mb-4">Upcoming Releases</h2>
                        <div className="space-y-4">
                            {stats.upcomingReleases.map((movie, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                        <h3 className="font-medium">{movie.title}</h3>
                                        <p className="text-sm text-gray-500">{movie.releaseDate}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">{movie.preBookings} pre-bookings</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Concessions Performance */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold mb-4">Concessions Performance</h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-3">Top Selling Items</h3>
                                <div className="space-y-3">
                                    {stats.concessionPerformance.topItems.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                            <span className="text-sm font-medium">{item.item}</span>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-green-600">{item.sales}</p>
                                                <p className="text-xs text-gray-500">{item.quantity} units</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-3">Peak Hours Performance</h3>
                                <div className="space-y-3">
                                    {stats.concessionPerformance.peakHours.map((hour, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                            <span className="text-sm">{hour.hour}</span>
                                            <span className="text-sm font-semibold text-green-600">{hour.sales}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Screenings */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <h2 className="text-lg font-semibold mb-3">Recent Screenings</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Movie</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hall</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tickets Sold</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seat Availability</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap">Inception</td>
                                    <td className="px-6 py-4 whitespace-nowrap">Hall A</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">In Progress</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">95/120</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-green-600 font-medium">$2,375</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-yellow-600">Limited</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap">The Dark Knight</td>
                                    <td className="px-6 py-4 whitespace-nowrap">Hall B</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Starting Soon</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">91/120</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-green-600 font-medium">$2,275</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-red-600">Almost Full</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
}