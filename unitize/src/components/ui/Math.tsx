"use client";

import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface MathProps {
  math: string;
  block?: boolean;
  className?: string;
  errorColor?: string;
}

/**
 * A component for rendering LaTeX expressions using KaTeX
 * @param math The LaTeX expression as a string
 * @param block Whether to display as a block (true) or inline (false)
 * @param className Additional CSS classes
 * @param errorColor Color to display when there is a parsing error
 */
export const Math: React.FC<MathProps> = ({
  math,
  block = false,
  className = '',
  errorColor = '#cc0000'
}) => {
  // Safety check for undefined or null input
  if (!math) {
    console.warn('Math component received empty input');
    return <span className="text-yellow-500">[Empty math expression]</span>;
  }
  
  // Make sure math is a string
  const mathStr = String(math);
  
  try {
    // Clean up LaTeX string if needed (handle escaped backslashes from JSON)
    const cleanMath = mathStr.replace(/\\\\(?=([a-zA-Z]+|{|}))/g, '\\');
    
    return block ? (
      <div className={className}>
        <BlockMath math={cleanMath} errorColor={errorColor} />
      </div>
    ) : (
      <span className={className}>
        <InlineMath math={cleanMath} errorColor={errorColor} />
      </span>
    );
  } catch (error) {
    console.error('Error rendering LaTeX:', error);
    return <span className="text-red-500">{mathStr}</span>;
  }
};

/**
 * Process text that might contain LaTeX expressions and render them properly
 * @param text Text potentially containing LaTeX expressions (e.g., "Solve $x^2 + 2x + 1 = 0$")
 */
export const MathText: React.FC<{ text: string; className?: string }> = ({ 
  text, 
  className = '' 
}) => {
  // Split the text by LaTeX delimiters: $...$ for inline math
  const parts = text.split(/(\$[^\$]+\$)/g);
  
  return (
    <span className={className}>
      {parts.map((part, index) => {
        // Check if this part is a LaTeX expression (surrounded by $)
        if (part.startsWith('$') && part.endsWith('$')) {
          // Extract the LaTeX expression without $ symbols
          const mathExpr = part.slice(1, -1);
          return <Math key={index} math={mathExpr} />;
        } else {
          // Regular text
          return <span key={index}>{part}</span>;
        }
      })}
    </span>
  );
};
