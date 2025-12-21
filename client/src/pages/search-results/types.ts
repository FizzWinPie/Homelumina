export type ZipCodeData = {
  zipcode: string
  city: string
  state: string
  latitude: number
  longitude: number
  population: number
  medianprice: number
  meanincome: number
  healthratio: number
  policedepartmentscount: string
  numpoliceofficerscount: string
  hospitalscount: string | null
  firestationscount: string | null
  firefighterscount: string | null
  childcarecenterscount: string
}

export type Filters = {
  city: string | null
  state: string
  minPrice: number
  maxPrice: number
  minIncome: number
  maxIncome: number
  healthMeasure: string
  maxHealthRatio: number
  minPoliceDepts: number
  minPoliceOfficers: number
  minHospitals: number
  minFireStations: number
  minFirefighters: number
  minChildcare: number
  minPopulation: number
  maxPopulation: number
}

export type HealthMeasure = {
  measure: string
  measure_count: string
  min_population: number
  max_population: number
}