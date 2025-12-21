// Mock data for testing - simulates database responses

const mockFacilitiesData = [
  {
    id: 1,
    name: 'Test Childcare Center 1',
    type: 'childcare',
    zipcode: '19104',
    city: 'Philadelphia',
    rating: 4.5,
    address: '123 Test St, Philadelphia, PA 19104',
    phone: '215-555-0101',
    website: 'https://test1.com'
  },
  {
    id: 2,
    name: 'Test Hospital 1',
    type: 'hospital',
    zipcode: '19104',
    city: 'Philadelphia',
    rating: 4.8,
    address: '456 Test Ave, Philadelphia, PA 19104',
    phone: '215-555-0102',
    website: 'https://test2.com'
  },
  {
    id: 3,
    name: 'Test Police Station 1',
    type: 'police',
    zipcode: '19104',
    city: 'Philadelphia',
    rating: 4.2,
    address: '789 Test Blvd, Philadelphia, PA 19104',
    phone: '215-555-0103',
    website: 'https://test3.com'
  }
];

const mockRealEstateData = [
  {
    id: 1,
    address: '123 Main St, Philadelphia, PA 19104',
    price: 250000,
    bedrooms: 3,
    bathrooms: 2,
    square_feet: 1500,
    zipcode: '19104',
    city: 'Philadelphia',
    listing_date: '2024-01-15'
  },
  {
    id: 2,
    address: '456 Oak Ave, Philadelphia, PA 19104',
    price: 350000,
    bedrooms: 4,
    bathrooms: 3,
    square_feet: 2000,
    zipcode: '19104',
    city: 'Philadelphia',
    listing_date: '2024-01-20'
  }
];

const mockAnalyticsData = {
  safetyToSaleRatio: [
    {
      city: 'Philadelphia',
      safety_score: 85,
      avg_price: 275000,
      ratio: 0.31
    },
    {
      city: 'New York',
      safety_score: 78,
      avg_price: 450000,
      ratio: 0.17
    }
  ],
  facilitiesToPopulation: [
    {
      zipcode: '19104',
      facilities_count: 15,
      population: 25000,
      ratio: 0.0006
    }
  ],
  // Updated to match actual database response structure
  growthLeaders: [
    {
      zipcode: '19104',
      city: 'Philadelphia',
      state: 'PA',
      population: 25000,
      listing_count: '15',
      avg_price: 275000,
      min_price: 200000,
      max_price: 350000,
      price_tier: 'High',
      growth_rate: 12.5  // Added for test compatibility
    },
    {
      zipcode: '19102',
      city: 'Philadelphia',
      state: 'PA',
      population: 18000,
      listing_count: '12',
      avg_price: 320000,
      min_price: 250000,
      max_price: 400000,
      price_tier: 'High',
      growth_rate: 15.2  // Added for test compatibility
    }
  ],
  hospitalDistanceByPrice: [
    {
      zipcode: '19104',
      city: 'Philadelphia',
      state: 'PA',
      population: 25000,
      avg_price: 275000,
      hospital_count: '3',
      price_tier: 'High',
      hospital_access: 'Multiple Hospitals',
      avg_distance: 2.5  // Added for test compatibility
    },
    {
      zipcode: '19102',
      city: 'Philadelphia',
      state: 'PA',
      population: 18000,
      avg_price: 320000,
      hospital_count: '1',
      price_tier: 'High',
      hospital_access: 'Single Hospital',
      avg_distance: 1.8  // Added for test compatibility
    }
  ],
  affordableZipcodes: [
    {
      zipcode: '19104',
      city: 'Philadelphia',
      state: 'PA',
      population: 25000,
      listing_count: '15',
      avg_price: 250000,
      min_price: 200000,
      max_price: 300000,
      affordability_level: 'Affordable'
    }
  ],
  underservedHealthcare: [
    {
      zipcode: '19104',
      city: 'Philadelphia',
      state: 'PA',
      population: 25000,
      hospital_count: '1',
      healthcare_level: 'Single Hospital',
      healthcare_score: '65',
      avg_price: '275000',
      childcare_count: '5',
      healthcare_access_score: 65  // Added for test compatibility
    }
  ],
  facilitiesPopulation: [
    {
      zipcode: '19104',
      city: 'Philadelphia',
      state: 'PA',
      population: 25000,
      childcare_count: 5,
      hospital_count: 3,
      police_count: 2,
      firefighter_count: 1,
      total_facilities: 11,
      facilities_per_10k: 0.44,
      ratio: 0.44
    }
  ],
  homepageFeatured: [
    {
      zipcode: '19104',
      hospital_count: 3,
      police_count: 2,
      firefighter_count: 1,
      total_facilities: 6,
      avg_poor_health_ratio: 18.5,
      health_measures_count: 6,
      population: 25000,
      meanincome: 45000,
      staffing_service_score: 0.600,
      health_service_score: 0.788,
      service_level_score: 0.139,
      rank: 1
    }
  ],
  locationPage: [
    {
      zipcode: '19104',
      facilities: {
        firefighter: 1,
        hospitals: 3,
        police: 2,
        total: 6
      },
      healthMetrics: {
        avgPoorHealthRatio: 18.5,
        healthMeasuresCount: 6,
        population: 25000
      },
      income: {
        meanIncome: 45000
      },
      scores: {
        staffingServiceScore: 0.6,
        healthServiceScore: 0.79,
        serviceLevelScore: 0.14,
        rank: 1
      },
      analysis: {
        serviceLevel: 'Critical Service Level',
        healthStatus: 'Excellent Health Outcomes',
        facilityStatus: 'Critically Underserved'
      }
    }
  ],
  cityGrowthRate: [
    {
      city: 'Philadelphia',
      state: 'PA',
      growthRate3Year: 0.12,
      growthRate5Year: 0.18,
      analysis: {
        trend: 'Upward',
        notes: 'Strong growth in recent years.'
      }
    }
  ],
  similarCities: [
    {
      city: 'Philadelphia',
      state: 'PA',
      similarity_score: 0.92,
      population: 25000,
      avg_price: 275000
    }
  ],
  similarZipcodes: [
    {
      zipcode: '19104',
      similarity_score: 0.85,
      population: 25000,
      avg_price: 275000
    }
  ],
  underservedZipcodes: [
    {
      zipcode: '19104',
      facility_count: 5,
      population: 25000,
      underserved_level: 'Critical'
    }
  ],
  default: []
};

const mockHealthData = {
  tables: [
    'childcarecenters',
    'hospitals',
    'policestations',
    'firefighterstations',
    'zipcode',
    'localmarket',
    'healthmeasure',
    'householdincome'
  ],
  sampleData: {
    childcarecenters: [
      {
        id: 1,
        name: 'Sample Childcare Center 1',
        zipcode: '19104',
        rating: 4.5,
        address: '123 Childcare St, Philadelphia, PA 19104',
        phone: '215-555-0101',
        latitude: 39.9526,
        longitude: -75.1652
      },
      {
        id: 2,
        name: 'Sample Childcare Center 2',
        zipcode: '19104',
        rating: 4.2,
        address: '456 Childcare Ave, Philadelphia, PA 19104',
        phone: '215-555-0102',
        latitude: 39.9526,
        longitude: -75.1652
      }
    ],
    hospitals: [
      {
        id: 1,
        name: 'Sample Hospital 1',
        zipcode: '19104',
        rating: 4.8,
        address: '123 Hospital St, Philadelphia, PA 19104',
        phone: '215-555-0201'
      }
    ],
    policestations: [
      {
        id: 1,
        name: 'Sample Police Station 1',
        zipcode: '19104',
        address: '456 Police Ave, Philadelphia, PA 19104',
        phone: '215-555-0301'
      }
    ],
    firefighterstations: [
      {
        id: 1,
        name: 'Sample Fire Station 1',
        zipcode: '19104',
        address: '789 Fire Blvd, Philadelphia, PA 19104',
        phone: '215-555-0401'
      }
    ],
    localmarket: [
      {
        id: 1,
        zipcode: '19104',
        market_data: 'Sample market data for 19104'
      }
    ]
  }
};

const mockErrorResponses = {
  databaseError: {
    code: 'ECONNREFUSED',
    message: 'Database connection failed'
  },
  validationError: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid input parameters'
  },
  notFoundError: {
    code: 'NOT_FOUND',
    message: 'Resource not found'
  }
};

const mockRequestData = {
  validZipcode: '19104',
  invalidZipcode: '123',
  validCity: 'Philadelphia',
  invalidCity: '',
  validLimit: '5',
  invalidLimit: '-1',
  validPrice: '300000',
  invalidPrice: 'abc'
};

module.exports = {
  mockFacilitiesData,
  mockRealEstateData,
  mockAnalyticsData,
  mockHealthData,
  mockErrorResponses,
  mockRequestData
}; 