import React, { useContext, useEffect, useMemo, useState, useRef } from 'react';
import { TransactionContext } from '../context/TransactionContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet, faArrowTrendUp, faArrowTrendDown, faFilePdf, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const Dashboard = () => {
    const { transactions, loading, fetchTransactions } = useContext(TransactionContext);
    const chartRef = useRef(null);

    const now = new Date();
    const [viewMode, setViewMode] = useState('month'); // 'month' or 'year'
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

    // Fetch data scoped to selection
    useEffect(() => {
        if (viewMode === 'month') {
            fetchTransactions({ year: selectedYear, month: selectedMonth });
        } else {
            fetchTransactions({ year: selectedYear });
        }
        // eslint-disable-next-line
    }, [viewMode, selectedYear, selectedMonth]);

    // Totals
    const { generalTotal, specialTotal, titheTotal, totalOfferings, totalExpenses, balance } = useMemo(() => {
        let gen = 0, spec = 0, tith = 0, exp = 0;
        transactions.forEach(t => {
            gen += t.generalOffering || 0;
            spec += t.specialOffering || 0;
            tith += t.tithe || 0;
            exp += t.expenses || 0;
        });
        const offerings = gen + spec + tith;
        return { generalTotal: gen, specialTotal: spec, titheTotal: tith, totalOfferings: offerings, totalExpenses: exp, balance: offerings - exp };
    }, [transactions]);

    // Doughnut Chart
    const doughnutData = {
        labels: ['General Offering', 'Special Offerings', 'Tithe', 'Expenses'],
        datasets: [{
            data: [generalTotal, specialTotal, titheTotal, totalExpenses],
            backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(59, 130, 246, 0.8)', 'rgba(168, 85, 247, 0.8)', 'rgba(239, 68, 68, 0.8)'],
            borderColor: ['#10B981', '#3B82F6', '#A855F7', '#EF4444'],
            borderWidth: 1,
        }],
    };

    // Bar Chart — monthly breakdown when viewing a year
    const barData = useMemo(() => {
        if (viewMode !== 'year') return null;

        const monthlyData = Array.from({ length: 12 }, () => ({ offerings: 0, expenses: 0 }));
        transactions.forEach(t => {
            const m = new Date(t.date).getMonth();
            monthlyData[m].offerings += (t.generalOffering || 0) + (t.specialOffering || 0) + (t.tithe || 0);
            monthlyData[m].expenses += t.expenses || 0;
        });

        return {
            labels: MONTH_NAMES.map(m => m.substring(0, 3)),
            datasets: [
                {
                    label: 'Offerings',
                    data: monthlyData.map(d => d.offerings),
                    backgroundColor: 'rgba(16, 185, 129, 0.7)',
                    borderRadius: 4,
                },
                {
                    label: 'Expenses',
                    data: monthlyData.map(d => d.expenses),
                    backgroundColor: 'rgba(239, 68, 68, 0.7)',
                    borderRadius: 4,
                },
            ],
        };
    }, [transactions, viewMode]);

    // Helper: load image as base64 data URL
    const loadImageAsBase64 = (url) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                canvas.getContext('2d').drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = () => resolve(null);
            img.src = url;
        });
    };

    // PDF Export with charts, proof images, and data table
    const handleExportPDF = async () => {
        const doc = new jsPDF({ orientation: 'landscape' });
        const periodLabel = viewMode === 'month'
            ? `${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`
            : `Year ${selectedYear}`;

        doc.setFontSize(18);
        doc.text(`FMS Financial Report — ${periodLabel}`, 14, 18);
        doc.setFontSize(10);
        doc.setTextColor(120);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 26);

        // Summary
        doc.setTextColor(0);
        doc.setFontSize(11);
        doc.text(`Total Offerings: ${totalOfferings.toLocaleString()}   |   Total Expenses: ${totalExpenses.toLocaleString()}   |   Balance Fund: ${balance.toLocaleString()}`, 14, 34);

        let tableStartY = 42;

        // Embed chart visualization
        if (chartRef.current) {
            try {
                const canvas = chartRef.current.canvas;
                const chartImg = canvas.toDataURL('image/png');
                doc.addImage(chartImg, 'PNG', 14, tableStartY, 90, 60);
                tableStartY += 68;
            } catch (e) {
                console.warn('Could not embed chart:', e);
            }
        }

        // Table with proof column
        const cols = ["Date", "Gen. Off.", "Spec. Off.", "Spec. Names", "Tithe", "Tithe Names", "Expenses", "Details", "Remarks", "Proof"];
        const rows = transactions.map(tx => [
            new Date(tx.date).toLocaleDateString(),
            tx.generalOffering || 0,
            tx.specialOffering || 0,
            tx.specialOfferingNames || '-',
            tx.tithe || 0,
            tx.titheNames || '-',
            tx.expenses || 0,
            tx.expenseDetails || '-',
            tx.remarks || '-',
            tx.proofUrl ? 'Yes (see appendix)' : 'None'
        ]);
        rows.push(['TOTAL', generalTotal, specialTotal, '', titheTotal, '', totalExpenses, '', `Bal: ${balance.toLocaleString()}`, '']);
        autoTable(doc, { head: [cols], body: rows, startY: tableStartY, theme: 'grid', styles: { fontSize: 7 }, headStyles: { fillColor: [99, 102, 241] } });

        // --- Proof Appendix: embed each proof image on its own page ---
        const proofsWithDates = transactions.filter(tx => tx.proofUrl);
        if (proofsWithDates.length > 0) {
            for (let i = 0; i < proofsWithDates.length; i++) {
                const tx = proofsWithDates[i];
                const imgUrl = `http://localhost:5000${tx.proofUrl}`;
                const base64 = await loadImageAsBase64(imgUrl);

                doc.addPage();
                doc.setFontSize(14);
                doc.setTextColor(0);
                doc.text(`Proof ${i + 1} of ${proofsWithDates.length}`, 14, 16);
                doc.setFontSize(10);
                doc.setTextColor(100);
                doc.text(`Date: ${new Date(tx.date).toLocaleDateString()}  |  Expenses: ${tx.expenses || 0}  |  ${tx.expenseDetails || tx.remarks || ''}`, 14, 24);

                if (base64) {
                    try {
                        doc.addImage(base64, 'PNG', 14, 32, 260, 150);
                    } catch (e) {
                        doc.setTextColor(200, 0, 0);
                        doc.text('Could not embed this proof image (unsupported format or PDF file).', 14, 40);
                        doc.setTextColor(0);
                        doc.text(`Direct link: ${imgUrl}`, 14, 50);
                    }
                } else {
                    doc.setTextColor(100);
                    doc.text(`Proof file (non-image format): ${imgUrl}`, 14, 40);
                }
            }
        }

        doc.save(`FMS_Report_${periodLabel.replace(/\s/g, '_')}.pdf`);
    };

    // Period label
    const periodLabel = viewMode === 'month' ? `${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}` : `Year ${selectedYear}`;

    if (loading) return <div className="loading-container">Loading Dashboard...</div>;

    return (
        <div className="dashboard-page animate-fade-in">
            <div className="page-header d-flex justify-between align-center">
                <div>
                    <h1>Financial Overview</h1>
                    <p className="text-muted">Visualize and export your church finances.</p>
                </div>
                <button onClick={handleExportPDF} className="btn-primary export-btn">
                    <FontAwesomeIcon icon={faFilePdf} /> Export PDF
                </button>
            </div>

            {/* View Mode + Period Selector */}
            <div className="card period-selector-card">
                <div className="period-controls">
                    <div className="view-toggle">
                        <button className={`toggle-btn ${viewMode === 'month' ? 'active' : ''}`} onClick={() => setViewMode('month')}>Monthly</button>
                        <button className={`toggle-btn ${viewMode === 'year' ? 'active' : ''}`} onClick={() => setViewMode('year')}>Yearly</button>
                    </div>

                    <div className="period-nav">
                        <button className="nav-arrow" onClick={() => {
                            if (viewMode === 'month') {
                                if (selectedMonth === 1) { setSelectedMonth(12); setSelectedYear(selectedYear - 1); }
                                else setSelectedMonth(selectedMonth - 1);
                            } else {
                                setSelectedYear(selectedYear - 1);
                            }
                        }}><FontAwesomeIcon icon={faChevronLeft} /></button>
                        <span className="period-label">{periodLabel}</span>
                        <button className="nav-arrow" onClick={() => {
                            if (viewMode === 'month') {
                                if (selectedMonth === 12) { setSelectedMonth(1); setSelectedYear(selectedYear + 1); }
                                else setSelectedMonth(selectedMonth + 1);
                            } else {
                                setSelectedYear(selectedYear + 1);
                            }
                        }}><FontAwesomeIcon icon={faChevronRight} /></button>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="summary-grid">
                <div className="card summary-card balance-card">
                    <div className="card-icon"><FontAwesomeIcon icon={faWallet} /></div>
                    <div className="card-data">
                        <h3>Balance Fund</h3>
                        <h2 style={{ color: balance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                            {balance.toLocaleString()}
                        </h2>
                    </div>
                </div>
                <div className="card summary-card income-card">
                    <div className="card-icon"><FontAwesomeIcon icon={faArrowTrendUp} /></div>
                    <div className="card-data">
                        <h3>Total Offerings</h3>
                        <h2>{totalOfferings.toLocaleString()}</h2>
                    </div>
                </div>
                <div className="card summary-card expense-card">
                    <div className="card-icon"><FontAwesomeIcon icon={faArrowTrendDown} /></div>
                    <div className="card-data">
                        <h3>Total Expenses</h3>
                        <h2>{totalExpenses.toLocaleString()}</h2>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="dashboard-content-grid">
                <div className="card chart-card">
                    <h3>Fund Breakdown — {periodLabel}</h3>
                    <div className="chart-container">
                        {transactions.length > 0 ? (
                            <Doughnut ref={chartRef} data={doughnutData} options={{ maintainAspectRatio: false }} />
                        ) : (
                            <p className="no-data">No records for this period.</p>
                        )}
                    </div>
                </div>

                <div className="card chart-card">
                    <h3>{viewMode === 'year' ? `Monthly Comparison — ${selectedYear}` : 'Offering Breakdown'}</h3>
                    <div className="chart-container">
                        {viewMode === 'year' && barData ? (
                            <Bar data={barData} options={{
                                maintainAspectRatio: false,
                                plugins: { legend: { labels: { color: '#94A3B8' } } },
                                scales: {
                                    x: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                                    y: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
                                }
                            }} />
                        ) : transactions.length > 0 ? (
                            <div className="breakdown-list">
                                <div className="breakdown-item"><span className="dot" style={{ backgroundColor: '#10B981' }}></span> General Offering <strong>{generalTotal.toLocaleString()}</strong></div>
                                <div className="breakdown-item"><span className="dot" style={{ backgroundColor: '#3B82F6' }}></span> Special Offerings <strong>{specialTotal.toLocaleString()}</strong></div>
                                <div className="breakdown-item"><span className="dot" style={{ backgroundColor: '#A855F7' }}></span> Tithe <strong>{titheTotal.toLocaleString()}</strong></div>
                                <div className="breakdown-item"><span className="dot" style={{ backgroundColor: '#EF4444' }}></span> Expenses <strong>{totalExpenses.toLocaleString()}</strong></div>
                            </div>
                        ) : (
                            <p className="no-data">No data available.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
