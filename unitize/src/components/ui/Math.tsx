"use client";

import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import katex from 'katex';

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
    // Remove any dollar signs that might be wrapping the expression
    let cleanMath = mathStr;
    if (cleanMath.startsWith('$') && cleanMath.endsWith('$')) {
      cleanMath = cleanMath.slice(1, -1);
    }
    
    // Handle common LaTeX command patterns that might need escaping
    cleanMath = cleanMath.trim();

    // We don't want to pre-process with katex.renderToString because it can throw errors
    // that would prevent rendering. Instead, we'll just ensure proper escaping.
    
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
export const MathText: React.FC<{ text: any; className?: string }> = ({ 
  text, 
  className = '' 
}) => {
  // Safety check for undefined or null input
  if (text === undefined || text === null) {
    return <span className="text-yellow-500">[No content]</span>;
  }
  
  // Ensure text is a string
  const textStr = String(text);
  
  try {
    // First, detect if this text has special LaTeX patterns
    const containsLaTeXPattern = /\\(?:lim|frac|sum|int|infty|sqrt|left|right|overrightarrow|vec|dot|times|cdot|div|pm|mp|geq|leq|neq|approx|sin|cos|tan)/.test(textStr);
    const containsSubscriptPattern = /_\{.*?\}/.test(textStr);
    const containsSuperscriptPattern = /\^\{.*?\}/.test(textStr);
    const containsMathSymbols = /\\(?:to|infty|theta|alpha|beta|gamma|delta|epsilon|pi|sigma)/.test(textStr);
    const hasLimitPattern = /lim.*?\{.*?\}.*?frac/.test(textStr.replace(/\s/g, ''));
    
    // Special handling for limit expressions - these are very specific patterns used in AP Calculus
    // "Evaluate the limit: \lim_{x \to 2} \frac{x^2 - 4}{x - 2}"
    if (hasLimitPattern) {
      // For text with "Evaluate the limit:" type of prefix
      if (textStr.includes(':')) {
        const parts = textStr.split(':');
        const textPart = parts[0].trim() + ':';
        const mathPart = parts.slice(1).join(':').trim();
        
        return (
          <span className={className}>
            <span>{textPart}</span> <Math math={mathPart} block={true} />
          </span>
        );
      } else {
        // It's a standalone limit expression
        return <Math math={textStr} block={true} />;
      }
    }
    
    // Case 1: If the text contains obvious LaTeX commands and looks like a math expression
    if (containsLaTeXPattern || 
        (containsSubscriptPattern && containsSuperscriptPattern) || 
        (containsMathSymbols && !textStr.includes(' '))) {
      return <Math math={textStr} block={textStr.includes('\\frac') || textStr.length > 25} />;
    }
    
    // Case 2: If it has dollar sign delimiters (mixed math and text), split by them
    const hasDelimiters = textStr.includes('$');
    if (hasDelimiters) {
      const parts = textStr.split(/(\$[^\$]+\$)/g);
      return (
        <span className={className}>
          {parts.map((part, index) => {
            // Check if this part is a LaTeX expression (surrounded by $)
            if (part && part.startsWith('$') && part.endsWith('$')) {
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
    }
    
    // Case 3: Normal text, possibly with some math-like symbols but not a full expression
    return <span className={className}>{textStr}</span>;
  } catch (error) {
    console.error('Error processing math text:', error);
    return <span className="text-gray-600">{textStr}</span>;
  }
};