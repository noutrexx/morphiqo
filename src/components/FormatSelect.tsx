import { FORMAT_GROUPS } from '../data/formats'

interface FormatSelectProps {
  id: string
  label: string
  value: string
  onChange: (format: string) => void
}

export function FormatSelect({ id, label, value, onChange }: FormatSelectProps) {
  return (
    <label className="format-select" htmlFor={id}>
      <span>{label}</span>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Seç</option>
        {FORMAT_GROUPS.map((group) => (
          <optgroup key={group.category} label={group.category}>
            {group.formats.map((format) => (
              <option key={format} value={format}>
                {format.toUpperCase()}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  )
}
