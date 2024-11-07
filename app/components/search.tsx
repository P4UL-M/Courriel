'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export function Search() {
  const inputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const router = useRouter();

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(inputRef.current.value.length, inputRef.current.value.length);
    }
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${searchQuery}`);
  };

  return (
    <form onSubmit={handleSearchSubmit} className="w-full">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        ref={inputRef}
        id="search"
        name="q"
        value={searchQuery}
        onChange={handleSearchChange}
        className="w-full py-2 bg-transparent focus:outline-none"
        placeholder="Search"
        autoFocus
      />
    </form>
  );
}
