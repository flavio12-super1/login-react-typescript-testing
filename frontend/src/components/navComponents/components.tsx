import { useEffect, useRef } from "react";
import ReactDOM from "react-dom";

export const Portal = ({ children }: { children: React.ReactNode }) => {
  const portalContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const portalContainer = document.createElement("div");
    document.body.appendChild(portalContainer);
    portalContainerRef.current = portalContainer;

    return () => {
      if (portalContainerRef.current) {
        document.body.removeChild(portalContainerRef.current);
      }
    };
  }, []);

  if (!portalContainerRef.current) {
    return null; // or any fallback UI if needed
  }

  return ReactDOM.createPortal(children, portalContainerRef.current);
};
