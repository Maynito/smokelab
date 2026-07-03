const VIDEO_EXTENSION = /\.(mp4|webm|mov|m4v)(\?.*)?$/i

export function MediaView({
  src,
  alt,
  className,
  controls = false,
}: {
  src: string
  alt: string
  className?: string
  controls?: boolean
}) {
  if (VIDEO_EXTENSION.test(src)) {
    return (
      <video
        src={src}
        autoPlay
        loop
        muted={!controls}
        controls={controls}
        playsInline
        className={className}
      />
    )
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} />
}
