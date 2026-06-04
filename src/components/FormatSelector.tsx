import { FORMAT_GROUPS } from '../config/conversionRules'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './ui/select'

interface FormatSelectorProps {
  id: string
  label: string
  value: string
  disabled?: boolean
  formats?: readonly string[]
  onChange: (format: string) => void
}

export function FormatSelector({ id, label, value, disabled = false, formats, onChange }: FormatSelectorProps) {
  return (
    <label className="format-select" htmlFor={id}>
      <span>{label}</span>
      <Select value={value} onValueChange={(nextValue) => onChange(nextValue ?? '')} disabled={disabled}>
        <SelectTrigger id={id} className="format-select__trigger" aria-label={label}>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent className="format-select__content">
          {formats
            ? formats.map((format) => (
                <SelectItem key={format} value={format}>
                  {format.toUpperCase()}
                </SelectItem>
              ))
            : FORMAT_GROUPS.map((group) => (
                <SelectGroup key={group.category}>
                  <SelectLabel>{group.category}</SelectLabel>
                  {group.formats.map((format) => (
                    <SelectItem key={format} value={format}>
                      {format.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
        </SelectContent>
      </Select>
    </label>
  )
}
