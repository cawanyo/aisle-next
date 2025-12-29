"use client";

import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, MinusCircle, Wallet, TrendingDown, PiggyBank, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Import autoTable

interface BudgetViewProps {
  phases: any[];
}

export default function BudgetView({ phases }: BudgetViewProps) {
  
  // Helpers
  const formatMoney = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(amount);

  // --- CALCULATIONS (Updated to use realCost) ---
  const totalEstimated = phases.reduce((acc, p) => acc + p.tasks.reduce((t:any, task:any) => t + (task.estimatedCost||0), 0), 0);
  const totalReal = phases.reduce((acc, p) => acc + p.tasks.reduce((t:any, task:any) => t + (task.realCost||0), 0), 0);
  const totalBalance = totalEstimated - totalReal;

  // --- PDF GENERATION FUNCTION ---
  const generatePDF = () => {
    const doc = new jsPDF();

    // 1. Header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text("Wedding Budget Overview", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const dateStr = new Date().toLocaleDateString();
    doc.text(`Generated on: ${dateStr}`, 14, 28);

    // 2. Summary Box in PDF
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(14, 35, 180, 25, 3, 3, 'FD');
    
    doc.setFontSize(10);
    doc.text(`Estimated: ${formatMoney(totalEstimated)}`, 20, 50);
    doc.text(`Real Cost: ${formatMoney(totalReal)}`, 80, 50);
    
    // Color code the balance in PDF
    if(totalBalance >= 0) doc.setTextColor(22, 163, 74); // Green
    else doc.setTextColor(220, 38, 38); // Red
    doc.text(`Remaining: ${formatMoney(totalBalance)}`, 140, 50);

    // 3. Prepare Table Data
    const tableBody: any[] = [];

    phases.forEach((phase) => {
      // Phase Totals
      const phaseEst = phase.tasks.reduce((acc: number, t: any) => acc + (t.estimatedCost || 0), 0);
      const phaseReal = phase.tasks.reduce((acc: number, t: any) => acc + (t.realCost || 0), 0);
      
      // A. PHASE HEADER ROW (Acts like a section header)
      tableBody.push([{ 
        content: phase.title.toUpperCase(), 
        colSpan: 5, 
        styles: { fillColor: [240, 240, 240], fontStyle: 'bold', textColor: [60, 60, 60] } 
      }]);

      // B. TASK ROWS
      phase.tasks.forEach((task: any) => {
        const diff = (task.estimatedCost || 0) - (task.realCost || 0);
        
        tableBody.push([
          task.title,
          task.estimatedCost > 0 ? formatMoney(task.estimatedCost) : "-",
          task.realCost > 0 ? formatMoney(task.realCost) : "-",
          { 
            content: (task.estimatedCost > 0 || task.realCost > 0) ? formatMoney(diff) : "-",
            styles: { textColor: diff < 0 ? [220, 38, 38] : [22, 163, 74], fontStyle: 'bold' }
          },
          diff < 0 ? "Over Budget" : "On Track"
        ]);
      });

      // C. PHASE SUBTOTAL ROW
      tableBody.push([
        { content: "Subtotal", styles: { fontStyle: 'bold', halign: 'right' } },
        { content: formatMoney(phaseEst), styles: { fontStyle: 'bold' } },
        { content: formatMoney(phaseReal), styles: { fontStyle: 'bold' } },
        "",
        ""
      ]);
    });

    // 4. Generate Table
    autoTable(doc, {
      startY: 70,
      head: [['Item', 'Estimated', 'Real Cost', 'Difference', 'Status']],
      body: tableBody,
      theme: 'grid', // Gives the Excel look
      headStyles: { fillColor: [44, 44, 44], textColor: 255 }, // Dark Header
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 'auto' }, // Item
        1: { cellWidth: 30, halign: 'right' }, // Est
        2: { cellWidth: 30, halign: 'right' }, // Real
        3: { cellWidth: 30, halign: 'right' }, // Diff
        4: { cellWidth: 30, halign: 'center' }, // Status
      },
      // Draw totals at bottom
      foot: [[
        'GRAND TOTAL', 
        formatMoney(totalEstimated), 
        formatMoney(totalReal), 
        formatMoney(totalBalance), 
        totalBalance >= 0 ? "Under Budget" : "Over Budget"
      ]],
      footStyles: { fillColor: [255, 230, 230], textColor: [0,0,0], fontStyle: 'bold', halign: 'right' }
    });

    doc.save("wedding-budget.pdf");
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      
      {/* --- HEADER ACTIONS --- */}
      <div className="flex justify-end">
        <button 
          onClick={generatePDF}
          className="flex items-center gap-2 bg-stone-500 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-rose-600 transition-colors shadow-lg shadow-stone-200"
        >
          <Download className="w-4 h-4" />
          Export PDF
        </button>
      </div>

      {/* --- 1. TOP SUMMARY SECTION --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        
        {/* Total Budget Card */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-stone-100 shadow-sm relative overflow-hidden group">
          <div className="absolute right-6 top-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet className="w-10 h-10 md:w-12 md:h-12 text-stone-900" />
          </div>
          <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-2">Total Budget</p>
          <p className="text-3xl md:text-4xl font-serif font-bold text-stone-800">{formatMoney(totalEstimated)}</p>
          <div className="mt-4 h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
             <div className="h-full bg-stone-500 w-full opacity-20"></div>
          </div>
        </div>

        {/* Total Spent Card */}
        <div className="bg-stone-500 text-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-stone-200 relative overflow-hidden">
          <div className="absolute right-6 top-6 opacity-20">
            <TrendingDown className="w-10 h-10 md:w-12 md:h-12 text-white" />
          </div>
          <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-2">Total Spent</p>
          <p className="text-3xl md:text-4xl font-serif font-bold text-white">{formatMoney(totalReal)}</p>
          {/* Progress Bar */}
          <div className="mt-4 flex items-center gap-3">
             <div className="flex-1 h-1.5 bg-stone-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-rose-500 transition-all duration-1000" 
                  style={{ width: `${totalEstimated > 0 ? Math.min((totalReal / totalEstimated) * 100, 100) : 0}%` }} 
                />
             </div>
             <span className="text-xs font-medium text-stone-400">
               {totalEstimated > 0 ? ((totalReal / totalEstimated) * 100).toFixed(0) : 0}%
             </span>
          </div>
        </div>

        {/* Remaining Card */}
        <div className={cn("p-6 md:p-8 rounded-[2rem] border relative overflow-hidden transition-colors", 
          totalBalance >= 0 ? "bg-green-50/60 border-green-100" : "bg-red-50/60 border-red-100"
        )}>
          <div className="absolute right-6 top-6 opacity-10">
            <PiggyBank className={cn("w-10 h-10 md:w-12 md:h-12", totalBalance >= 0 ? "text-green-800" : "text-red-800")} />
          </div>
          <p className={cn("text-xs font-bold uppercase tracking-widest mb-2", totalBalance >= 0 ? "text-green-700" : "text-red-700")}>
            Remaining
          </p>
          <p className={cn("text-3xl md:text-4xl font-serif font-bold", totalBalance >= 0 ? "text-green-800" : "text-red-800")}>
            {totalBalance >= 0 ? "+" : ""}{formatMoney(totalBalance)}
          </p>
          <p className={cn("text-xs font-bold mt-4 px-3 py-1 rounded-full inline-block", totalBalance >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
             {totalBalance >= 0 ? "Under Budget" : "Over Budget"}
          </p>
        </div>
      </div>

      {/* --- 2. THE CONTENT LIST --- */}
      <div className="space-y-8">
        {phases.map((phase) => {
          // Calculations using realCost
          const phaseEst = phase.tasks.reduce((acc: number, t: any) => acc + (t.estimatedCost || 0), 0);
          const phaseReal = phase.tasks.reduce((acc: number, t: any) => acc + (t.realCost || 0), 0);

          return (
            <div key={phase.id} className="bg-white rounded-3xl border border-stone-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
              
              {/* --- PHASE HEADER --- */}
              <div className="bg-stone-50/50 px-6 py-5 md:px-8 md:py-6 border-b border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center font-serif font-bold text-stone-600 shadow-sm shrink-0">
                      {phase.title.charAt(0)}
                   </div>
                   <div>
                      <h3 className="font-serif text-lg md:text-xl font-bold text-stone-800">{phase.title}</h3>
                      <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">{phase.tasks.length} items</p>
                   </div>
                </div>

                {/* Totals Pill */}
                <div className="flex bg-white rounded-xl px-4 py-3 border border-stone-100 shadow-sm gap-4 md:gap-8 justify-between md:justify-start">
                   <div>
                     <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Estimated</p>
                     <p className="font-medium text-stone-600">{formatMoney(phaseEst)}</p>
                   </div>
                   <div className="w-px bg-stone-100 h-full"></div>
                   <div className="text-right md:text-left">
                     <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Real Cost</p>
                     <p className="font-bold text-stone-900">{formatMoney(phaseReal)}</p>
                   </div>
                </div>
              </div>

              {/* --- RESPONSIVE LIST --- */}
              <div className="w-full">
                
                {/* Desktop Headers */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-4 border-b border-stone-50 bg-white">
                  <div className="col-span-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Item Details</div>
                  <div className="col-span-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest text-right">Est. Cost</div>
                  <div className="col-span-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest text-right">Real Cost</div>
                  <div className="col-span-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest text-right">Diff</div>
                  <div className="col-span-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest text-center">Status</div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-stone-50">
                    {phase.tasks.map((task: any) => {
                      const diff = (task.estimatedCost || 0) - (task.realCost || 0);
                      const isOverBudget = diff < 0;
                      const hasSpending = task.realCost > 0;

                      return (
                        <div key={task.id} className="hover:bg-stone-50/50 transition-colors group p-4 md:px-8 md:py-5 grid grid-cols-2 md:grid-cols-12 gap-y-4 md:gap-4 items-center">
                          
                          {/* 1. Title */}
                          <div className="col-span-2 md:col-span-4 flex items-center justify-between md:justify-start">
                             <span className="font-medium text-stone-700 text-sm md:text-base group-hover:text-stone-900 transition-colors">
                                {task.title}
                             </span>
                             <div className="md:hidden">
                                {!hasSpending ? (
                                   <MinusCircle className="w-4 h-4 text-stone-200" />
                                 ) : isOverBudget ? (
                                   <AlertCircle className="w-4 h-4 text-red-500" />
                                 ) : (
                                   <CheckCircle2 className="w-4 h-4 text-green-500" />
                                 )}
                             </div>
                          </div>

                          {/* 2. Estimated */}
                          <div className="col-span-1 md:col-span-2 flex flex-col md:items-end">
                             <span className="md:hidden text-[10px] text-stone-400 uppercase font-bold">Est. Cost</span>
                             {task.estimatedCost > 0 ? (
                               <span className="text-sm text-stone-500 font-medium">{formatMoney(task.estimatedCost)}</span>
                             ) : <span className="text-stone-300">-</span>}
                          </div>

                          {/* 3. Real */}
                          <div className="col-span-1 md:col-span-2 flex flex-col items-end">
                             <span className="md:hidden text-[10px] text-stone-400 uppercase font-bold">Real Cost</span>
                             {task.realCost > 0 ? (
                               <span className="text-sm text-stone-900 font-bold">{formatMoney(task.realCost)}</span>
                             ) : <span className="text-stone-300">-</span>}
                          </div>

                          {/* 4. Difference */}
                          <div className="col-span-2 md:col-span-2 flex md:justify-end items-center justify-between md:w-auto mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-0 border-stone-50">
                             <span className="md:hidden text-[10px] text-stone-400 uppercase font-bold">Difference</span>
                             {(task.estimatedCost > 0 || task.realCost > 0) ? (
                               <span className={cn("px-2.5 py-1 rounded-lg text-xs font-bold", isOverBudget ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600")}>
                                 {diff >= 0 ? "+" : ""}{formatMoney(diff)}
                               </span>
                             ) : <span className="text-stone-300">-</span>}
                          </div>

                          {/* 5. Desktop Status Icon */}
                          <div className="hidden md:flex col-span-2 justify-center">
                               {!hasSpending ? (
                                 <MinusCircle className="w-4 h-4 text-stone-200" />
                               ) : isOverBudget ? (
                                 <div className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 shadow-sm">
                                    <AlertCircle className="w-4 h-4" />
                                 </div>
                               ) : (
                                 <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-50 text-green-500 shadow-sm">
                                    <CheckCircle2 className="w-4 h-4" />
                                 </div>
                               )}
                          </div>

                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}