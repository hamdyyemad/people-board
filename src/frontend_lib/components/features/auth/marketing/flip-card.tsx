"use client";

import { ReactNode } from "react";

interface FlipCardProps {
  isFlipped: boolean;
  frontContent: ReactNode;
  backContent: ReactNode;
}

export function FlipCard({
  isFlipped,
  frontContent,
  backContent,
}: FlipCardProps) {
  return (
    <div className="relative">
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .flip-container {
            perspective: 1000px;
            width: 100%;
            min-height: 400px;
          }
          
          .flip-card {
            position: relative;
            width: 100%;
            min-height: 400px;
            transform-style: preserve-3d;
            transition: transform 0.6s ease-in-out;
            cursor: pointer;
          }
          
          .flip-card.flipped {
            transform: rotateY(180deg);
          }
          
          .flip-card-inner {
            position: relative;
            width: 100%;
            height: 100%;
            transform-style: preserve-3d;
          }
          
          .flip-card-front,
          .flip-card-back {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            padding-top: 1rem;
            background: transparent;
          }
          
          .flip-card-back {
            transform: rotateY(180deg);
          }
        `,
        }}
      />

      <div className="flip-container">
        <div className={`flip-card ${isFlipped ? "flipped" : ""}`}>
          <div className="flip-card-inner">
            <div className="flip-card-front">
              <div className="w-full">{frontContent}</div>
            </div>
            {/* Only render back content when flipped to avoid DOM pollution */}
            {isFlipped && (
              <div className="flip-card-back">
                <div className="w-full">{backContent}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
