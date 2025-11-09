'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

type RecordType = {
  start_time: string
  expected_end_time: string
  line_speed_actual: number
  linear_weight_actual: number
  rpm_timestamp: string
  rpm_speed: number
  time_taken_s: number
}

export default function Dashboard() {
  const [data, setData] = useState<RecordType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const getSession = async () => {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) router.push('/')
      else fetchData()
    }
    getSession()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('http://localhost:8080/xl-json')
      const json = await res.json()
      setData(json.data || [])
    } catch (err) {
      setError('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Merged Data Viewer</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && data.length > 0 && (
        <div className="overflow-auto">
          <table className="border-collapse w-full text-sm border">
            <thead className="bg-gray-200">
              <tr>
                {Object.keys(data[0]).map((key) => (
                  <th key={key} className="border p-2 text-left">{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="hover:bg-gray-100">
                  {Object.values(row).map((value, j) => (
                    <td key={j} className="border p-2">{String(value)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
