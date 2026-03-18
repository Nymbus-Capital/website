"use client";

import { useEffect, useState, useRef } from "react";
import gsap from "gsap";

interface TypewriterEffectProps {
  words: string[];
  className?: string;
}

export default function TypewriterEffect({
  words,
  className = "",
}: TypewriterEffectProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentWord = words[currentWordIndex];
  const typingSpeed = 80;
  const deletingSpeed = 40;
  const pauseDuration = 1500;
  const cursorBlinkSpeed = 530;

  // Cursor blink effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, cursorBlinkSpeed);

    return () => clearInterval(cursorInterval);
  }, []);

  // Animate new characters in
  useEffect(() => {
    if (!containerRef.current) return;
    const chars = containerRef.current.querySelectorAll(".tw-char");
    if (chars.length > 0 && !isDeleting) {
      const lastChar = chars[chars.length - 1];
      if (lastChar) {
        gsap.fromTo(lastChar, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.1 });
      }
    }
  }, [displayedText, isDeleting]);

  // Typing and deleting logic
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (!isDeleting) {
      if (displayedText.length < currentWord.length) {
        timeout = setTimeout(() => {
          setDisplayedText(currentWord.slice(0, displayedText.length + 1));
        }, typingSpeed);
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, pauseDuration);
      }
    } else {
      if (displayedText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, deletingSpeed);
      } else {
        setIsDeleting(false);
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, currentWord, words]);

  return (
    <div ref={containerRef} className={`inline-block ${className}`}>
      {displayedText.split("").map((char, idx) => (
        <span key={idx} className="tw-char">
          {char}
        </span>
      ))}
      <span
        className="text-blue-600 transition-opacity duration-100"
        style={{ opacity: cursorVisible ? 1 : 0 }}
      >
        |
      </span>
    </div>
  );
}