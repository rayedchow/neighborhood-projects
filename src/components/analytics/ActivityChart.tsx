'use client';

import { useEffect, useRef } from 'react';
import { DailyActivity } from '@/lib/services/analyticsService';

interface ActivityChartProps {
  data: DailyActivity[];
  className?: string;
}

export default function ActivityChart({ data, className = '' }: ActivityChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (chartRef.current && data.length > 0) {
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
      
      // Calculate max values for scaling
      const maxQuestions = Math.max(...data.map(d => d.questionCount), 10);
      const maxMinutes = Math.max(...data.map(d => d.minutesStudied), 60);
      const maxFlashcards = Math.max(...data.map(d => d.flashcardsReviewed), 10);
      
      // Draw axes
      ctx.beginPath();
      ctx.moveTo(padding, padding);
      ctx.lineTo(padding, canvasHeight - padding);
      ctx.lineTo(canvasWidth - padding, canvasHeight - padding);
      ctx.strokeStyle = '#ccc';
      ctx.stroke();
      
      // Draw data points
      const barWidth = chartWidth / data.length / 4;
      
      data.forEach((day, index) => {
        const x = padding + (index * (chartWidth / data.length)) + barWidth;
        
        // Questions bar (blue)
        const questionHeight = (day.questionCount / maxQuestions) * chartHeight;
        ctx.fillStyle = 'rgba(59, 130, 246, 0.7)';
        ctx.fillRect(
          x, 
          canvasHeight - padding - questionHeight, 
          barWidth, 
          questionHeight
        );
        
        // Minutes bar (green)
        const minutesHeight = (day.minutesStudied / maxMinutes) * chartHeight;
        ctx.fillStyle = 'rgba(16, 185, 129, 0.7)';
        ctx.fillRect(
          x + barWidth, 
          canvasHeight - padding - minutesHeight, 
          barWidth, 
          minutesHeight
        );
        
        // Flashcards bar (purple)
        const flashcardsHeight = (day.flashcardsReviewed / maxFlashcards) * chartHeight;
        ctx.fillStyle = 'rgba(139, 92, 246, 0.7)';
        ctx.fillRect(
          x + (barWidth * 2), 
          canvasHeight - padding - flashcardsHeight, 
          barWidth, 
          flashcardsHeight
        );
      });
      
      // Draw legend
      const legendY = padding / 2;
      
      // Questions legend
      ctx.fillStyle = 'rgba(59, 130, 246, 0.7)';
      ctx.fillRect(padding, legendY, 20, 10);
      ctx.fillStyle = '#000';
      ctx.font = '12px Arial';
      ctx.fillText('Questions', padding + 25, legendY + 9);
      
      // Minutes legend
      ctx.fillStyle = 'rgba(16, 185, 129, 0.7)';
      ctx.fillRect(padding + 100, legendY, 20, 10);
      ctx.fillStyle = '#000';
      ctx.fillText('Minutes', padding + 125, legendY + 9);
      
      // Flashcards legend
      ctx.fillStyle = 'rgba(139, 92, 246, 0.7)';
      ctx.fillRect(padding + 200, legendY, 20, 10);
      ctx.fillStyle = '#000';
      ctx.fillText('Flashcards', padding + 225, legendY + 9);
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
