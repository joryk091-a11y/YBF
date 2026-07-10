import { createContext, useContext, useState, useEffect } from 'react'

const SearchContext = createContext()

export function SearchProvider({ children }) {
  
  const [searchCriteria, setSearchCriteria] = useState(() => {
    const saved = localStorage.getItem('ybf_search_criteria')
    return saved ? JSON.parse(saved) : {
      passengerCount: 1,
      fromCity: 'aden',
      toCity: 'mukalla',
      travelDate: '',
      returnDate: '',
      activeTab: 'one-way'
    }
  })

  
  useEffect(() => {
    localStorage.setItem('ybf_search_criteria', JSON.stringify(searchCriteria))
  }, [searchCriteria])

  const updateSearchCriteria = (updates) => {
    setSearchCriteria(prev => ({ ...prev, ...updates }))
  }

  const setPassengerCount = (count) => {
    updateSearchCriteria({ passengerCount: count })
  }

  return (
    <SearchContext.Provider value={{ searchCriteria, updateSearchCriteria, setPassengerCount }}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider')
  }
  return context
}
