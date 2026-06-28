import Image from 'next/image'

interface Props {
  /** Altezza in px. La larghezza scala proporzionalmente (ratio 801:278 ≈ 2.88:1). */
  height?: number
  className?: string
}

export default function LogoMoesco({ height = 38, className = '' }: Props) {
  const w = Math.round(height * (801 / 278))
  return (
    <Image
      src="/logo-moesco-cropped.png"
      alt="moesco"
      width={w}
      height={height}
      priority
      className={className}
      style={{ objectFit: 'contain' }}
    />
  )
}
