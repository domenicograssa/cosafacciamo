import Image from 'next/image'

interface Props {
  /** Altezza in px del logo. La larghezza scala proporzionalmente. */
  height?: number
  className?: string
}

export default function LogoMoesco({ height = 40, className = '' }: Props) {
  // Rapporto 1536x1024 → larghezza = height * 1.5
  const w = Math.round(height * 1.5)
  return (
    <Image
      src="/logo-moesco.png"
      alt="moesco"
      width={w}
      height={height}
      priority
      className={className}
      style={{ objectFit: 'contain' }}
    />
  )
}
