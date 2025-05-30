'use client';

import { useEffect, useRef } from 'react';
import { PerformanceTrend } from '@/lib/services/analyticsService';

interface PerformanceChartProps {
  data: PerformanceTrend;
  className?: string;
}

export default function PerformanceChart({ data, className = '' }: PerformanceChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (chartRef.current && data.dates.length > 0) {
      // This is a placeholder for chart library implementation
      // In a real implementation, you would use Chart.js, D3.js or a similar library
      
      const ctx = chartRef.current.getContext('2d');
      if (!ctx) return;
      
      // Clear the canvas
      ctx.clearRect(0, 0, chartRef.current.width, chartRef.current.height);
      
      // Set canvas dimensions
      const canvasWidth = chartRef.current.width;
      const canvasHeight = chartRef.current.height;
      
      // Calculate chart dimensions
      const padding = 40;
      const chartWidth = canvasWidth - (padding * 2);
      const chartHeight = canvasHeight - (padding * 2);
      
      // Draw axes
      ctx.beginPath();
      ctx.moveTo(padding, padding);
      ctx.lineTo(padding, canvasHeight - padding);
      ctx.lineTo(canvasWidth - padding, canvasHeight - padding);
      ctx.strokeStyle = '#ccc';
      ctx.stroke();
      
      // Draw accuracy line
      ctx.beginPath();
      data.accuracy.forEach((value, index) => {
        const x = padding + (index * (chartWidth / (data.dates.length - 1)));
        const y = canvasHeight - padding - (value / 100 * chartHeight);
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Draw accuracy points
      data.accuracy.forEach((value, index) => {
        const x = padding + (index * (chartWidth / (data.dates.length - 1)));
        const y = canvasHeight - padding - (value / 100 * chartHeight);
        
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
        ctx.fill();
      });
      
      // Draw question count bars
      const maxQuestions = Math.max(...data.questionCounts, 10);
      const barWidth = chartWidth / data.dates.length / 3;
      
      data.questionCounts.forEach((count, index) => {
        const x = padding + (index * (chartWidth / data.dates.length)) + barWidth;
        const height = (count / maxQuestions) * (chartHeight * 0.5); // Use half the chart height for bars
        
        ctx.fillStyle = 'rgba(16, 185, 129, 0.6)';
        ctx.fillRect(
          x - barWidth / 2, 
          canvasHeight - padding - height, 
          barWidth, 
          height
        );
      });
      
      // Draw x-axis labels (dates)
      ctx.fillStyle = '#666';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      
      data.dates.forEach((date, index) => {
        const x = padding + (index * (chartWidth / (data.dates.length - 1)));
        ctx.fillText(date, x, canvasHeight - padding + 15);
      });
      
      // Draw y-axis labels (accuracy percentage)
      ctx.textAlign = 'right';
      
      for (let i = 0; i <= 100; i += 20) {
        const y = canvasHeight - padding - (i / 100 * chartHeight);
        ctx.fillText(`${i}%`, padding - 5, y + 3);
      }
      
      // Draw secondary y-axis labels (question count)
      ctx.textAlign = 'left';
      
      for (let i = 0; i <= maxQuestions; i += maxQuestions / 5) {
        const y = canvasHeight - padding - (i / maxQuestions * (chartHeight * 0.5));
        ctx.fillText(`${Math.round(i)}`, canvasWidth - padding + 5, y + 3);
      }
      
      // Draw legend
      const legendY = padding / 2;
      
      // Accuracy legend
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(padding, legendY);
      ctx.lineTo(padding + 20, legendY);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(padding + 10, legendY, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
      ctx.fill();
      
      ctx.fillStyle = '#000';
      ctx.textAlign = 'left';
      ctx.font = '12px Arial';
      ctx.fillText('Accuracy', padding + 25, legendY + 4);
      
      // Questions legend
      ctx.fillStyle = 'rgba(16, 185, 129, 0.6)';
      ctx.fillRect(padding + 100, legendY - 5, 15, 10);
      ctx.fillStyle = '#000';
      ctx.fillText('Questions', padding + 120, legendY + 4);
    }
  }, [data]);

  return (
    <div className={`${className}`}>
      <canvas 
        ref={chartRef} 
        width="800" 
        height="400"
        className="w-full h-auto"
      ></canvas>
    </div>
  );
}
