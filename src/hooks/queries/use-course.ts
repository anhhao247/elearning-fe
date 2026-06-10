import { useQuery } from '@tanstack/react-query'
import { getSearchSuggestions } from '@/lib/services/course.service'
import { SearchSuggestionsResponse } from '@/types/course'

export function useSearchSuggestions(keyword: string) {
  return useQuery<SearchSuggestionsResponse>({
    queryKey: ['search-suggestions', keyword],
    queryFn: () => getSearchSuggestions(keyword),
    enabled: !!keyword.trim(),
    staleTime: 1000 * 60 * 5,
  })
}
