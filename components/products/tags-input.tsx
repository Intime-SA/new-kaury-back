"use client"

import { useState, type KeyboardEvent } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface TagsInputProps {
  value: string[]
  onChange: (tags: string[]) => void
}

export function TagsInput({ value, onChange }: TagsInputProps) {
  const [inputValue, setInputValue] = useState("")

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag()
    }
  }

  const addTag = () => {
    const trimmedValue = inputValue.trim()
    if (trimmedValue && !value.includes(trimmedValue)) {
      onChange([...value, trimmedValue])
      setInputValue("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove))
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder="Agregar etiqueta y presionar Enter"
          className="flex-1"
        />
        <Button type="button" variant="outline" onClick={addTag} disabled={!inputValue.trim()}>
          Agregar
        </Button>
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {value.map((tag, index) => (
            <div key={index} className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full text-sm">
              {tag}
              <Button type="button" variant="ghost" size="icon" className="h-4 w-4 ml-1" onClick={() => removeTag(tag)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
