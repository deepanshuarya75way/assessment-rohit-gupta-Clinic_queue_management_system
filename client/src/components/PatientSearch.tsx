import { useState, useEffect } from 'react';
import { listPatients } from '../api/patients';
import { Patient } from '../types';

interface Props {
  onSelect: (patient: Patient) => void;
  placeholder?: string;
}

export default function PatientSearch({ onSelect, placeholder = 'Search by name or phone...' }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await listPatients(query);
        setResults(data);
      } catch { setResults([]); }
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      />
      {loading && <div className="absolute right-3 top-3"><div className="animate-spin h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full" /></div>}
      {results.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto">
          {results.map((p) => (
            <li
              key={p.id}
              className="px-3 py-2 hover:bg-primary-50 cursor-pointer border-b last:border-b-0"
              onClick={() => { onSelect(p); setQuery(''); setResults([]); }}
            >
              <div className="font-medium">{p.fullName}</div>
              <div className="text-sm text-gray-500">{p.phoneNumber}{p.age ? ` | Age: ${p.age}` : ''}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
