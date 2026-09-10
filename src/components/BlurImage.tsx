import { useEffect, useRef, useState } from "react";
import { decode } from "blurhash";

interface Props {
  src: string;
  alt: string;
  blurhash: string;
  width: number;
  height: number;
  className?: string;
}

export default function BlurImage({ src, alt, blurhash, width, height, className = "" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pixels = decode(blurhash, 32, 32);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const imageData = ctx.createImageData(32, 32);
    imageData.data.set(pixels);
    ctx.putImageData(imageData, 0, 0);
  }, [blurhash]);

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ aspectRatio: `${width}/${height}` }}>
      {/* BlurHash placeholder */}
      <canvas
        ref={canvasRef}
        width={32}
        height={32}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${loaded ? "opacity-0" : "opacity-100"}`}
        style={{ imageRendering: "auto", filter: "blur(0px)" }}
        aria-hidden
      />
      {/* Real image */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
