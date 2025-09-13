import React, { useEffect, useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  queryValue: string;
  setQueryValue: (query: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading, queryValue, setQueryValue }) => {

  useEffect(() => {
    // This effect is not strictly necessary if App.tsx fully controls the state,
    // but it's good practice for syncing props to state if the component were more complex.
  }, [queryValue]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(queryValue);
  };

  const isDisabled = isLoading || !queryValue.trim();

  return (
  <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 sm:gap-2 mb-8 w-full px-2">
      <input
        type="text"
        value={queryValue}
        onChange={(e) => setQueryValue(e.target.value)}
        placeholder="Describe a mood, vibe, or scene..."
        className="w-full sm:max-w-lg px-4 py-3 sm:py-2 text-base sm:text-lg bg-gray-800 border-2 border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
        disabled={isLoading}
      />
      <button
        type="submit"
        className="px-6 py-3 sm:py-2 text-base sm:text-lg font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
        disabled={isDisabled}
      >
        {isLoading ? 'Searching...' : 'Search'}
      </button>
    </form>
  );
};
