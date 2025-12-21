"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Search, Loader2, Landmark } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import { API_ENDPOINTS } from "@/config/api"
import { useDebouncedState } from "@/lib/hooks"
import type { Suggestion } from "@/components/HeroSection"
import { useNavigate } from "react-router"

export default function CompareWithOtherCity({ currentCity, currentState }: { currentCity: string | undefined, currentState: string | undefined }) {
  const {
    value: query,
    debouncedValue: debouncedQuery,
    setValue: setQuery
  } = useDebouncedState("", 500)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [hasValidSelection, setHasValidSelection] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const navigate = useNavigate()

  const { data: autocompleteSuggestions, isFetching } = useQuery({
    queryKey: ["autocomplete", debouncedQuery],
    queryFn: async () => {
      const response = await fetch(API_ENDPOINTS.autocomplete(debouncedQuery, 100))
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await response.json()
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch autocomplete data')
      }
      return result.data.suggestions as unknown as Suggestion[]
    },
    select: (data) => {
      return data.filter((suggestion) => suggestion.matchtype === "City")
    },
    initialData: [],
    enabled: debouncedQuery.length > 0,
  })

  useEffect(() => {
    if (query.length > 0 && !hasValidSelection && autocompleteSuggestions.length > 0) {
      setIsOpen(true)
      setSelectedIndex(-1)
    } else {
      setIsOpen(false)
      setSelectedIndex(-1)
    }
  }, [query, hasValidSelection, autocompleteSuggestions])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // If numbers are entered, don't update the query
    if (/^\d+$/.test(e.target.value)) {
      return
    }
    setQuery(e.target.value)
    setHasValidSelection(false)
  }

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setQuery(suggestion.value)
    setHasValidSelection(true)
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => (prev < autocompleteSuggestions.length - 1 ? prev + 1 : prev))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0) {
          handleSuggestionClick(autocompleteSuggestions[selectedIndex])
        }
        break
      case "Escape":
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleSubmit = () => {
    if (hasValidSelection && currentCity && currentState) {
      navigate(`/comparison?q=${encodeURIComponent(`${currentCity}, ${currentState}`)}&r=${encodeURIComponent(query)}`)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (!currentCity || !currentState) {
    return null
  }

  return (
    <div className="relative w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          {isFetching ? (
            <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 animate-spin" />
          ) : (
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          )}
          <Input
            ref={inputRef}
            type="text"
            placeholder="Enter comparison city..."
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="pl-10 bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
          />
        </div>
        <Button
          onClick={handleSubmit}
          disabled={!hasValidSelection}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
        >
          Compare
        </Button>
      </div>

      {isOpen && autocompleteSuggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto"
        >
          {autocompleteSuggestions.map((suggestion, index) => (
            <div
              key={suggestion.value}
              className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
                index === selectedIndex
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <Landmark className="h-4 w-4 text-gray-500 drk:text-gray-400" />
              <span className="text-sm">{suggestion.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
