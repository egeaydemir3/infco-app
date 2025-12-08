'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type DemographicsChartsProps = {
  gender: {
    MALE: number
    FEMALE: number
    OTHER: number
    unknown: number
  }
  ageRange: {
    '13-17': number
    '18-24': number
    '25-34': number
    '35+': number
    unknown: number
  }
  interests: Record<string, number>
}

const COLORS = {
  gender: ['#ec4899', '#06b6d4', '#a855f7', '#6b7280'], // Pink, Cyan, Purple, Gray
  ageRange: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#6b7280'], // Blue, Purple, Pink, Amber, Gray
  interests: ['#ec4899', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'], // Various colors
}

const genderLabels: Record<string, string> = {
  MALE: 'Erkek',
  FEMALE: 'Kadın',
  OTHER: 'Diğer',
  unknown: 'Belirtilmemiş',
}

const ageRangeLabels: Record<string, string> = {
  '13-17': '13-17',
  '18-24': '18-24',
  '25-34': '25-34',
  '35+': '35+',
  unknown: 'Belirtilmemiş',
}

export default function DemographicsCharts({ gender, ageRange, interests }: DemographicsChartsProps) {
  // Gender data
  const genderData = [
    { name: genderLabels.MALE, value: gender.MALE },
    { name: genderLabels.FEMALE, value: gender.FEMALE },
    { name: genderLabels.OTHER, value: gender.OTHER },
    { name: genderLabels.unknown, value: gender.unknown },
  ].filter((item) => item.value > 0)

  // Age range data
  const ageRangeData = [
    { name: ageRangeLabels['13-17'], value: ageRange['13-17'] },
    { name: ageRangeLabels['18-24'], value: ageRange['18-24'] },
    { name: ageRangeLabels['25-34'], value: ageRange['25-34'] },
    { name: ageRangeLabels['35+'], value: ageRange['35+'] },
    { name: ageRangeLabels.unknown, value: ageRange.unknown },
  ].filter((item) => item.value > 0)

  // Interests data (top 5)
  const interestsData = Object.entries(interests)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-3 shadow-lg">
          <p className="text-white font-semibold">{data.name}</p>
          <p className="text-gray-300 text-sm">{data.value} kişi</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Cinsiyet Dağılımı */}
      <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
        <h4 className="text-sm font-semibold text-gray-300 mb-4 text-center">Cinsiyet Dağılımı</h4>
        {genderData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.gender[index % COLORS.gender.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-1">
              {genderData.map((item, index) => (
                <div key={item.name} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS.gender[index % COLORS.gender.length] }}
                    ></div>
                    <span className="text-gray-400">{item.name}</span>
                  </div>
                  <span className="text-white font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-gray-400 text-sm text-center py-8">Veri yok</p>
        )}
      </div>

      {/* Yaş Aralığı Dağılımı */}
      <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
        <h4 className="text-sm font-semibold text-gray-300 mb-4 text-center">Yaş Aralığı</h4>
        {ageRangeData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={ageRangeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {ageRangeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.ageRange[index % COLORS.ageRange.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-1">
              {ageRangeData.map((item, index) => (
                <div key={item.name} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS.ageRange[index % COLORS.ageRange.length] }}
                    ></div>
                    <span className="text-gray-400">{item.name}</span>
                  </div>
                  <span className="text-white font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-gray-400 text-sm text-center py-8">Veri yok</p>
        )}
      </div>

      {/* İlgi Alanları */}
      <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
        <h4 className="text-sm font-semibold text-gray-300 mb-4 text-center">İlgi Alanları</h4>
        {interestsData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={interestsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {interestsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.interests[index % COLORS.interests.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-1">
              {interestsData.map((item, index) => (
                <div key={item.name} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS.interests[index % COLORS.interests.length] }}
                    ></div>
                    <span className="text-gray-400">{item.name}</span>
                  </div>
                  <span className="text-white font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-gray-400 text-sm text-center py-8">Veri yok</p>
        )}
      </div>
    </div>
  )
}

