import Image from "next/image";

// Local images (/images/…, /uploads/…) go through Next's optimizer;
// anything else (an external URL) falls back to a plain <img>.
export default function Photo({ src, alt, fill, width, height, sizes, priority, className = "" }) {
  if (!src) return null;
  if (src.startsWith("/")) {
    return <Image src={src} alt={alt} fill={fill} width={width} height={height} sizes={sizes} priority={priority} className={className} />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={`${fill ? "absolute inset-0 size-full" : ""} ${className}`}
      loading={priority ? "eager" : "lazy"}
    />
  );
}
