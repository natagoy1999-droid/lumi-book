import { AdaptivePill } from './AdaptivePill'

export function DominantCTA(props: {
  label: string
  onClick: () => void
  score: number
  compactness: 'normal' | 'ultra'
}) {
  return (
    <AdaptivePill
      label={props.label}
      onClick={props.onClick}
      score={props.score}
      role="dominant"
      compactness={props.compactness}
    />
  )
}

