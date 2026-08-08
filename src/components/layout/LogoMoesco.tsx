import Image from 'next/image'

interface Props {
  /** Altezza in px. La larghezza scala proporzionalmente (ratio 1103:366 ≈ 3.01:1). */
  height?: number
  className?: string
}

export default function LogoMoesco({ height = 38, className = '' }: Props) {
  const w = Math.round(height * (1103 / 366))
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
