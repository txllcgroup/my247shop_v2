"use client";
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClientOnly from '@/components/ClientOnly';

// Mock datasets for the Customer Acquisition Growth Chart (organic, non-round figures ending at 25,483)
const dataSets = {
  daily: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    newCustomers: [409, 516, 629, 493, 732, 817, 584],
    accumulated: [21712, 22228, 22857, 23350, 24082, 24899, 25483],
    growthRate: '+17.4%',
    activeUsers: '25,483',
    chartTitle: 'Daily Signups (Last 7 Days)'
  },
  weekly: {
    labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6'],
    newCustomers: [1859, 2147, 2418, 2695, 3182, 3624],
    accumulated: [11417, 13564, 15982, 18677, 21859, 25483],
    growthRate: '+123.2%',
    activeUsers: '25,483',
    chartTitle: 'Weekly Signups (Last 6 Weeks)'
  },
  monthly: {
    labels: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
    newCustomers: [2193, 2614, 2986, 3519, 4184, 4972],
    accumulated: [7208, 9822, 12808, 16327, 20511, 25483],
    growthRate: '+253.5%',
    activeUsers: '25,483',
    chartTitle: 'Monthly Acquisition (Last 6 Months)'
  },
  yearly: {
    labels: ['2022', '2023', '2024', '2025', '2026'],
    newCustomers: [1478, 3117, 4682, 6429, 9142],
    accumulated: [2113, 5230, 9912, 16341, 25483],
    growthRate: '+1106.0%',
    activeUsers: '25,483',
    chartTitle: 'Yearly Customer Base Growth'
  }
};

// Initial support tickets mock data
const initialTickets = [
  {
    id: 'TKT-942',
    storeName: 'SleekKicks NG',
    owner: 'Damilola Adebayo',
    title: 'Paystack integration returning API signature mismatch',
    category: 'Gateway Error',
    priority: 'CRITICAL',
    status: 'Open',
    time: '4 mins ago',
    avatar: 'DA'
  },
  {
    id: 'TKT-940',
    storeName: 'Moda Collection',
    owner: 'Sarah Connor',
    title: 'Custom domain DNS validation timeout after 24 hours',
    category: 'Domain DNS',
    priority: 'HIGH',
    status: 'Open',
    time: '28 mins ago',
    avatar: 'SC'
  },
  {
    id: 'TKT-938',
    storeName: 'GadgetZone Ltd',
    owner: 'Chinedu Okafor',
    title: 'Bulk CSV catalog upload failing with status 504 gateway timeout',
    category: 'Catalog System',
    priority: 'HIGH',
    status: 'Pending',
    time: '2 hours ago',
    avatar: 'CO'
  },
  {
    id: 'TKT-935',
    storeName: 'Bloom Aromas',
    owner: 'Amara Nwachukwu',
    title: 'AI Product Description Assistant generating HTML syntax markers',
    category: 'AI Assistant',
    priority: 'MEDIUM',
    status: 'Open',
    time: '4 hours ago',
    avatar: 'AN'
  },
  {
    id: 'TKT-931',
    storeName: 'Urban Threads',
    owner: 'Kelechi Egwu',
    title: 'How to download invoice history for monthly platform fees',
    category: 'Billing',
    priority: 'LOW',
    status: 'Resolved',
    time: '1 day ago',
    avatar: 'KE'
  }
];

// Initial platform credit logs
const initialCreditLogs = [
  { id: 'TX-5204', store: 'Zara Hub', type: 'Refund', amount: 85.00, desc: 'AI assistant credit rebate for system outage', time: '10 mins ago', status: 'Completed' },
  { id: 'TX-5203', store: 'Urban Threads', type: 'Promotion', amount: 150.00, desc: 'Marketing bonus credit allocation', time: '2 hours ago', status: 'Completed' },
  { id: 'TX-5202', store: 'Alpha Tech', type: 'Purchase', amount: 500.00, desc: 'Enterprise pack credit purchase', time: '4 hours ago', status: 'Completed' },
  { id: 'TX-5201', store: 'Olu Fashion', type: 'Gift', amount: 25.00, desc: 'Onboarding support credit gift', time: 'Yesterday', status: 'Completed' }
];

export default function AdminPage() {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [ticketFilter, setTicketFilter] = useState<'All' | 'Critical/High' | 'Pending' | 'Resolved'>('All');
  
  // Interactive Support Tickets State
  const [tickets, setTickets] = useState(initialTickets);
  const [activeTicketAction, setActiveTicketAction] = useState<{id: string, action: string} | null>(null);
  
  // Interactive Platform Credit System State
  const [creditLogs, setCreditLogs] = useState(initialCreditLogs);
  const [distributedCredits, setDistributedCredits] = useState(84250);
  const [allocationStore, setAllocationStore] = useState('');
  const [allocationAmount, setAllocationAmount] = useState('');
  const [allocationType, setAllocationType] = useState('Promotion');
  const [showCreditToast, setShowCreditToast] = useState(false);
  
  // SVG Chart Dimensions & Computations
  const svgRef = useRef<SVGSVGElement>(null);
  const currentDataSet = useMemo(() => dataSets[timeframe], [timeframe]);

  const chartParams = useMemo(() => {
    const width = 1000;
    const height = 350;
    const paddingLeft = 80;
    const paddingRight = 40;
    const paddingTop = 50;
    const paddingBottom = 60;
    const plotWidth = width - paddingLeft - paddingRight;
    const plotHeight = height - paddingTop - paddingBottom;

    const values = currentDataSet.newCustomers;
    const maxVal = Math.max(...values) * 1.15;
    const minVal = Math.min(...values) * 0.85;

    const points = values.map((val, i) => {
      const x = paddingLeft + (i * plotWidth) / (values.length - 1);
      const y = (height - paddingBottom) - ((val - minVal) * plotHeight) / (maxVal - minVal);
      return { x, y, value: val, accumulated: currentDataSet.accumulated[i], label: currentDataSet.labels[i] };
    });

    // Generate SVG path strings
    const linePath = points.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');

    const areaPath = linePath ? `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z` : '';

    return { points, linePath, areaPath, width, height, paddingLeft, paddingRight, paddingTop, paddingBottom, maxVal, minVal };
  }, [currentDataSet]);

  // Dynamic stats computations based on current timeframe
  const dynamicStats = useMemo(() => {
    // Total Users
    const totalUsers = currentDataSet.accumulated[currentDataSet.accumulated.length - 1];
    
    // Calculate growth percentage based on first vs last of accumulated array
    const acc = currentDataSet.accumulated;
    const firstAcc = acc[0];
    const lastAcc = acc[acc.length - 1];
    let growthRateVal = '';
    
    if (timeframe === 'yearly' && acc.length >= 2) {
      const prevAcc = acc[acc.length - 2];
      growthRateVal = `+${(((lastAcc - prevAcc) / prevAcc) * 100).toFixed(1)}%`;
    } else {
      growthRateVal = `+${(((lastAcc - firstAcc) / firstAcc) * 100).toFixed(1)}%`;
    }

    // Dynamic Sparkline computation (100x20 space)
    const minVal = Math.min(...acc);
    const maxVal = Math.max(...acc);
    const range = maxVal - minVal || 1;
    const sparkPoints = acc.map((val, i) => {
      const x = (i / (acc.length - 1)) * 100;
      const y = 18 - ((val - minVal) / range) * 16;
      return { x, y };
    });
    const sparklinePath = sparkPoints.map((pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `L ${pt.x} ${pt.y}`)).join(' ');
    const sparklineArea = `${sparklinePath} L 100 20 L 0 20 Z`;

    // Dynamic Revenue allocation based on selected timeframe
    const revenueData = {
      daily: { amount: 6150, growth: '+4.8%', label: 'daily average' },
      weekly: { amount: 42880, growth: '+8.5%', label: 'weekly recurring' },
      monthly: { amount: 184520, growth: '+15.2%', label: 'monthly recurring' },
      yearly: { amount: 2214240, growth: '+53.4%', label: 'annual recurring' }
    };
    const revenue = revenueData[timeframe];

    return {
      totalUsers,
      growthRateVal,
      sparklinePath,
      sparklineArea,
      revenue
    };
  }, [currentDataSet, timeframe]);

  // Chart mouse move handler to track hover interactions
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    
    // Scale mouseX to SVG internal viewBox space (1000 wide)
    const svgX = (mouseX / rect.width) * chartParams.width;

    let closestIndex = 0;
    let minDiff = Infinity;

    chartParams.points.forEach((pt, i) => {
      const diff = Math.abs(svgX - pt.x);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    });

    setHoveredIndex(closestIndex);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  // Ticket Triage Logic
  const handleTicketStatusChange = (id: string, newStatus: string) => {
    setTickets(prev => prev.map(tkt => {
      if (tkt.id === id) {
        return { ...tkt, status: newStatus };
      }
      return tkt;
    }));
    setActiveTicketAction({ id, action: `marked as ${newStatus}` });
    setTimeout(() => setActiveTicketAction(null), 3000);
  };

  const filteredTickets = useMemo(() => {
    if (ticketFilter === 'Critical/High') {
      return tickets.filter(t => t.priority === 'CRITICAL' || t.priority === 'HIGH');
    }
    if (ticketFilter === 'Pending') {
      return tickets.filter(t => t.status === 'Pending');
    }
    if (ticketFilter === 'Resolved') {
      return tickets.filter(t => t.status === 'Resolved');
    }
    return tickets;
  }, [tickets, ticketFilter]);

  // Manual Credit Allocation Tool Submit
  const handleAllocateCredits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocationStore || !allocationAmount) return;

    const amountNum = parseFloat(allocationAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    // Update Platform Credit Ledger
    const newLog = {
      id: `TX-${Math.floor(5200 + Math.random() * 800)}`,
      store: allocationStore,
      type: allocationType,
      amount: amountNum,
      desc: `Admin manual allocation: ${allocationType}`,
      time: 'Just now',
      status: 'Completed'
    };

    setCreditLogs(prev => [newLog, ...prev]);
    setDistributedCredits(prev => prev + amountNum);
    setShowCreditToast(true);
    setAllocationStore('');
    setAllocationAmount('');

    setTimeout(() => setShowCreditToast(false), 4000);
  };

  return (
    <ClientOnly>
      <div className="max-w-[1400px] mx-auto space-y-12 md:space-y-16 animate-in fade-in duration-700 pb-20">
      
      {/* Toast Notification for manual Credit Allocation */}
      <AnimatePresence>
        {showCreditToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 bg-black text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-800"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <span className="block font-bold text-sm">Credits Allocated Successfully</span>
              <span className="text-xs font-medium text-gray-400">Ledger transaction created and logged.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Welcome Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pt-6">
        <div className="w-full md:w-auto space-y-2">
          <div className="inline-flex items-center px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-widest mb-2 border border-emerald-100">
            Platform Operations
          </div>
          <h1 className="text-4xl md:text-6xl font-medium tracking-tight leading-tight text-black">
            Welcome, <span className="font-extrabold">Super Admin</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 font-medium max-w-xl leading-relaxed">
            Monitor commerce growth, allocate credits, and support platform stores in real-time.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              setTimeframe('daily');
              setTickets(initialTickets);
              setCreditLogs(initialCreditLogs);
              setDistributedCredits(84250);
            }}
            className="border-2 border-gray-200 text-black px-6 py-4 rounded-[20px] text-sm font-bold hover:bg-gray-50 hover:border-black transition-all flex items-center gap-2 group whitespace-nowrap"
          >
            <svg className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H17.647" />
            </svg>
            Reset Console State
          </button>
        </div>
      </div>

      {/* Primary Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        
        {/* Stat Card 1: Total Users */}
        <div className="bg-white p-8 rounded-[32px] border-2 border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-center relative overflow-hidden group hover:border-black hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="w-12 h-12 rounded-[18px] flex items-center justify-center bg-purple-50 text-purple-600 border border-purple-100">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-gray-400 font-bold text-[11px] uppercase tracking-[0.2em]">Total Users</h3>
          </div>
          <div className="flex flex-col relative z-10">
            <div className="text-4xl font-bold tracking-tight text-black flex items-baseline gap-1">
              {dynamicStats.totalUsers.toLocaleString()}
            </div>
            <div className="text-[13px] font-semibold text-purple-500 mt-2 flex items-center gap-1.5 capitalize">
              <span>{dynamicStats.growthRateVal} growth base</span>
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
              <span className="text-gray-400 font-normal">{timeframe === 'yearly' ? 'YoY' : 'this period'}</span>
            </div>
          </div>
          {/* Subtle sparkline */}
          <div className="absolute bottom-0 left-0 right-0 h-10 opacity-30 group-hover:opacity-60 transition-all duration-300">
            <svg viewBox="0 0 100 20" className="w-full h-full" preserveAspectRatio="none">
              <path d={dynamicStats.sparklineArea} fill="rgba(168, 85, 247, 0.4)" />
              <path d={dynamicStats.sparklinePath} fill="none" stroke="rgb(168, 85, 247)" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* Stat Card 2: Platform Credits */}
        <div className="bg-white p-8 rounded-[32px] border-2 border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-center relative overflow-hidden group hover:border-black hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="w-12 h-12 rounded-[18px] flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-100">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-gray-400 font-bold text-[11px] uppercase tracking-[0.2em]">Distributed Credits</h3>
          </div>
          <div className="flex flex-col relative z-10">
            <div className="text-4xl font-bold tracking-tight text-black flex items-baseline gap-1">
              ${distributedCredits.toLocaleString()}
            </div>
            <div className="text-[13px] font-semibold text-blue-500 mt-2 flex items-center gap-1.5 capitalize">
              <span>94.8% system quota</span>
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              <span className="text-gray-400 font-normal">active allocations</span>
            </div>
          </div>
          {/* Progress bar inside card */}
          <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: '78%' }} />
          </div>
        </div>

        {/* Stat Card 3: Support Tickets */}
        <div className="bg-white p-8 rounded-[32px] border-2 border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-center relative overflow-hidden group hover:border-black hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="w-12 h-12 rounded-[18px] flex items-center justify-center bg-orange-50 text-orange-600 border border-orange-100">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-gray-400 font-bold text-[11px] uppercase tracking-[0.2em]">Open Tickets</h3>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-white animate-ping absolute top-8 right-8" />
          </div>
          <div className="flex flex-col relative z-10">
            <div className="text-4xl font-bold tracking-tight text-black flex items-baseline gap-1">
              {tickets.filter(t => t.status !== 'Resolved').length} Active
            </div>
            <div className="text-[13px] font-semibold text-rose-500 mt-2 flex items-center gap-1.5 capitalize">
              <span>{tickets.filter(t => t.priority === 'CRITICAL').length} Critical urgency</span>
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
              <span className="text-gray-400 font-normal">triage pending</span>
            </div>
          </div>
        </div>

        {/* Stat Card 4: Platform Revenue (Subscriptions & Fees) */}
        <div className="bg-white p-8 rounded-[32px] border-2 border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-center relative overflow-hidden group hover:border-black hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="w-12 h-12 rounded-[18px] flex items-center justify-center bg-emerald-50 text-emerald-600 border border-emerald-100">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-gray-400 font-bold text-[11px] uppercase tracking-[0.2em]">Platform Revenue</h3>
          </div>
          <div className="flex flex-col relative z-10">
            <div className="text-4xl font-bold tracking-tight text-black flex items-baseline gap-1">
              ${dynamicStats.revenue.amount.toLocaleString()}
            </div>
            <div className="text-[13px] font-semibold text-emerald-600 mt-2 flex items-center gap-1.5 capitalize">
              <span>{dynamicStats.revenue.growth} {dynamicStats.revenue.label}</span>
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <span className="text-gray-400 font-normal">upward trend</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Insights Panel: Interactive SVG Area Chart */}
      <div className="bg-white rounded-[40px] border-2 border-gray-100 p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10 pb-6 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-black tracking-tight mb-1">Customer Acquisition & Base Growth</h3>
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
              {currentDataSet.chartTitle}
            </p>
          </div>

          {/* Timeframe Selectors */}
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-[20px] p-1.5">
            {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTimeframe(t);
                  setHoveredIndex(null);
                }}
                className={`px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-200
                  ${timeframe === t
                    ? 'bg-black text-white shadow-sm'
                    : 'text-gray-500 hover:text-black hover:bg-gray-100/50'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Interactive Area Chart */}
        <div className="relative w-full h-[350px]">
          
          {/* Custom Floating Interactive Tooltip */}
          <AnimatePresence>
            {hoveredIndex !== null && chartParams.points[hoveredIndex] && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="absolute z-20 bg-black text-white p-5 rounded-[24px] shadow-2xl pointer-events-none w-[200px]"
                style={{
                  left: `${(chartParams.points[hoveredIndex].x / chartParams.width) * 100}%`,
                  top: `${(chartParams.points[hoveredIndex].y / chartParams.height) * 100}%`,
                  transform: 'translate(-50%, -120%)'
                }}
              >
                {/* Arrow at bottom of tooltip */}
                <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-black rotate-45" />

                <div className="space-y-3 relative">
                  <span className="block text-[10px] font-black uppercase text-purple-400 tracking-[0.2em]">
                    {chartParams.points[hoveredIndex].label} acquisition
                  </span>
                  
                  <div className="space-y-1">
                    <span className="block text-xl font-black text-white">
                      +{chartParams.points[hoveredIndex].value.toLocaleString()}
                    </span>
                    <span className="block text-[11px] font-bold text-gray-400">
                      New Signups
                    </span>
                  </div>

                  <div className="pt-2 border-t border-gray-800 flex justify-between items-center">
                    <span className="text-[10px] text-gray-400 font-semibold">Total Base</span>
                    <span className="text-xs font-bold text-white">
                      {chartParams.points[hoveredIndex].accumulated.toLocaleString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <svg
            ref={svgRef}
            viewBox={`0 0 ${chartParams.width} ${chartParams.height}`}
            className="w-full h-full select-none"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              {/* Gradient beneath the chart area */}
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.00" />
              </linearGradient>
              
              {/* Subtle line glow */}
              <filter id="lineGlow" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Grid horizontal guidelines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
              const yVal = chartParams.paddingTop + ratio * (chartParams.height - chartParams.paddingTop - chartParams.paddingBottom);
              return (
                <line
                  key={index}
                  x1={chartParams.paddingLeft}
                  y1={yVal}
                  x2={chartParams.width - chartParams.paddingRight}
                  y2={yVal}
                  stroke="#f1f5f9"
                  strokeWidth="1.5"
                  strokeDasharray="4 6"
                />
              );
            })}

            {/* Grid vertical guidelines (for each point) */}
            {chartParams.points.map((pt, i) => (
              <line
                key={i}
                x1={pt.x}
                y1={chartParams.paddingTop}
                x2={pt.x}
                y2={chartParams.height - chartParams.paddingBottom}
                stroke={hoveredIndex === i ? '#e2e8f0' : '#f8fafc'}
                strokeWidth={hoveredIndex === i ? '1.5' : '1'}
              />
            ))}

            {/* Gradient filled area */}
            <motion.path
              key={`area-${timeframe}`}
              animate={{ d: chartParams.areaPath }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              fill="url(#areaGradient)"
            />

            {/* Main glowing chart line */}
            <motion.path
              key={`line-${timeframe}`}
              animate={{ d: chartParams.linePath }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              fill="none"
              stroke="#4f46e5"
              strokeWidth="4"
              strokeLinecap="round"
              filter="url(#lineGlow)"
            />

            {/* Data points nodes */}
            {chartParams.points.map((pt, i) => {
              const isHovered = hoveredIndex === i;
              return (
                <g key={i}>
                  {/* Outer circle pulse glow for hovered element */}
                  {isHovered && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="12"
                      fill="#4f46e5"
                      fillOpacity="0.2"
                      className="transition-all duration-300"
                    />
                  )}
                  {/* Core data point node */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? '6' : '4.5'}
                    fill={isHovered ? '#ffffff' : '#4f46e5'}
                    stroke={isHovered ? '#4f46e5' : '#ffffff'}
                    strokeWidth={isHovered ? '3.5' : '2.5'}
                    className="cursor-pointer transition-all duration-200"
                  />
                </g>
              );
            })}

            {/* X-axis labels */}
            {chartParams.points.map((pt, i) => (
              <text
                key={i}
                x={pt.x}
                y={chartParams.height - chartParams.paddingBottom + 30}
                textAnchor="middle"
                className={`text-[11px] font-bold tracking-wider transition-all duration-200
                  ${hoveredIndex === i ? 'fill-black font-extrabold' : 'fill-gray-400'}`}
              >
                {pt.label}
              </text>
            ))}

            {/* Y-axis metrics values labels */}
            {[0, 0.5, 1].map((ratio, index) => {
              const val = chartParams.maxVal - ratio * (chartParams.maxVal - chartParams.minVal);
              const yVal = chartParams.paddingTop + ratio * (chartParams.height - chartParams.paddingTop - chartParams.paddingBottom);
              return (
                <text
                  key={index}
                  x={chartParams.paddingLeft - 18}
                  y={yVal + 4}
                  textAnchor="end"
                  className="text-[10px] font-bold fill-gray-400 tracking-wider"
                >
                  {Math.round(val).toLocaleString()}
                </text>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Detailed Operations Grid: Credits Allocator and Ticket Triage Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Platform Credit Allocation & Transactions */}
        <div className="lg:col-span-5 space-y-10">
          
          {/* Credit Allocation Interactive Tool */}
          <div className="bg-white rounded-[40px] border-2 border-gray-100 p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
            <div className="mb-6">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                Admin Utilities
              </span>
              <h3 className="text-xl font-bold text-black tracking-tight">Manual Credit Allocator</h3>
              <p className="text-xs text-gray-500 font-semibold mt-1">
                Award promotional, support, or refund credits directly to merchant wallets.
              </p>
            </div>

            <form onSubmit={handleAllocateCredits} className="space-y-6">
              <div className="space-y-2.5">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  Store Slug / Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SleekKicks NG"
                  value={allocationStore}
                  onChange={(e) => setAllocationStore(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-100 focus:border-black focus:bg-white rounded-[20px] px-5 py-4 text-sm font-bold outline-none transition-all placeholder:text-gray-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2.5">
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    Amount (USD)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 50"
                    value={allocationAmount}
                    onChange={(e) => setAllocationAmount(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-gray-100 focus:border-black focus:bg-white rounded-[20px] px-5 py-4 text-sm font-bold outline-none transition-all placeholder:text-gray-300"
                  />
                </div>

                <div className="space-y-2.5">
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    Allocation Type
                  </label>
                  <select
                    value={allocationType}
                    onChange={(e) => setAllocationType(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-gray-100 focus:border-black focus:bg-white rounded-[20px] px-5 py-4 text-sm font-bold outline-none transition-all"
                  >
                    <option value="Promotion">Promotion</option>
                    <option value="Refund">Refund</option>
                    <option value="Gift">Gift</option>
                    <option value="System Rebate">System Rebate</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white py-4.5 rounded-[20px] text-sm font-bold hover:bg-gray-800 transition-all shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Authorize Credit Transfer
              </button>
            </form>
          </div>

          {/* Credit Allocation Ledger Logs */}
          <div className="bg-white rounded-[40px] border-2 border-gray-100 p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col h-[400px]">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
              <h3 className="font-bold text-black text-lg tracking-tight">Credits Allocation Ledger</h3>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                Audited
              </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-4">
              {creditLogs.map((log) => {
                const typeColors: any = {
                  'Refund': 'bg-rose-50 text-rose-600 border-rose-100',
                  'Promotion': 'bg-purple-50 text-purple-600 border-purple-100',
                  'Purchase': 'bg-emerald-50 text-emerald-600 border-emerald-100',
                  'Gift': 'bg-blue-50 text-blue-600 border-blue-100',
                  'System Rebate': 'bg-amber-50 text-amber-600 border-amber-100'
                };

                return (
                  <div key={log.id} className="p-4 bg-gray-50/50 rounded-2xl border-2 border-gray-100 hover:border-black/5 transition-all flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-black text-sm">{log.store}</span>
                        <span className={`px-2 py-0.5 border rounded-full text-[9px] font-black uppercase tracking-wider ${typeColors[log.type] || 'bg-gray-100 text-gray-500'}`}>
                          {log.type}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-gray-500 leading-relaxed">{log.desc}</p>
                      <span className="text-[10px] font-bold text-gray-400 block">{log.time} · ID: {log.id}</span>
                    </div>

                    <div className="text-right">
                      <span className="font-extrabold text-black block text-sm">
                        +${log.amount.toLocaleString()}
                      </span>
                      <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">
                        SECURED
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Support Tickets Triage Queue */}
        <div className="lg:col-span-7">
          
          <div className="bg-white rounded-[40px] border-2 border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.01)] overflow-hidden flex flex-col h-[840px]">
            
            {/* Widget Header with Filter Tabs */}
            <div className="px-8 sm:px-10 py-8 border-b-2 border-gray-100 flex flex-col gap-6 shrink-0 bg-white">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h3 className="font-bold text-black text-xl tracking-tight">Support Ticket Triage</h3>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                    PLATFORM MERCHANTS ISSUE QUEUE
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
                  <span className="text-xs font-black text-rose-600 uppercase tracking-widest bg-rose-50 border border-rose-100 px-3 py-1 rounded-full">
                    {tickets.filter(t => t.status !== 'Resolved').length} Unsolved
                  </span>
                </div>
              </div>

              {/* Triage feedback messages */}
              <AnimatePresence mode="wait">
                {activeTicketAction && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-gray-50 border border-gray-200 text-black text-xs font-bold rounded-xl flex items-center gap-2 uppercase tracking-wide"
                  >
                    <span className="w-1.5 h-1.5 bg-black rounded-full block animate-pulse" />
                    Ticket {activeTicketAction.id} has been {activeTicketAction.action}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {(['All', 'Critical/High', 'Pending', 'Resolved'] as const).map((filter) => {
                  const countMap: any = {
                    'All': tickets.length,
                    'Critical/High': tickets.filter(t => t.priority === 'CRITICAL' || t.priority === 'HIGH').length,
                    'Pending': tickets.filter(t => t.status === 'Pending').length,
                    'Resolved': tickets.filter(t => t.status === 'Resolved').length
                  };

                  return (
                    <button
                      key={filter}
                      onClick={() => setTicketFilter(filter)}
                      className={`px-4 py-2 border rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200
                        ${ticketFilter === filter
                          ? 'bg-black text-white border-black shadow-sm'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-black/50 hover:text-black'}`}
                    >
                      {filter} ({countMap[filter]})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tickets Table / List */}
            <div className="flex-1 overflow-y-auto">
              {filteredTickets.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center border-2 border-dashed border-gray-200 text-gray-300 text-2xl font-bold mb-4">
                    ∅
                  </div>
                  <h4 className="text-sm font-bold text-black mb-1">Queue is clear!</h4>
                  <p className="text-xs text-gray-400 font-semibold max-w-[240px]">
                    No support tickets match the selected filter.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-8 sm:px-10 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                        Merchant / Store
                      </th>
                      <th className="px-8 sm:px-10 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                        Details & Issue
                      </th>
                      <th className="px-8 sm:px-10 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                        Priority
                      </th>
                      <th className="px-8 sm:px-10 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">
                        Triage Options
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-[14px]">
                    <AnimatePresence>
                      {filteredTickets.map((tkt) => {
                        const priorityColors: any = {
                          'CRITICAL': 'text-rose-600 bg-rose-50 border-rose-100 font-black',
                          'HIGH': 'text-orange-600 bg-orange-50 border-orange-100',
                          'MEDIUM': 'text-blue-600 bg-blue-50 border-blue-100',
                          'LOW': 'text-gray-500 bg-gray-100 border-gray-200'
                        };

                        const statusColors: any = {
                          'Open': 'bg-amber-500',
                          'Pending': 'bg-blue-400',
                          'Resolved': 'bg-emerald-500'
                        };

                        return (
                          <tr key={tkt.id} className="hover:bg-gray-50/60 transition-all border-b border-gray-100 last:border-0 group">
                            
                            {/* Merchant Store info */}
                            <td className="px-8 sm:px-10 py-5 align-top">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-black text-white text-xs font-black flex items-center justify-center uppercase shrink-0">
                                  {tkt.avatar}
                                </div>
                                <div className="min-w-0">
                                  <span className="font-bold text-black block truncate text-sm">
                                    {tkt.storeName}
                                  </span>
                                  <span className="text-[11px] font-semibold text-gray-400 truncate block">
                                    {tkt.owner}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Ticket detail issue content */}
                            <td className="px-8 sm:px-10 py-5 align-top">
                              <div className="space-y-1.5 max-w-[280px]">
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-black text-xs bg-gray-100 px-2 py-0.5 rounded border border-gray-200 uppercase">
                                    {tkt.id}
                                  </span>
                                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                                    {tkt.time}
                                  </span>
                                </div>
                                <p className="text-sm font-semibold text-black leading-snug group-hover:text-black transition-colors">
                                  {tkt.title}
                                </p>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block bg-gray-50 px-2 py-0.5 border border-gray-200 rounded w-fit">
                                  {tkt.category}
                                </span>
                              </div>
                            </td>

                            {/* Ticket priority badge */}
                            <td className="px-8 sm:px-10 py-5 align-top">
                              <div className="space-y-2">
                                <span className={`px-3 py-1.5 rounded-full text-[9px] font-bold tracking-wider uppercase border block text-center w-fit ${priorityColors[tkt.priority]}`}>
                                  {tkt.priority}
                                </span>
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-50 border border-gray-100 w-fit">
                                  <span className={`w-1.5 h-1.5 rounded-full ${statusColors[tkt.status]} block`} />
                                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{tkt.status}</span>
                                </div>
                              </div>
                            </td>

                            {/* Ticket quick actions */}
                            <td className="px-8 sm:px-10 py-5 align-top text-right">
                              <div className="flex flex-col gap-1.5 items-end justify-start">
                                {tkt.status !== 'Resolved' && (
                                  <>
                                    <button
                                      onClick={() => handleTicketStatusChange(tkt.id, 'Resolved')}
                                      className="px-4 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 hover:text-white border border-emerald-200 hover:border-emerald-600 text-[11px] font-bold text-emerald-600 transition-all uppercase tracking-wider block"
                                    >
                                      Mark Resolved
                                    </button>
                                    
                                    {tkt.status !== 'Pending' && (
                                      <button
                                        onClick={() => handleTicketStatusChange(tkt.id, 'Pending')}
                                        className="px-4 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 hover:text-white border border-blue-200 hover:border-blue-600 text-[11px] font-bold text-blue-600 transition-all uppercase tracking-wider block"
                                      >
                                        Mark Pending
                                      </button>
                                    )}

                                    <button
                                      onClick={() => {
                                        const newPriority = tkt.priority === 'CRITICAL' ? 'LOW' : 'CRITICAL';
                                        setTickets(prev => prev.map(t => t.id === tkt.id ? { ...t, priority: newPriority } : t));
                                        setActiveTicketAction({ id: tkt.id, action: `priority updated to ${newPriority}` });
                                        setTimeout(() => setActiveTicketAction(null), 3000);
                                      }}
                                      className="px-4 py-1.5 rounded-lg bg-gray-50 hover:bg-black hover:text-white border border-gray-200 hover:border-black text-[11px] font-bold text-gray-600 transition-all uppercase tracking-wider block"
                                    >
                                      Toggle Priority
                                    </button>
                                  </>
                                )}

                                {tkt.status === 'Resolved' && (
                                  <button
                                    onClick={() => handleTicketStatusChange(tkt.id, 'Open')}
                                    className="px-4 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-600 hover:text-white border border-amber-200 hover:border-amber-600 text-[11px] font-bold text-amber-600 transition-all uppercase tracking-wider block"
                                  >
                                    Reopen Ticket
                                  </button>
                                )}
                              </div>
                            </td>

                          </tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              )}
            </div>

            {/* Widget Footer */}
            <div className="px-8 sm:px-10 py-5 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center text-xs text-gray-400 font-semibold shrink-0 uppercase tracking-widest">
              <span>Shift-Triage Logged</span>
              <span>Operator Session: Active</span>
            </div>

          </div>

        </div>

      </div>

    </div>
    </ClientOnly>
  );
}
