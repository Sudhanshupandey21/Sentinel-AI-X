import { useState, useEffect } from "react";
import { Brain, Zap } from "lucide-react";

interface AIThinkingEffectProps {
  onComplete: () => void;
  isVisible: boolean;
}

const THINKING_MESSAGES = [
  "Scanning data...",
  "Analyzing patterns...",
  "Predicting outcome..."
];

const AIThinkingEffect = ({ onComplete, isVisible }: AIThinkingEffectProps) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setCurrentMessageIndex(0);
      setDisplayedText("");
      setIsTyping(false);
      return;
    }

    const currentMessage = THINKING_MESSAGES[currentMessageIndex];
    let charIndex = 0;
    setIsTyping(true);
    setDisplayedText("");

    const typeInterval = setInterval(() => {
      if (charIndex < currentMessage.length) {
        setDisplayedText(currentMessage.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);

        // Wait a bit then move to next message or complete
        setTimeout(() => {
          if (currentMessageIndex < THINKING_MESSAGES.length - 1) {
            setCurrentMessageIndex(prev => prev + 1);
          } else {
            // All messages complete, trigger completion
            setTimeout(onComplete, 800);
          }
        }, 1200);
      }
    }, 80); // Typing speed

    return () => clearInterval(typeInterval);
  }, [currentMessageIndex, isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-card border border-primary/30 rounded-lg p-6 shadow-2xl">
          {/* AI Brain Icon with pulsing effect */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Brain className="w-12 h-12 text-primary" />
              <div className="absolute inset-0 rounded-full border-2 border-primary/20"></div>
              <div className="absolute inset-2 rounded-full border border-primary/15"></div>
            </div>
          </div>

          {/* Thinking Messages */}
          <div className="text-center space-y-4">
            <h3 className="text-lg font-display font-semibold text-primary tracking-wider">
              AI THINKING
            </h3>

            <div className="min-h-[2rem] flex items-center justify-center">
              <p className="text-sm font-mono text-muted-foreground">
                {displayedText}
                {isTyping && <span>|</span>}
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="flex justify-center gap-2 mt-4">
              {THINKING_MESSAGES.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index < currentMessageIndex
                      ? "bg-primary scale-110"
                      : index === currentMessageIndex
                      ? "bg-primary/50 scale-125"
                      : "bg-primary/20"
                  }`}
                />
              ))}
            </div>

            {/* Animated processing bar */}
            <div className="mt-6">
              <div className="h-1 bg-primary/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/60"
                  style={{
                    width: `${((currentMessageIndex + (displayedText.length / THINKING_MESSAGES[currentMessageIndex]?.length)) / THINKING_MESSAGES.length) * 100}%`,
                    transition: "width 0.3s ease-out"
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Subtle background effects */}
          <div className="absolute top-4 right-4">
            <Zap className="w-4 h-4 text-primary/30" />
          </div>
          <div className="absolute bottom-4 left-4">
            <div className="w-2 h-2 rounded-full bg-primary/20"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIThinkingEffect;